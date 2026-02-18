import { FastifyRequest, FastifyReply } from 'fastify';
import { Route } from '../models/route.js';
import { Stop } from '../models/stop.js';
import { OSRMService } from '../services/osrm.service.js';

const osrmService = new OSRMService();

// ── Interfaces ──────────────────────────────────────────

/** Legacy: create with start/end only */
interface CreateRouteBodyLegacy {
  name: string;
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  fare?: number;
  schedules?: string[];
}

/** New: create from ordered stop IDs + pre-computed edges */
interface EdgePayload {
  fromStop: string;
  toStop: string;
  geometry: { type: string; coordinates: number[][] };
  distance: number; // km
  duration: number; // min
}

interface CreateRouteFromStopsBody {
  name: string;
  stopIds: string[];
  edges: EdgePayload[];
  routeType: 'circular' | 'bidirectional';
}

interface UpdateRouteBody {
  name?: string;
  fare?: number;
  isActive?: boolean;
  schedules?: string[];
}

interface RouteParams {
  id: string;
}

/**
 * GET /api/routes - Get all routes
 */
export const getAllRoutes = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const routes = await Route.find()
      .select('-__v')
      .populate('stops')
      .sort({ createdAt: -1 })
      .lean();

    return reply.status(200).send({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error fetching routes',
    });
  }
};

/**
 * GET /api/routes/active - Get only active routes
 */
export const getActiveRoutes = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const routes = await Route.find({ status: 'Active' })
      .select('name startPoint endPoint distance estimatedTime geometry stops routeType status')
      .populate('stops')
      .lean();

    return reply.status(200).send({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    console.error('Error fetching active routes:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error fetching active routes',
    });
  }
};

/**
 * GET /api/routes/:id - Get route by ID
 */
export const getRouteById = async (
  request: FastifyRequest<{ Params: RouteParams }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const route = await Route.findById(id).lean();

    if (!route) {
      return reply.status(404).send({
        success: false,
        error: 'Route not found',
      });
    }

    return reply.status(200).send({
      success: true,
      data: route,
    });
  } catch (error) {
    console.error('Error fetching route:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error fetching route',
    });
  }
};

/**
 * POST /api/routes - Create a new route (legacy: start/end only)
 */
export const createRoute = async (
  request: FastifyRequest<{ Body: CreateRouteBodyLegacy }>,
  reply: FastifyReply
) => {
  try {
    const { name, startPoint, endPoint, fare, schedules } = request.body;

    // Basic validation
    if (!name || !startPoint || !endPoint) {
      return reply.status(400).send({
        success: false,
        error: 'Name, start point and end point are required',
      });
    }

    // Check if route with same name already exists
    const existingRoute = await Route.findOne({ name });
    if (existingRoute) {
      return reply.status(409).send({
        success: false,
        error: 'A route with this name already exists',
      });
    }

    // Calculate route using OSRM
    console.log('Calculating route with OSRM...');
    const osrmResult = await osrmService.calculateRoute(startPoint, endPoint);

    // Create route in database using English field names
    const newRoute = await Route.create({
      name,
      startPoint,
      endPoint,
      geometry: osrmResult.geometry,
      distance: osrmResult.distance,
      estimatedTime: osrmResult.duration,
      routeType: 'bidirectional',
      status: 'Active',
    });

    return reply.status(201).send({
      success: true,
      message: 'Route created successfully',
      data: newRoute,
    });
  } catch (error: any) {
    console.error('Error creating route:', error);
    
    if (error.message.includes('OSRM')) {
      return reply.status(502).send({
        success: false,
        error: 'Error calculating route with OSRM',
        details: error.message,
      });
    }

    return reply.status(500).send({
      success: false,
      error: 'Error creating route',
      details: error.message,
    });
  }
};

/**
 * POST /api/rutas/crear-desde-paradas - Create a route from ordered stops
 * The frontend sends the stop IDs and the OSRM edges it already computed.
 */
export const createRouteFromStops = async (
  request: FastifyRequest<{ Body: CreateRouteFromStopsBody }>,
  reply: FastifyReply
) => {
  try {
    const { name, stopIds, edges, routeType } = request.body;

    if (!name || !stopIds || stopIds.length < 2 || !edges || edges.length === 0) {
      return reply.status(400).send({
        success: false,
        error: 'Name, at least 2 stopIds, and edges are required',
      });
    }

    // Check duplicate name
    const existingRoute = await Route.findOne({ name });
    if (existingRoute) {
      return reply.status(409).send({
        success: false,
        error: 'A route with this name already exists',
      });
    }

    // Validate that all referenced stops exist (deduplicate IDs for the query)
    const uniqueStopIds = [...new Set(stopIds)];
    const stops = await Stop.find({ _id: { $in: uniqueStopIds } });
    if (stops.length !== uniqueStopIds.length) {
      return reply.status(400).send({
        success: false,
        error: 'One or more stop IDs are invalid',
      });
    }

    // Merge all edge geometries into a single GeoJSON LineString
    const allCoordinates: number[][] = [];
    let totalDistance = 0;
    let totalDuration = 0;

    for (const edge of edges) {
      const coords = edge.geometry?.coordinates || [];
      // Avoid duplicating the junction point between consecutive edges
      if (allCoordinates.length > 0 && coords.length > 0) {
        allCoordinates.push(...coords.slice(1));
      } else {
        allCoordinates.push(...coords);
      }
      totalDistance += edge.distance;
      totalDuration += edge.duration;
    }

    const mergedGeometry = {
      type: 'LineString',
      coordinates: allCoordinates,
    };

    // Derive legacy start/end from first/last stop
    const firstStop = stops.find((s) => s._id.toString() === stopIds[0]);
    const lastStop = stops.find((s) => s._id.toString() === stopIds[stopIds.length - 1]);

    const routeDoc = new Route();
    routeDoc.name = name;
    routeDoc.stops = stopIds as any;
    routeDoc.edges = edges.map((e) => ({
      fromStop: e.fromStop,
      toStop: e.toStop,
      geometry: e.geometry,
      distance: e.distance,
      duration: e.duration,
    })) as any;
    routeDoc.geometry = mergedGeometry;
    routeDoc.distance = totalDistance;
    routeDoc.estimatedTime = totalDuration;
    routeDoc.routeType = routeType;
    routeDoc.status = 'Active';
    if (firstStop) routeDoc.startPoint = { lat: firstStop.location.lat, lng: firstStop.location.lng } as any;
    if (lastStop) routeDoc.endPoint = { lat: lastStop.location.lat, lng: lastStop.location.lng } as any;

    const newRoute = await routeDoc.save();

    // Populate stops for response
    const populated = await Route.findById(newRoute._id).populate('stops').lean();

    return reply.status(201).send({
      success: true,
      message: 'Route created from stops successfully',
      data: populated,
    });
  } catch (error: any) {
    console.error('Error creating route from stops:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error creating route from stops',
      details: error.message,
    });
  }
};

/**
 * POST /api/rutas/calcular-arista - Calculate a single OSRM edge between two stops
 * Used by the frontend route builder to get geometry for each edge as the admin
 * clicks stop-to-stop.
 */
export const calculateEdge = async (
  request: FastifyRequest<{
    Body: { fromStopId: string; toStopId: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const { fromStopId, toStopId } = request.body;

    const [fromStop, toStop] = await Promise.all([
      Stop.findById(fromStopId),
      Stop.findById(toStopId),
    ]);

    if (!fromStop || !toStop) {
      return reply.status(404).send({
        success: false,
        error: 'One or both stops not found',
      });
    }

    const osrmResult = await osrmService.calculateRoute(
      { lat: fromStop.location.lat, lng: fromStop.location.lng },
      { lat: toStop.location.lat, lng: toStop.location.lng }
    );

    return reply.status(200).send({
      success: true,
      data: {
        fromStop: fromStopId,
        toStop: toStopId,
        geometry: osrmResult.geometry,
        distance: osrmResult.distance,
        duration: osrmResult.duration,
      },
    });
  } catch (error: any) {
    console.error('Error calculating edge:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error calculating edge',
      details: error.message,
    });
  }
};

/**
 * PATCH /api/routes/:id - Update a route
 */
export const updateRoute = async (
  request: FastifyRequest<{ Params: RouteParams; Body: UpdateRouteBody }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const updates = request.body;

    // Don't allow updating geometry directly
    if ('geometry' in updates || 'distance' in updates || 'estimatedTime' in updates) {
      return reply.status(400).send({
        success: false,
        error: 'Cannot update geometry directly. Create a new route instead.',
      });
    }

    // Map English field names
    const mappedUpdates: any = {};
    if (updates.name !== undefined) mappedUpdates.name = updates.name;
    if (updates.isActive !== undefined) {
      mappedUpdates.status = updates.isActive ? 'Active' : 'Inactive';
    }

    const updatedRoute = await Route.findByIdAndUpdate(
      id,
      mappedUpdates,
      { new: true, runValidators: true }
    );

    if (!updatedRoute) {
      return reply.status(404).send({
        success: false,
        error: 'Route not found',
      });
    }

    return reply.status(200).send({
      success: true,
      message: 'Route updated successfully',
      data: updatedRoute,
    });
  } catch (error) {
    console.error('Error updating route:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error updating route',
    });
  }
};

/**
 * DELETE /api/routes/:id - Deactivate route (soft delete)
 */
export const deleteRoute = async (
  request: FastifyRequest<{ Params: RouteParams }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const route = await Route.findByIdAndUpdate(
      id,
      { status: 'Inactive' },
      { new: true }
    );

    if (!route) {
      return reply.status(404).send({
        success: false,
        error: 'Route not found',
      });
    }

    return reply.status(200).send({
      success: true,
      message: 'Route deactivated successfully',
      data: route,
    });
  } catch (error) {
    console.error('Error deleting route:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error deactivating route',
    });
  }
};

/**
 * DELETE /api/routes/:id/permanent - Permanently delete a route
 */
export const permanentDeleteRoute = async (
  request: FastifyRequest<{ Params: RouteParams }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const route = await Route.findByIdAndDelete(id);

    if (!route) {
      return reply.status(404).send({
        success: false,
        error: 'Route not found',
      });
    }

    return reply.status(200).send({
      success: true,
      message: 'Route permanently deleted',
    });
  } catch (error) {
    console.error('Error permanently deleting route:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error permanently deleting route',
    });
  }
};

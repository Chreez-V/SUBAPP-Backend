import { FastifyRequest, FastifyReply } from 'fastify';
import { Route } from '../models/route.js';
import { OSRMService } from '../services/osrm.service.js';

const osrmService = new OSRMService();

// Interfaces for type validation
interface CreateRouteBody {
  name: string;
  startPoint: {
    lat: number;
    lng: number;
  };
  endPoint: {
    lat: number;
    lng: number;
  };
  fare?: number;
  schedules?: string[];
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
      .select('name startPoint endPoint distance estimatedTime geometry')
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
 * POST /api/routes - Create a new route
 */
export const createRoute = async (
  request: FastifyRequest<{ Body: CreateRouteBody }>,
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

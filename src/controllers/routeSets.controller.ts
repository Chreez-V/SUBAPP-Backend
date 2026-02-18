import { FastifyRequest, FastifyReply } from 'fastify';
import { RouteSet } from '../models/routeSet.js';
import { Route } from '../models/route.js';

// ── Interfaces ──────────────────────────────────────────

interface CreateRouteSetBody {
  name: string;
  description?: string;
  routeIds?: string[];
}

interface UpdateRouteSetBody {
  name?: string;
  description?: string;
  isActive?: boolean;
}

interface AddRouteBody {
  routeId: string;
}

interface SetActiveRouteBody {
  routeId: string;
}

interface RouteSetParams {
  id: string;
}

// ── Controllers ─────────────────────────────────────────

/**
 * GET /api/conjuntos - List all route sets
 */
export const getAllRouteSets = async (
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const sets = await RouteSet.find()
      .populate({
        path: 'routes',
        populate: { path: 'stops' },
      })
      .populate('activeRoute')
      .sort({ createdAt: -1 })
      .lean();

    return reply.status(200).send({
      success: true,
      count: sets.length,
      data: sets,
    });
  } catch (error) {
    console.error('Error fetching route sets:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al obtener los conjuntos de rutas',
    });
  }
};

/**
 * GET /api/conjuntos/buscar/:id - Get route set by ID
 */
export const getRouteSetById = async (
  request: FastifyRequest<{ Params: RouteSetParams }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const set = await RouteSet.findById(id)
      .populate({
        path: 'routes',
        populate: { path: 'stops' },
      })
      .populate('activeRoute')
      .lean();

    if (!set) {
      return reply.status(404).send({
        success: false,
        error: 'Conjunto no encontrado',
      });
    }

    return reply.status(200).send({
      success: true,
      data: set,
    });
  } catch (error) {
    console.error('Error fetching route set:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al obtener el conjunto',
    });
  }
};

/**
 * POST /api/conjuntos/crear - Create a new route set
 */
export const createRouteSet = async (
  request: FastifyRequest<{ Body: CreateRouteSetBody }>,
  reply: FastifyReply
) => {
  try {
    const { name, description, routeIds } = request.body;

    if (!name) {
      return reply.status(400).send({
        success: false,
        error: 'El nombre es obligatorio',
      });
    }

    // Check duplicate name
    const existing = await RouteSet.findOne({ name });
    if (existing) {
      return reply.status(409).send({
        success: false,
        error: 'Ya existe un conjunto con ese nombre',
      });
    }

    // Validate route IDs if provided
    let validRoutes: string[] = [];
    if (routeIds && routeIds.length > 0) {
      const routes = await Route.find({ _id: { $in: routeIds } });
      if (routes.length !== routeIds.length) {
        return reply.status(400).send({
          success: false,
          error: 'Una o más rutas no existen',
        });
      }
      validRoutes = routeIds;
    }

    const routeSet = new RouteSet({
      name,
      description,
      routes: validRoutes,
      activeRoute: null,
    });

    const saved = await routeSet.save();
    const populated = await RouteSet.findById(saved._id)
      .populate({
        path: 'routes',
        populate: { path: 'stops' },
      })
      .populate('activeRoute')
      .lean();

    return reply.status(201).send({
      success: true,
      message: 'Conjunto creado exitosamente',
      data: populated,
    });
  } catch (error: any) {
    console.error('Error creating route set:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al crear el conjunto',
      details: error.message,
    });
  }
};

/**
 * PATCH /api/conjuntos/actualizar/:id - Update a route set
 */
export const updateRouteSet = async (
  request: FastifyRequest<{ Params: RouteSetParams; Body: UpdateRouteSetBody }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { name, description, isActive } = request.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.status = isActive ? 'Active' : 'Inactive';

    const updated = await RouteSet.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: 'routes',
        populate: { path: 'stops' },
      })
      .populate('activeRoute')
      .lean();

    if (!updated) {
      return reply.status(404).send({
        success: false,
        error: 'Conjunto no encontrado',
      });
    }

    return reply.status(200).send({
      success: true,
      message: 'Conjunto actualizado exitosamente',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating route set:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al actualizar el conjunto',
      details: error.message,
    });
  }
};

/**
 * POST /api/conjuntos/:id/agregar-ruta - Add a route to the set
 */
export const addRouteToSet = async (
  request: FastifyRequest<{ Params: RouteSetParams; Body: AddRouteBody }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { routeId } = request.body;

    const set = await RouteSet.findById(id);
    if (!set) {
      return reply.status(404).send({
        success: false,
        error: 'Conjunto no encontrado',
      });
    }

    // Check route exists
    const route = await Route.findById(routeId);
    if (!route) {
      return reply.status(404).send({
        success: false,
        error: 'Ruta no encontrada',
      });
    }

    // Check if route is already in the set
    if (set.routes.some((r) => r.toString() === routeId)) {
      return reply.status(409).send({
        success: false,
        error: 'La ruta ya pertenece a este conjunto',
      });
    }

    set.routes.push(routeId as any);

    // If this is the first route and there's no activeRoute, set it
    if (set.routes.length === 1 && !set.activeRoute) {
      set.activeRoute = routeId as any;
    }

    await set.save();

    const populated = await RouteSet.findById(id)
      .populate({
        path: 'routes',
        populate: { path: 'stops' },
      })
      .populate('activeRoute')
      .lean();

    return reply.status(200).send({
      success: true,
      message: 'Ruta agregada al conjunto',
      data: populated,
    });
  } catch (error: any) {
    console.error('Error adding route to set:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al agregar la ruta al conjunto',
      details: error.message,
    });
  }
};

/**
 * POST /api/conjuntos/:id/quitar-ruta - Remove a route from the set
 */
export const removeRouteFromSet = async (
  request: FastifyRequest<{ Params: RouteSetParams; Body: AddRouteBody }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { routeId } = request.body;

    const set = await RouteSet.findById(id);
    if (!set) {
      return reply.status(404).send({
        success: false,
        error: 'Conjunto no encontrado',
      });
    }

    set.routes = set.routes.filter((r) => r.toString() !== routeId) as any;

    // If the removed route was the active one, clear activeRoute
    if (set.activeRoute && set.activeRoute.toString() === routeId) {
      set.activeRoute = undefined;
    }

    await set.save();

    const populated = await RouteSet.findById(id)
      .populate({
        path: 'routes',
        populate: { path: 'stops' },
      })
      .populate('activeRoute')
      .lean();

    return reply.status(200).send({
      success: true,
      message: 'Ruta removida del conjunto',
      data: populated,
    });
  } catch (error: any) {
    console.error('Error removing route from set:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al remover la ruta del conjunto',
      details: error.message,
    });
  }
};

/**
 * POST /api/conjuntos/:id/activar-ruta - Switch which route is active in the set
 * Only one route at a time can be active in a set.
 * Deactivates the current active route and activates the new one.
 */
export const setActiveRouteInSet = async (
  request: FastifyRequest<{ Params: RouteSetParams; Body: SetActiveRouteBody }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { routeId } = request.body;

    const set = await RouteSet.findById(id);
    if (!set) {
      return reply.status(404).send({
        success: false,
        error: 'Conjunto no encontrado',
      });
    }

    // Verify the route belongs to this set
    if (!set.routes.some((r) => r.toString() === routeId)) {
      return reply.status(400).send({
        success: false,
        error: 'La ruta no pertenece a este conjunto',
      });
    }

    // Deactivate the currently active route
    if (set.activeRoute) {
      await Route.findByIdAndUpdate(set.activeRoute, { status: 'Inactive' });
    }

    // Activate the new route
    await Route.findByIdAndUpdate(routeId, { status: 'Active' });

    // Update the set
    set.activeRoute = routeId as any;
    await set.save();

    const populated = await RouteSet.findById(id)
      .populate({
        path: 'routes',
        populate: { path: 'stops' },
      })
      .populate('activeRoute')
      .lean();

    return reply.status(200).send({
      success: true,
      message: 'Ruta activa del conjunto actualizada',
      data: populated,
    });
  } catch (error: any) {
    console.error('Error setting active route:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al cambiar la ruta activa',
      details: error.message,
    });
  }
};

/**
 * DELETE /api/conjuntos/eliminar/:id - Permanently delete a route set
 */
export const deleteRouteSet = async (
  request: FastifyRequest<{ Params: RouteSetParams }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const set = await RouteSet.findByIdAndDelete(id);
    if (!set) {
      return reply.status(404).send({
        success: false,
        error: 'Conjunto no encontrado',
      });
    }

    return reply.status(200).send({
      success: true,
      message: 'Conjunto eliminado permanentemente',
    });
  } catch (error) {
    console.error('Error deleting route set:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al eliminar el conjunto',
    });
  }
};

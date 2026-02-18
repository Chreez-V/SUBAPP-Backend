import { FastifyRequest, FastifyReply } from 'fastify';
import { Stop } from '../models/stop.js';

// ── Interfaces ──────────────────────────────────────────
interface CreateStopBody {
  name: string;
  description?: string;
  location: { lat: number; lng: number };
  address?: string;
  referenceLabel?: string;
}

interface UpdateStopBody {
  name?: string;
  description?: string;
  address?: string;
  referenceLabel?: string;
  isActive?: boolean;
}

interface StopParams {
  id: string;
}

// ── GET /api/paradas ────────────────────────────────────
export const getAllStops = async (_req: FastifyRequest, reply: FastifyReply) => {
  try {
    const stops = await Stop.find().select('-__v').sort({ createdAt: -1 }).lean();
    return reply.status(200).send({ success: true, count: stops.length, data: stops });
  } catch (error) {
    console.error('Error fetching stops:', error);
    return reply.status(500).send({ success: false, error: 'Error fetching stops' });
  }
};

// ── GET /api/paradas/activas ────────────────────────────
export const getActiveStops = async (_req: FastifyRequest, reply: FastifyReply) => {
  try {
    const stops = await Stop.find({ status: 'Active' })
      .select('name location address referenceLabel')
      .lean();
    return reply.status(200).send({ success: true, count: stops.length, data: stops });
  } catch (error) {
    console.error('Error fetching active stops:', error);
    return reply.status(500).send({ success: false, error: 'Error fetching active stops' });
  }
};

// ── GET /api/paradas/buscar/:id ─────────────────────────
export const getStopById = async (
  request: FastifyRequest<{ Params: StopParams }>,
  reply: FastifyReply
) => {
  try {
    const stop = await Stop.findById(request.params.id).lean();
    if (!stop) return reply.status(404).send({ success: false, error: 'Stop not found' });
    return reply.status(200).send({ success: true, data: stop });
  } catch (error) {
    console.error('Error fetching stop:', error);
    return reply.status(500).send({ success: false, error: 'Error fetching stop' });
  }
};

// ── POST /api/paradas/crear ─────────────────────────────
export const createStop = async (
  request: FastifyRequest<{ Body: CreateStopBody }>,
  reply: FastifyReply
) => {
  try {
    const { name, description, location, address, referenceLabel } = request.body;

    if (!name || !location || location.lat == null || location.lng == null) {
      return reply.status(400).send({
        success: false,
        error: 'Name and location (lat, lng) are required',
      });
    }

    // Check for duplicates at same approximate location (within ~10m)
    const existing = await Stop.findOne({
      'location.lat': { $gte: location.lat - 0.0001, $lte: location.lat + 0.0001 },
      'location.lng': { $gte: location.lng - 0.0001, $lte: location.lng + 0.0001 },
    });

    if (existing) {
      return reply.status(409).send({
        success: false,
        error: `A stop already exists near this location: "${existing.name}"`,
      });
    }

    const stop = await Stop.create({
      name,
      description,
      location,
      address,
      referenceLabel,
      status: 'Active',
    });

    return reply.status(201).send({
      success: true,
      message: 'Stop created successfully',
      data: stop,
    });
  } catch (error: any) {
    console.error('Error creating stop:', error);
    return reply.status(500).send({ success: false, error: 'Error creating stop', details: error.message });
  }
};

// ── PATCH /api/paradas/actualizar/:id ───────────────────
export const updateStop = async (
  request: FastifyRequest<{ Params: StopParams; Body: UpdateStopBody }>,
  reply: FastifyReply
) => {
  try {
    const updates: any = {};
    const body = request.body;

    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.address !== undefined) updates.address = body.address;
    if (body.referenceLabel !== undefined) updates.referenceLabel = body.referenceLabel;
    if (body.isActive !== undefined) updates.status = body.isActive ? 'Active' : 'Inactive';

    const stop = await Stop.findByIdAndUpdate(request.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!stop) return reply.status(404).send({ success: false, error: 'Stop not found' });

    return reply.status(200).send({ success: true, message: 'Stop updated successfully', data: stop });
  } catch (error) {
    console.error('Error updating stop:', error);
    return reply.status(500).send({ success: false, error: 'Error updating stop' });
  }
};

// ── DELETE /api/paradas/desactivar/:id ──────────────────
export const deactivateStop = async (
  request: FastifyRequest<{ Params: StopParams }>,
  reply: FastifyReply
) => {
  try {
    const stop = await Stop.findByIdAndUpdate(
      request.params.id,
      { status: 'Inactive' },
      { new: true }
    );
    if (!stop) return reply.status(404).send({ success: false, error: 'Stop not found' });
    return reply.status(200).send({ success: true, message: 'Stop deactivated', data: stop });
  } catch (error) {
    console.error('Error deactivating stop:', error);
    return reply.status(500).send({ success: false, error: 'Error deactivating stop' });
  }
};

// ── DELETE /api/paradas/eliminar/:id ────────────────────
export const permanentDeleteStop = async (
  request: FastifyRequest<{ Params: StopParams }>,
  reply: FastifyReply
) => {
  try {
    const stop = await Stop.findByIdAndDelete(request.params.id);
    if (!stop) return reply.status(404).send({ success: false, error: 'Stop not found' });
    return reply.status(200).send({ success: true, message: 'Stop permanently deleted' });
  } catch (error) {
    console.error('Error deleting stop:', error);
    return reply.status(500).send({ success: false, error: 'Error deleting stop' });
  }
};

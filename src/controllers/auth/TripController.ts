import { FastifyReply, FastifyRequest } from 'fastify';
import Trip from '../../models/trip.js'; 
import { createTripSchema } from '../../validators/trip_schema.js';

// Iniciar Viaje
export const createTrip = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = createTripSchema.parse(req.body);

    // Verificar si este CONDUCTOR ya tiene un viaje activo.
    const existingTrip = await Trip.findOne({ 
      driverId: data.driverId, 
      status: 'active' 
    });

    if (existingTrip) {
      return reply.code(400).send({ 
        message: "Error: Este conductor ya tiene un viaje en curso. Debe finalizarlo primero." 
      });
    }
    
    const newTrip = new Trip({
      ...data, // Aquí va driverId, routeIdentifier, etc.
      startTime: new Date(),
      status: 'active'
    });
    
    await newTrip.save();
    return reply.code(201).send(newTrip);

  } catch (error) {
    return reply.code(400).send(error);
  }
};

// Finalizar Viaje
export const endTrip = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id, 
      { endTime: new Date(), status: 'completed' }, 
      { new: true }
    );
    
    if (!trip) return reply.code(404).send({ message: "Viaje no encontrado" });
    return reply.send(trip);

  } catch (error) {
    return reply.code(500).send(error);
  }
};

// Obtener Historial (Analytics)
export const getTrips = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const trips = await Trip.find()
      .populate('driverId', 'fullName email') // Traemos el nombre del conductor desde el modelo User
      .sort({ startTime: -1 })
      .limit(50);
    return reply.send(trips);
  } catch (error) {
    return reply.code(500).send(error);
  }
};
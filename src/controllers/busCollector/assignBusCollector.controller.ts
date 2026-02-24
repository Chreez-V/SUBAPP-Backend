import { FastifyRequest, FastifyReply } from 'fastify';
import * as Collector from '../../models/busCollector';

interface IAssignParams {
  cedula: string
}
interface IAssignBody {
  assignedBusId: string;
}

export const assignBusHandler = async (
  request: FastifyRequest<{ Params: IAssignParams, Body: IAssignBody }>, 
  reply: FastifyReply
) => {
  try {

    const { cedula } = request.params;
    const { assignedBusId } = request.body;

    if (!assignedBusId) {
      return reply.code(400).send({ message: "El 'assignedBusId' es obligatorio." });
    }

    const updatedCollector = await Collector.assignBusToCollector(cedula, assignedBusId);

    if (!updatedCollector) {
      return reply.code(404).send({ message: "Colector no encontrado para asignación." });
    }

    return reply.code(200).send({
      message: "Bus asignado correctamente",
      data: updatedCollector
    });
  } catch (error) {
    return reply.code(500).send({ message: "Error al procesar la asignación de bus" });
  }
};
import { FastifyRequest, FastifyReply } from "fastify";
import mongoose from "mongoose";
import { User } from "../../models/user";
import { Driver } from "../../models/driver";
import { Transaction } from "../../models/transaction";
import { getBusFareById } from "../../models/busfare";
import { verificarPerfilCompleto } from "../../utils/profileValidator";

// Discounts (adjust if different business rules apply)
const STUDENT_DISCOUNT = 0.5; // 50% off for students
const SENIOR_DISCOUNT = 0.5; // 50% off for third-age

export async function payFare(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id: userId, role } = (request as any).user || {};
    if (!userId || !role) {
      return reply.status(401).send({ success: false, error: "No autorizado" });
    }

    if (role !== "passenger") {
      return reply
        .status(403)
        .send({
          success: false,
          error: "Solo pasajeros pueden usar este endpoint",
        });
    }

    const body = (request as any).body || {};
    const { routeId, driverId } = body;
    if (!routeId || !driverId) {
      return reply
        .status(400)
        .send({ success: false, error: "routeId y driverId son requeridos" });
    }

    // Load passenger and driver basic profiles
    const passenger = await User.findById(userId).select(
      "credit cedula birthDate phone isProfileComplete isStudent",
    );
    const driver = await Driver.findById(driverId).select("credit");

    if (!passenger)
      return reply
        .status(404)
        .send({ success: false, error: "Pasajero no encontrado" });
    if (!driver)
      return reply
        .status(404)
        .send({ success: false, error: "Conductor no encontrado" });

    // Verify profile completeness using the reusable helper
    try {
      verificarPerfilCompleto(passenger);
    } catch (err: any) {
      if (err && err.statusCode) {
        return reply
          .status(err.statusCode)
          .send({
            success: false,
            error: err.message,
            missingFields: err.missingFields,
          });
      }
      throw err;
    }

    // Obtain fare by route id (route-specific fare required)
    const baseFareDoc: any = await getBusFareById(routeId);
    if (!baseFareDoc) {
      return reply
        .status(404)
        .send({ success: false, error: "Tarifa de la ruta no encontrada" });
    }

    const baseFare = (baseFareDoc.farePrice ??
      baseFareDoc.amount ??
      0) as number;

    // Determine discount based on profile
    let fareType: "general" | "estudiante" | "tercera_edad" = "general";
    let discount = 0;
    // student flag optional on user (isStudent) or other custom field
    if ((passenger as any).isStudent) {
      fareType = "estudiante";
      discount = STUDENT_DISCOUNT;
    } else if (passenger.birthDate) {
      const age = Math.floor(
        (Date.now() - new Date(passenger.birthDate).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25),
      );
      if (age >= 60) {
        fareType = "tercera_edad";
        discount = SENIOR_DISCOUNT;
      }
    }

    const fareFinal = Math.max(0, baseFare * (1 - discount));

    if ((passenger.credit ?? 0) < fareFinal) {
      return reply
        .status(403)
        .send({ success: false, error: "Saldo insuficiente" });
    }

    // Start a mongoose transaction to update both accounts and create transactions atomically
    const session = await mongoose.startSession();
    let result: any = null;
    try {
      await session.withTransaction(async () => {
        // Decrement passenger
        const updatedPassenger = await User.findOneAndUpdate(
          { _id: passenger._id, credit: { $gte: fareFinal } },
          { $inc: { credit: -fareFinal } },
          { new: true, session },
        ).select("credit");

        if (!updatedPassenger) {
          throw new Error("Saldo insuficiente o conflicto concurrente");
        }

        // Increment driver credit
        const updatedDriver = await Driver.findByIdAndUpdate(
          driver._id,
          { $inc: { credit: fareFinal } },
          { new: true, session },
        ).select("credit");

        if (!updatedDriver) {
          throw new Error("Conductor no encontrado durante la operación");
        }

        // Create passenger transaction using save so hooks/validation run and session is applied
        const passengerTx = new Transaction({
          userId: passenger._id,
          routeId,
          driverId,
          amount: fareFinal,
          type: 'pago_pasaje_movil',
          previousBalance: (updatedPassenger.credit as number) + fareFinal,
          newBalance: updatedPassenger.credit as number,
          fareType,
          discountApplied: discount ? baseFare * discount : 0,
        })
        await passengerTx.save({ session })

        // Create driver transaction
        const driverTx = new Transaction({
          userId: updatedDriver._id,
          driverId: updatedDriver._id,
          routeId,
          amount: fareFinal,
          type: 'cobro_pasaje',
          previousBalance: (updatedDriver.credit as number) - fareFinal,
          newBalance: updatedDriver.credit as number,
        })
        await driverTx.save({ session })

        result = {
          approved: true,
          fare: fareFinal,
          newBalance: updatedPassenger.credit,
        };
      });
    } finally {
      session.endSession();
    }

    // If the transaction didn't set a result (e.g. aborted/failed without throwing),
    // do not return success: respond with 500 and a helpful log.
    if (!result || !result.approved) {
      console.error("payFare: transaction did not complete or was not approved", {
        userId,
        driverId,
        routeId,
        result,
      });
      return reply
        .status(500)
        .send({ success: false, error: "Transacción no completada" });
    }

    return reply.status(200).send({ success: true, ...result });
  } catch (error) {
    console.error("Error in payFare:", error);
    return reply
      .status(500)
      .send({ success: false, error: "Error interno del servidor" });
  }
}

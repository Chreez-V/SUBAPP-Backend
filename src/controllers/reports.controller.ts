import { FastifyRequest, FastifyReply } from 'fastify';
import mongoose from 'mongoose';
import { Report, REPORT_REASONS } from '../models/report.js';
import { Route } from '../models/route.js';
import { RouteSet } from '../models/routeSet.js';

// ── Interfaces ──────────────────────────────────────────

interface CreateReportBody {
  routeId: string;
  driverId: string;
  driverName?: string;
  reason: string;
  customReason?: string;
  notes?: string;
}

interface ResolveReportBody {
  status: 'approved' | 'rejected' | 'resolved';
  switchToRouteId?: string;
  resolutionNotes?: string;
}

interface ReportParams {
  id: string;
}

interface MovimientoTotalQuery {
  desde?: string;
  hasta?: string;
}

interface TransaccionesQuery {
  desde?: string;
  hasta?: string;
  type?: string;
  userId?: string;
  routeId?: string;
  driverId?: string;
  tripId?: string;
  fareType?: string;
  minAmount?: string;
  maxAmount?: string;
  cardUid?: string;
  description?: string;
  page?: string;
  limit?: string;
  sortBy?: 'createdAt' | 'amount' | 'type';
  sortDir?: 'asc' | 'desc';
}

interface CuotaDiariaQuery {
  cuota?: string;
}

// ── Controllers ─────────────────────────────────────────

/**
 * GET /api/reportes - List all reports
 */
export const getAllReports = async (
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const reports = await Report.find()
      .populate('route', 'name distance status routeType')
      .populate('driver', 'name email phone')
      .populate('switchedToRoute', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return reply.status(200).send({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al obtener los reportes',
    });
  }
};

/**
 * GET /api/reportes/pendientes - List only pending reports
 */
export const getPendingReports = async (
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const reports = await Report.find({ status: 'pending' })
      .populate('route', 'name distance status routeType')
      .populate('driver', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    return reply.status(200).send({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error('Error fetching pending reports:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al obtener los reportes pendientes',
    });
  }
};

/**
 * GET /api/reportes/buscar/:id - Get report by ID
 */
export const getReportById = async (
  request: FastifyRequest<{ Params: ReportParams }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const report = await Report.findById(id)
      .populate('route')
      .populate('driver', 'name email phone')
      .populate('switchedToRoute', 'name')
      .lean();

    if (!report) {
      return reply.status(404).send({
        success: false,
        error: 'Reporte no encontrado',
      });
    }

    return reply.status(200).send({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al obtener el reporte',
    });
  }
};

/**
 * POST /api/reportes/crear - Create a new report (driver submits)
 */
export const createReport = async (
  request: FastifyRequest<{ Body: CreateReportBody }>,
  reply: FastifyReply
) => {
  try {
    const { routeId, driverId, reason, customReason, notes } = request.body;

    if (!routeId || !driverId || !reason) {
      return reply.status(400).send({
        success: false,
        error: 'routeId, driverId y reason son obligatorios',
      });
    }

    // Validate reason enum
    if (!REPORT_REASONS.includes(reason as any)) {
      return reply.status(400).send({
        success: false,
        error: `Motivo inválido. Opciones: ${REPORT_REASONS.join(', ')}`,
      });
    }

    // If reason is 'otro', customReason is required
    if (reason === 'otro' && (!customReason || customReason.trim().length === 0)) {
      return reply.status(400).send({
        success: false,
        error: 'Cuando el motivo es "otro", debe proporcionar una descripción personalizada',
      });
    }

    // Validate route exists
    const route = await Route.findById(routeId);
    if (!route) {
      return reply.status(404).send({
        success: false,
        error: 'Ruta no encontrada',
      });
    }

    const report = new Report({
      route: routeId,
      driver: driverId,
      reason,
      customReason: reason === 'otro' ? customReason : undefined,
      notes,
      status: 'pending',
    });

    const saved = await report.save();

    const populated = await Report.findById(saved._id)
      .populate('route', 'name distance status routeType')
      .populate('driver', 'name email phone')
      .lean();

    return reply.status(201).send({
      success: true,
      message: 'Reporte creado exitosamente',
      data: populated,
    });
  } catch (error: any) {
    console.error('Error creating report:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al crear el reporte',
      details: error.message,
    });
  }
};

/**
 * PATCH /api/reportes/resolver/:id - Admin resolves a report
 * Can approve (deactivate route + optionally switch to alternative),
 * reject, or mark as resolved.
 */
export const resolveReport = async (
  request: FastifyRequest<{ Params: ReportParams; Body: ResolveReportBody }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { status, switchToRouteId, resolutionNotes } = request.body;

    if (!status || !['approved', 'rejected', 'resolved'].includes(status)) {
      return reply.status(400).send({
        success: false,
        error: 'Estado inválido. Opciones: approved, rejected, resolved',
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return reply.status(404).send({
        success: false,
        error: 'Reporte no encontrado',
      });
    }

    if (report.status !== 'pending') {
      return reply.status(400).send({
        success: false,
        error: 'Solo se pueden resolver reportes pendientes',
      });
    }

    // If approved, deactivate the reported route
    if (status === 'approved') {
      await Route.findByIdAndUpdate(report.route, { status: 'Inactive' });

      // If a switch route is specified, activate it
      if (switchToRouteId) {
        // Verify the alternative route exists
        const altRoute = await Route.findById(switchToRouteId);
        if (!altRoute) {
          return reply.status(404).send({
            success: false,
            error: 'Ruta alternativa no encontrada',
          });
        }

        await Route.findByIdAndUpdate(switchToRouteId, { status: 'Active' });
        report.switchedToRoute = switchToRouteId as any;

        // Update the RouteSet activeRoute if the route belongs to a set
        const routeSet = await RouteSet.findOne({
          routes: { $in: [report.route, switchToRouteId] },
        });
        if (routeSet) {
          routeSet.activeRoute = switchToRouteId as any;
          await routeSet.save();
        }
      }
    }

    report.status = status;
    report.resolutionNotes = resolutionNotes;
    report.resolvedAt = new Date();
    await report.save();

    const populated = await Report.findById(id)
      .populate('route', 'name distance status routeType')
      .populate('driver', 'name email phone')
      .populate('switchedToRoute', 'name')
      .lean();

    return reply.status(200).send({
      success: true,
      message: `Reporte ${status === 'approved' ? 'aprobado' : status === 'rejected' ? 'rechazado' : 'resuelto'}`,
      data: populated,
    });
  } catch (error: any) {
    console.error('Error resolving report:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al resolver el reporte',
      details: error.message,
    });
  }
};

/**
 * DELETE /api/reportes/eliminar/:id - Permanently delete a report
 */
export const deleteReport = async (
  request: FastifyRequest<{ Params: ReportParams }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const report = await Report.findByIdAndDelete(id);
    if (!report) {
      return reply.status(404).send({
        success: false,
        error: 'Reporte no encontrado',
      });
    }

    return reply.status(200).send({
      success: true,
      message: 'Reporte eliminado permanentemente',
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al eliminar el reporte',
    });
  }
};

/**
 * GET /api/reportes/motivos - Return the list of valid report reasons
 * Useful for the mobile app to populate a dropdown.
 */
export const getReportReasons = async (
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  const reasonLabels: Record<string, string> = {
    via_deteriorada: 'Vía deteriorada / huecos',
    inundacion: 'Inundación / acumulación de agua',
    derrumbe: 'Derrumbe / deslizamiento de tierra',
    accidente_vial: 'Accidente vial bloqueando la vía',
    obra_en_construccion: 'Obra en construcción',
    cierre_policial: 'Cierre policial / militar',
    arbol_caido: 'Árbol caído / obstrucción',
    falla_semaforo: 'Falla de semáforo',
    protesta: 'Protesta / manifestación',
    otro: 'Otro (especificar)',
  };

  return reply.status(200).send({
    success: true,
    data: REPORT_REASONS.map((r) => ({
      value: r,
      label: reasonLabels[r] || r,
    })),
  });
};

/**
 * GET /api/reportes/movimiento-total - Total movement report for transactions
 */
export const getMovimientoTotalReport = async (
  request: FastifyRequest<{ Querystring: MovimientoTotalQuery }>,
  reply: FastifyReply
) => {
  const { desde, hasta } = request.query || {};

  if (!desde || !hasta) {
    return reply.status(400).send({
      success: false,
      error: 'Los parametros "desde" y "hasta" son obligatorios (YYYY-MM-DD).',
    });
  }

  const start = new Date(desde);
  const end = new Date(hasta);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return reply.status(400).send({
      success: false,
      error: 'Formato de fecha invalido. Use YYYY-MM-DD.',
    });
  }

  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(23, 59, 59, 999);

  try {
    const collection = mongoose.connection.collection('transactions');

    const [result] = await collection.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $facet: {
          byType: [
            {
              $group: {
                _id: '$type',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
          ],
          totals: [
            {
              $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
                totalCount: { $sum: 1 },
                users: { $addToSet: '$userId' },
              },
            },
            {
              $project: {
                _id: 0,
                totalAmount: 1,
                totalCount: 1,
                uniqueUsers: { $size: '$users' },
              },
            },
          ],
        },
      },
    ]).toArray();

    const byType = (result?.byType || []) as Array<{
      _id: string;
      total: number;
      count: number;
    }>;

    const totals = (result?.totals?.[0] || {
      totalAmount: 0,
      totalCount: 0,
      uniqueUsers: 0,
    }) as {
      totalAmount: number;
      totalCount: number;
      uniqueUsers: number;
    };

    const typeTotals = byType.reduce<Record<string, number>>((acc, item) => {
      acc[item._id] = item.total || 0;
      return acc;
    }, {});

    const ingresosMap: Record<string, string> = {
      recarga: 'recarga',
      transferencia_recibida: 'transferencia_recibida',
      reembolso: 'reembolso',
      cobro_pasaje: 'cobro_pasaje',
    };

    const egresosMap: Record<string, string> = {
      pago_pasaje_nfc: 'pago_pasaje_nfc',
      pago_pasaje_qr: 'pago_pasaje_qr',
      pago_pasaje_movil: 'pago_pasaje_movil',
      transferencia_enviada: 'transferencia_enviada',
      retiro: 'retiro',
    };

    const ingresos: Record<string, number> = {};
    const egresos: Record<string, number> = {};

    Object.entries(ingresosMap).forEach(([type, key]) => {
      ingresos[key] = typeTotals[type] || 0;
    });

    Object.entries(egresosMap).forEach(([type, key]) => {
      egresos[key] = typeTotals[type] || 0;
    });

    const ingresosTotal = Object.values(ingresos).reduce((sum, value) => sum + value, 0);
    const egresosTotal = Object.values(egresos).reduce((sum, value) => sum + value, 0);
    const balanceNeto = ingresosTotal - egresosTotal;
    const totalTransacciones = totals.totalCount || 0;
    const promedioPorTransaccion = totalTransacciones > 0
      ? Math.round((totals.totalAmount / totalTransacciones) * 100) / 100
      : 0;

    return reply.status(200).send({
      periodo: { desde, hasta },
      ingresos: {
        ...ingresos,
        total: ingresosTotal,
      },
      egresos: {
        ...egresos,
        total: egresosTotal,
      },
      balance_neto: balanceNeto,
      total_transacciones: totalTransacciones,
      pasajeros_activos: totals.uniqueUsers || 0,
      promedio_por_transaccion: promedioPorTransaccion,
    });
  } catch (error) {
    console.error('Error en getMovimientoTotalReport:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al obtener el movimiento total',
    });
  }
};

/**
 * GET /api/reportes/transacciones - List transactions with filters
 */
export const getTransaccionesReport = async (
  request: FastifyRequest<{ Querystring: TransaccionesQuery }>,
  reply: FastifyReply
) => {
  const {
    desde,
    hasta,
    type,
    userId,
    routeId,
    driverId,
    tripId,
    fareType,
    minAmount,
    maxAmount,
    cardUid,
    description,
    page = '1',
    limit = '50',
    sortBy = 'createdAt',
    sortDir = 'desc',
  } = request.query || {};

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));

  const idFilters = { userId, routeId, driverId, tripId } as const;
  for (const [label, value] of Object.entries(idFilters)) {
    if (value && !mongoose.Types.ObjectId.isValid(value)) {
      return reply.status(400).send({
        success: false,
        error: `El parametro "${label}" no es un ObjectId valido.`,
      });
    }
  }

  const minAmountValue = minAmount !== undefined ? Number(minAmount) : undefined;
  const maxAmountValue = maxAmount !== undefined ? Number(maxAmount) : undefined;

  if (minAmountValue !== undefined && Number.isNaN(minAmountValue)) {
    return reply.status(400).send({
      success: false,
      error: 'El parametro "minAmount" debe ser numerico.',
    });
  }

  if (maxAmountValue !== undefined && Number.isNaN(maxAmountValue)) {
    return reply.status(400).send({
      success: false,
      error: 'El parametro "maxAmount" debe ser numerico.',
    });
  }

  let start: Date | undefined;
  let end: Date | undefined;

  if (desde) {
    start = new Date(desde);
    if (Number.isNaN(start.getTime())) {
      return reply.status(400).send({
        success: false,
        error: 'Formato de fecha invalido para "desde". Use YYYY-MM-DD.',
      });
    }
    start.setUTCHours(0, 0, 0, 0);
  }

  if (hasta) {
    end = new Date(hasta);
    if (Number.isNaN(end.getTime())) {
      return reply.status(400).send({
        success: false,
        error: 'Formato de fecha invalido para "hasta". Use YYYY-MM-DD.',
      });
    }
    end.setUTCHours(23, 59, 59, 999);
  }

  const amountFilter: Record<string, number> = {};
  if (minAmountValue !== undefined) amountFilter.$gte = minAmountValue;
  if (maxAmountValue !== undefined) amountFilter.$lte = maxAmountValue;

  const match: Record<string, unknown> = {};
  if (type) match.type = type;
  if (userId) match.userId = new mongoose.Types.ObjectId(userId);
  if (routeId) match.routeId = new mongoose.Types.ObjectId(routeId);
  if (driverId) match.driverId = new mongoose.Types.ObjectId(driverId);
  if (tripId) match.tripId = new mongoose.Types.ObjectId(tripId);
  if (fareType) match.fareType = fareType;
  if (cardUid) match.cardUid = cardUid;
  if (description) match.description = { $regex: description, $options: 'i' };
  if (Object.keys(amountFilter).length > 0) match.amount = amountFilter;

  if (start || end) {
    const dateFilter: Record<string, Date> = {};
    if (start) dateFilter.$gte = start;
    if (end) dateFilter.$lte = end;
    match.createdAtDate = dateFilter;
  }

  const sortFields: Record<string, string> = {
    createdAt: 'createdAtDate',
    amount: 'amount',
    type: 'type',
  };

  const sortField = sortFields[sortBy] || sortFields.createdAt;
  const sortDirection = sortDir === 'asc' ? 1 : -1;

  try {
    const collection = mongoose.connection.collection('transactions');

    const [result] = await collection.aggregate([
      {
        $addFields: {
          createdAtDate: {
            $convert: {
              input: '$createdAt',
              to: 'date',
              onError: null,
              onNull: null,
            },
          },
        },
      },
      { $match: match },
      {
        $sort: {
          [sortField]: sortDirection,
        },
      },
      {
        $facet: {
          data: [
            { $skip: (pageNumber - 1) * limitNumber },
            { $limit: limitNumber },
            { $project: { createdAtDate: 0 } },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]).toArray();

    const data = (result?.data || []) as Record<string, unknown>[];
    const totalCount = (result?.total?.[0]?.count || 0) as number;

    return reply.status(200).send({
      success: true,
      count: totalCount,
      page: pageNumber,
      limit: limitNumber,
      data,
    });
  } catch (error) {
    console.error('Error en getTransaccionesReport:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al obtener las transacciones',
    });
  }
};

/**
 * GET /api/reportes/cuota-diaria - Daily top-up target report
 */
export const getCuotaDiariaReport = async (
  request: FastifyRequest<{ Querystring: CuotaDiariaQuery }>,
  reply: FastifyReply
) => {
  const { cuota } = request.query || {};

  if (!cuota) {
    return reply.status(400).send({
      success: false,
      error: 'El parametro "cuota" es obligatorio.',
    });
  }

  const cuotaValue = Number(cuota);
  if (Number.isNaN(cuotaValue) || cuotaValue < 0) {
    return reply.status(400).send({
      success: false,
      error: 'El parametro "cuota" debe ser numerico y mayor o igual a 0.',
    });
  }

  const today = new Date();
  const start = new Date(today);
  const end = new Date(today);
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(23, 59, 59, 999);

  try {
    const collection = mongoose.connection.collection('transactions');

    const [result] = await collection.aggregate([
      {
        $addFields: {
          createdAtDate: {
            $convert: {
              input: '$createdAt',
              to: 'date',
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $match: {
          type: 'recarga',
          createdAtDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          recargaTotal: { $sum: '$amount' },
          cantidadRecargas: { $sum: 1 },
        },
      },
    ]).toArray();

    const recargaTotal = result?.recargaTotal || 0;
    const cantidadRecargas = result?.cantidadRecargas || 0;
    const brecha = cuotaValue - recargaTotal;
    const porcentajeAlcanzado = cuotaValue > 0
      ? ((recargaTotal / cuotaValue) * 100).toFixed(2)
      : '0.00';
    const fecha = start.toISOString().slice(0, 10);

    return reply.status(200).send({
      fecha,
      cuota_establecida: cuotaValue,
      recarga_total_hoy: recargaTotal,
      brecha,
      porcentaje_alcanzado: porcentajeAlcanzado,
      cantidad_recargas_hoy: cantidadRecargas,
    });
  } catch (error) {
    console.error('Error en getCuotaDiariaReport:', error);
    return reply.status(500).send({
      success: false,
      error: 'Error al obtener la cuota diaria',
    });
  }
};

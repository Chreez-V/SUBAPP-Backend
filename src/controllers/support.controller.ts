import { FastifyRequest, FastifyReply } from 'fastify'
import { 
  Support, 
  getSupports, 
  getSupportById, 
  createSupport, 
  updateSupport, 
  deleteSupport, 
  permanentDeleteSupport 
} from '../models/support.js'

export const getAllSupports = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const supports = await Support.find()
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean()

    return reply.status(200).send({
      success: true,
      count: supports.length,
      data: supports,
    })
  } catch (error) {
    console.error('Error fetching supports:', error)
    return reply.status(500).send({
      success: false,
      error: 'Error fetching supports',
    })
  }
}

export const getActiveSupports = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const supports = await Support.find({ status: 'Active' })
      .select('fullName email createdAt')
      .lean()

    return reply.status(200).send({
      success: true,
      count: supports.length,
      data: supports,
    })
  } catch (error) {
    console.error('Error fetching active supports:', error)
    return reply.status(500).send({
      success: false,
      error: 'Error fetching active supports',
    })
  }
}

export const getSupportByIdController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string }

    const support = await Support.findById(id).lean()

    if (!support) {
      return reply.status(404).send({
        success: false,
        error: 'Support not found',
      })
    }

    return reply.status(200).send({
      success: true,
      data: support,
    })
  } catch (error) {
    console.error('Error fetching support:', error)
    return reply.status(500).send({
      success: false,
      error: 'Error fetching support',
    })
  }
}

export const createSupportController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { fullName, email, password, phone } = request.body as {
      fullName: string
      email: string
      password: string
      phone?: string
    }

    if (!fullName || !email || !password) {
      return reply.status(400).send({
        success: false,
        error: 'Full name, email, and password are required',
      })
    }

    const existingSupport = await Support.findOne({ email })
    if (existingSupport) {
      return reply.status(409).send({
        success: false,
        error: 'A support with this email already exists',
      })
    }

    const newSupport = await createSupport({
      fullName,
      email,
      password,
    })

    return reply.status(201).send({
      success: true,
      message: 'Support created successfully',
      data: newSupport,
    })
  } catch (error: any) {
    console.error('Error creating support:', error)
    
    if (error.code === 11000) {
      return reply.status(409).send({
        success: false,
        error: 'Email already exists',
      })
    }

    return reply.status(500).send({
      success: false,
      error: 'Error creating support',
      details: error.message,
    })
  }
}

export const updateSupportController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string }
    const updates = request.body as {
      fullName?: string
      status?: 'Active' | 'Inactive'
      phone?: string
    }

    const updatedSupport = await updateSupport(id, updates)

    if (!updatedSupport) {
      return reply.status(404).send({
        success: false,
        error: 'Support not found',
      })
    }

    return reply.status(200).send({
      success: true,
      message: 'Support updated successfully',
      data: updatedSupport,
    })
  } catch (error) {
    console.error('Error updating support:', error)
    return reply.status(500).send({
      success: false,
      error: 'Error updating support',
    })
  }
}

export const deleteSupportController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string }

    const support = await deleteSupport(id)

    if (!support) {
      return reply.status(404).send({
        success: false,
        error: 'Support not found',
      })
    }

    return reply.status(200).send({
      success: true,
      message: 'Support deactivated successfully',
      data: support,
    })
  } catch (error) {
    console.error('Error deactivating support:', error)
    return reply.status(500).send({
      success: false,
      error: 'Error deactivating support',
    })
  }
}

export const permanentDeleteSupportController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string }

    const support = await permanentDeleteSupport(id)

    if (!support) {
      return reply.status(404).send({
        success: false,
        error: 'Support not found',
      })
    }

    return reply.status(200).send({
      success: true,
      message: 'Support permanently deleted',
    })
  } catch (error) {
    console.error('Error permanently deleting support:', error)
    return reply.status(500).send({
      success: false,
      error: 'Error permanently deleting support',
    })
  }
}
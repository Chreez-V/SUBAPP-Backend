import mongoose from 'mongoose';
import { createAdmin } from '../models/admin.js';
import { envs } from '../config/env.config.js';

async function createTestAdmin() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(envs.MONGODB_URL);
        console.log('✅ Conectado a MongoDB');

        // Crear administrador de prueba
        const admin = await createAdmin({
            fullName: 'Admin Test',
            email: 'admin@suba.com',
            password: 'admin123',
            phone: '+505 8888-8888'
        });

        console.log('✅ Administrador creado exitosamente:');
        console.log({
            id: admin._id,
            email: admin.email,
            fullName: admin.fullName,
            role: admin.role
        });

        await mongoose.disconnect();
        console.log('✅ Desconectado de MongoDB');
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.code === 11000) {
            console.log('⚠️  El email ya existe en la base de datos');
        }
        await mongoose.disconnect();
    }
}

createTestAdmin();

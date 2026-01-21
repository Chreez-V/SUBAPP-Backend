# 🔐 Autenticación de Administradores

## 📋 Resumen
Sistema de autenticación separado para administradores usando colección independiente de MongoDB.

## 🏗️ Arquitectura

### Modelos Separados (MERE)
- **User**: Para pasajeros y conductores (app SUBA)
- **Admin**: Para administradores (panel admin)

### Flujo de Autenticación

```
Frontend Admin Panel → POST /api/admin/login → Verifica en colección Admin → JWT Token
```

## 🚀 Uso

### 1. Crear Administrador de Prueba

```bash
cd subapp-backend
npm run tsx src/scripts/createTestAdmin.ts
```

Esto crea un admin con:
- Email: `admin@suba.com`
- Password: `admin123`

### 2. Endpoints Disponibles

#### Login de Administrador
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@suba.com",
  "password": "admin123"
}
```

**Respuesta exitosa:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@suba.com",
    "fullName": "Admin Test",
    "role": "admin",
    "phone": "+505 8888-8888",
    "lastLogin": "2026-01-20T..."
  }
}
```

#### Rutas Protegidas (requieren token)
```http
GET /api/admin
Authorization: Bearer {token}
```

### 3. Frontend Admin Panel

El login del frontend automáticamente:
1. Envía credenciales a `/api/admin/login`
2. Verifica que `role === 'admin'`
3. Guarda el token en localStorage
4. Redirige al dashboard

## 🔒 Seguridad

### Middleware `authenticateAdmin`
Verifica:
1. Token JWT válido
2. Usuario existe en colección `Admin`
3. Agrega datos del admin al request

### Uso en Rutas Protegidas
```typescript
fastify.get('/admin/something', {
  preHandler: [fastify.authenticateAdmin]
}, async (request, reply) => {
  const admin = (request as any).admin;
  // admin está autenticado y verificado
});
```

## 🧪 Probar el Login

### Con curl:
```bash
curl -X POST http://localhost:3500/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@suba.com","password":"admin123"}'
```

### Con frontend:
1. Iniciar backend: `npm run dev`
2. Iniciar admin-frontend: `npm run dev`
3. Ir a http://localhost:3000/login
4. Ingresar credenciales
5. Verificar redirección al dashboard

## 📝 Diferencias User vs Admin

| Característica | User | Admin |
|---------------|------|-------|
| Colección | `users` | `admins` |
| Login | `/auth/login` | `/api/admin/login` |
| Roles | `passenger`, `driver`, `admin` | Solo `admin` |
| Campos extra | `credit` | `phone`, `lastLogin` |
| Usado en | App SUBA | Panel Admin |

## ⚠️ Notas Importantes

1. **No confundir login de usuarios con login de admin**
   - `/auth/login` → Para app SUBA (User model)
   - `/api/admin/login` → Para panel admin (Admin model)

2. **Token JWT contiene:**
   ```json
   {
     "email": "admin@suba.com",
     "role": "admin"
   }
   ```

3. **El middleware `authenticateAdmin` verifica:**
   - Token válido
   - Email existe en colección Admin
   - No permite usuarios normales aunque tengan role='admin'

## 🐛 Troubleshooting

### Error: "Credenciales inválidas"
- Verifica que el admin exista en la BD
- Ejecuta el script de creación de admin

### Error: "No tienes permisos de administrador"
- El email no existe en la colección `admins`
- Verifica con MongoDB Compass

### Error: "Token inválido o expirado"
- El token JWT está mal formado o expiró
- Vuelve a hacer login

## 📦 Archivos Clave

- `src/models/admin.ts` - Modelo de Admin
- `src/controllers/admin/adminLogin.controller.ts` - Controlador de login
- `src/api/admin/adminLogin.routes.ts` - Ruta de login
- `src/config/jwt.ts` - Middleware de autenticación
- `src/scripts/createTestAdmin.ts` - Script para crear admin

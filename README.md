# 🚀 Backend Project

Este es un proyecto backend desarrollado con **TypeScript** y **Fastify**, diseñado para ser escalable y mantenible.

## 📁 Estructura del Proyecto

```
project/
├── 📂 dist/                    # Código compilado a JavaScript (para producción)
│   ├── index.js
│   ├── index.js.map
│   └── server/
│       ├── app.js
│       └── app.js.map
├── 📂 src/                     # Código fuente TypeScript
│   ├── 📂 config/              # Configuraciones de servicios externos
│   ├── 📂 controllers/         # Controladores de la aplicación
│   ├── 📂 middlewares/         # Middlewares personalizados
│   ├── 📂 models/              # Esquemas de Mongoose
│   ├── 📂 plugins/             # Plugins de Fastify
│   ├── 📂 routes/              # Rutas de la API (posiblemente se migre a plugins)
│   ├── 📂 server/
│   │   └── app.ts              # Archivo principal de configuración del servidor
│   ├── 📂 socket/              # Handlers para WebSockets
│   │   └── {handlers}/
│   ├── 📂 tests/               # Tests unitarios (en desarrollo)
│   ├── 📂 types/               # Definiciones de tipos TypeScript
│   ├── 📂 utils/               # Utilidades (encriptación, cálculos, etc.)
│   ├── 📂 validators/          # Esquemas de validación con Zod
│   └── index.ts                # Archivo de prueba
├── package.json
├── package-lock.json
├── tsconfig.json
└── tsconfig.node.json
```

## 🛠️ Tecnologías Utilizadas

- **TypeScript** - Lenguaje de programación
- **Fastify** - Framework web rápido y eficiente
- **Mongoose** - ODM para MongoDB
- **Zod** - Validación de esquemas
- **WebSockets** - Comunicación en tiempo real

## 📦 Gestión de Paquetes

Este proyecto utiliza **npm** como gestor de paquetes exclusivamente para mantener consistencia y evitar conflictos.

## 🚀 Comandos Disponibles

```bash
# Instalar dependencias
npm install

# Desarrollo (modo watch)
npm run dev

# Compilar proyecto
npm run build

# Ejecutar versión compilada
npm start

# Ejecutar tests (cuando estén disponibles)
npm test
```

## 🔧 Configuración

### Variables de Entorno
Las variables de entorno serán enviadas por el **grupo de departamento backend** y **no se incluyen en el repositorio**.

### Compilación antes de subir cambios
Antes de subir tus cambios a tu rama verifica que buildeen tus cambios ejecuta:

```bash
npm run build
```

## 🏗️ Arquitectura

El proyecto sigue una arquitectura modular organizada en:

- **Controllers**: Lógica de negocio
- **Models**: Esquemas de base de datos
- **Middlewares**: Funciones intermedias
- **Validators**: Validación de datos de entrada
- **Utils**: Funciones auxiliares reutilizables

## 🔄 Desarrollo

1. Clona el repositorio
2. Instala dependencias: `npm install`
3. Configura las variables de entorno
4. Ejecuta en desarrollo: `npm run dev`
5. Para producción: `npm run build`

## 📝 Notas Importantes

- El código fuente está en TypeScript en la carpeta `src/`
- La carpeta `dist/` contiene el código compilado listo para producción
- Los tests unitarios se ubicarán en `src/tests/`
- La configuración de TypeScript está en `tsconfig.json`

---

**¡Listo para desarrollar!** 🎉

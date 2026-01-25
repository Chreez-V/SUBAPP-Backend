// Script para eliminar el índice viejo de MongoDB
const { MongoClient } = require('mongodb');

async function dropOldIndex() {
  const url = process.env.MONGODB_URL || 'mongodb://localhost:27017/test';
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('routes');
    
    // Listar índices actuales
    const indexes = await collection.indexes();
    console.log('Índices actuales:', indexes);
    
    // Intentar eliminar el índice viejo
    try {
      await collection.dropIndex('nombre_1');
      console.log('✅ Índice "nombre_1" eliminado exitosamente');
    } catch (err) {
      console.log('⚠️ Índice "nombre_1" no existe (esto está bien)');
    }
    
    // Verificar que existe el índice correcto
    const newIndexes = await collection.indexes();
    console.log('Índices después de limpieza:', newIndexes);
    
  } finally {
    await client.close();
  }
}

dropOldIndex().catch(console.error);

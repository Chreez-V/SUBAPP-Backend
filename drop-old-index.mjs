import { MongoClient } from 'mongodb';

async function dropOldIndex() {
  const url = process.env.MONGODB_URL || 'mongodb://localhost:27017/test';
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('routes');
    
    // Listar índices actuales
    const indexes = await collection.indexes();
    console.log('📋 Índices actuales:', indexes);
    
    // Intentar eliminar el índice viejo "nombre_1"
    try {
      await collection.dropIndex('nombre_1');
      console.log('✅ Índice "nombre_1" eliminado exitosamente');
    } catch (err) {
      console.log('⚠️ Índice "nombre_1" no existe (esto está bien)');
    }
    
    // Limpiar documentos con nombre null
    const result = await collection.deleteMany({ name: null });
    console.log(`🗑️ Eliminados ${result.deletedCount} documentos con name=null`);
    
    // Verificar índices finales
    const newIndexes = await collection.indexes();
    console.log('📋 Índices finales:', newIndexes);
    
  } finally {
    await client.close();
  }
}

dropOldIndex().catch(console.error);

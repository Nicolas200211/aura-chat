import postgres from 'postgres';

const sql = postgres('postgresql://postgres:d7zxFrml89zCqADw@db.byabuwrmjczekuvflpco.supabase.co:5432/postgres');

async function migrate() {
  try {
    console.log('Migrando base de datos...');
    
    // 1. Crear tabla de conversaciones
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID,
        title TEXT DEFAULT 'Nueva conversación',
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `;
    
    // 2. Añadir columna conversation_id a messages
    await sql`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE
    `;
    
    console.log('Migración completada con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error en migración:', error);
    process.exit(1);
  }
}

migrate();

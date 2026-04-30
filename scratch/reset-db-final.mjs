import postgres from 'postgres';

const sql = postgres('postgresql://postgres:d7zxFrml89zCqADw@db.byabuwrmjczekuvflpco.supabase.co:5432/postgres');

async function resetDB() {
  try {
    console.log('Iniciando Reset Total de Base de Datos...');
    
    // 1. Limpiar todo lo existente
    await sql`DROP TABLE IF EXISTS messages CASCADE`;
    await sql`DROP TABLE IF EXISTS conversations CASCADE`;
    await sql`DROP TABLE IF EXISTS journal_entries CASCADE`;

    console.log('Tablas antiguas eliminadas.');

    // 2. Crear Tabla de Conversaciones (vinculada a Auth)
    await sql`
      CREATE TABLE conversations (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        title TEXT DEFAULT 'Nueva conversación',
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `;

    // 3. Crear Tabla de Mensajes
    await sql`
      CREATE TABLE messages (
        id BIGSERIAL PRIMARY KEY,
        conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        role TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `;

    // 4. Crear Tabla de Diario Emocional
    await sql`
      CREATE TABLE journal_entries (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        content TEXT NOT NULL,
        mood TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `;

    console.log('Estructura definitiva creada con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error en el reset:', error);
    process.exit(1);
  }
}

resetDB();

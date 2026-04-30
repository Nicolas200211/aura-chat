import postgres from 'postgres';

const sql = postgres('postgresql://postgres:d7zxFrml89zCqADw@db.byabuwrmjczekuvflpco.supabase.co:5432/postgres');

async function migrate() {
  try {
    console.log('Recreando tablas de Ejercicios y Especialistas...');
    
    await sql`DROP TABLE IF EXISTS exercises CASCADE`;
    await sql`DROP TABLE IF EXISTS specialists CASCADE`;

    await sql`
      CREATE TABLE exercises (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        duration TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        image TEXT,
        steps TEXT[]
      )
    `;

    await sql`
      CREATE TABLE specialists (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        rating TEXT NOT NULL,
        experience TEXT NOT NULL,
        image TEXT,
        availability TEXT NOT NULL
      )
    `;

    console.log('Tablas creadas con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error en migración:', error);
    process.exit(1);
  }
}

migrate();

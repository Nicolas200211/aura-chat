import postgres from 'postgres';

const sql = postgres('postgresql://postgres:d7zxFrml89zCqADw@db.byabuwrmjczekuvflpco.supabase.co:5432/postgres');

async function fix() {
  await sql.unsafe("UPDATE especialistas SET imagen = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400' WHERE nombre = 'Dra. Elena Martínez'");
  console.log('Imagen de Dra. Elena Martínez actualizada con éxito.');
  process.exit(0);
}

fix();

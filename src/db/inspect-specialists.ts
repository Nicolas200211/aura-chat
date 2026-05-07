import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function inspectData() {
  console.log('Inspeccionando datos de especialistas...');

  try {
    const data = await sql`SELECT * FROM especialistas LIMIT 5`;
    console.log('Total especialistas:', data.length);
    console.log('Muestra de datos:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error al inspeccionar:', error);
  } finally {
    await sql.end();
  }
}

inspectData();

import postgres from 'postgres';

const sql = postgres('postgresql://postgres:d7zxFrml89zCqADw@db.byabuwrmjczekuvflpco.supabase.co:5432/postgres');

async function seed() {
  try {
    console.log('🚀 Ampliando Directorio de Especialistas...');

    // Limpiamos especialistas previos para no duplicar si se corre de nuevo
    await sql`DELETE FROM especialistas`;

    const especialistas = [
      {
        nombre: "Dra. Elena Martínez",
        especialidad: "Psicología Clínica / TCC",
        clasificación: "4.9",
        experiencia: "12 años",
        imagen: "https://images.unsplash.com/photo-1559839734-2b71f1e3c7e5?auto=format&fit=crop&q=80&w=400",
        disponibilidad: "Lunes a Viernes"
      },
      {
        nombre: "Dr. Carlos Ruiz",
        especialidad: "Psiquiatra / Ansiedad",
        clasificación: "4.8",
        experiencia: "15 años",
        imagen: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
        disponibilidad: "Mañanas"
      },
      {
        nombre: "Dr. Ricardo Mendoza",
        especialidad: "Neuropsicología Cognitiva",
        clasificación: "5.0",
        experiencia: "10 años",
        imagen: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
        disponibilidad: "Tardes"
      },
      {
        nombre: "Dra. Sofía Valdivia",
        especialidad: "Especialista en Mindfulness",
        clasificación: "4.7",
        experiencia: "8 años",
        imagen: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400",
        disponibilidad: "Fines de semana"
      },
      {
        nombre: "Dra. Mariana Costa",
        especialidad: "Terapia de Pareja y Familia",
        clasificación: "4.9",
        experiencia: "14 años",
        imagen: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400",
        disponibilidad: "Lunes a Jueves"
      },
      {
        nombre: "Dr. Jorge Vega",
        especialidad: "Especialista en Depresión",
        clasificación: "4.8",
        experiencia: "20 años",
        imagen: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
        disponibilidad: "Lunes a Viernes"
      }
    ];

    for (const e of especialistas) {
      await sql`
        INSERT INTO especialistas (nombre, especialidad, clasificación, experiencia, imagen, disponibilidad)
        VALUES (${e.nombre}, ${e.especialidad}, ${e.clasificación}, ${e.experiencia}, ${e.imagen}, ${e.disponibilidad})
      `;
    }

    console.log('✅ Directorio actualizado con 6 especialistas reales.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  }
}

seed();

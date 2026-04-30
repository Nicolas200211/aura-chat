import postgres from 'postgres';

const sql = postgres('postgresql://postgres:d7zxFrml89zCqADw@db.byabuwrmjczekuvflpco.supabase.co:5432/postgres');

async function seed() {
  try {
    console.log('🚀 Iniciando Super Seed en Español...');

    // 1. Limpiar datos previos
    await sql`DELETE FROM ceremonias`;
    await sql`DELETE FROM especialistas`;

    // 2. Insertar Ceremonias (Ejercicios) con nombres reales de columnas
    const ceremonias = [
      {
        título: "Respiración 4-7-8",
        descripción: "Técnica de relajación profunda para calmar el sistema nervioso en minutos.",
        categoría: "Respiración",
        duración: "5 min",
        dificultad: "Principiante",
        imagen: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400",
        pasos: ["Inhala 4s", "Mantén 7s", "Exhala 8s"]
      },
      {
        título: "Box Breathing",
        descripción: "Respiración táctica utilizada para el enfoque y control del estrés extremo.",
        categoría: "Respiración",
        duración: "10 min",
        dificultad: "Intermedio",
        imagen: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=400",
        pasos: ["Inhala 4s", "Mantén 4s", "Exhala 4s", "Mantén 4s"]
      }
    ];

    for (const c of ceremonias) {
      await sql`
        INSERT INTO ceremonias (título, descripción, categoría, duración, dificultad, imagen, pasos)
        VALUES (${c.título}, ${c.descripción}, ${c.categoría}, ${c.duración}, ${c.dificultad}, ${c.imagen}, ${c.pasos})
      `;
    }

    // 3. Insertar Especialistas con nombres reales de columnas
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
      }
    ];

    for (const e of especialistas) {
      await sql`
        INSERT INTO especialistas (nombre, especialidad, clasificación, experiencia, imagen, disponibilidad)
        VALUES (${e.nombre}, ${e.especialidad}, ${e.clasificación}, ${e.experiencia}, ${e.imagen}, ${e.disponibilidad})
      `;
    }

    console.log('✅ Super Seed completado con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  }
}

seed();

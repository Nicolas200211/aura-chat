import postgres from 'postgres';

const sql = postgres('postgresql://postgres:d7zxFrml89zCqADw@db.byabuwrmjczekuvflpco.supabase.co:5432/postgres');

async function seed() {
  try {
    console.log('Iniciando Super Seed con datos reales...');

    // 1. Limpiar datos previos
    await sql`DELETE FROM exercises`;
    await sql`DELETE FROM specialists`;

    // 2. Insertar Ejercicios Reales
    const realExercises = [
      {
        title: "Respiración 4-7-8",
        description: "Una técnica de respiración relajante profunda que actúa como un tranquilizante natural para el sistema nervioso.",
        category: "Respiración",
        duration: "5 min",
        difficulty: "Principiante",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400",
        steps: ["Inhala por la nariz durante 4 segundos", "Mantén la respiración durante 7 segundos", "Exhala completamente por la boca durante 8 segundos"]
      },
      {
        title: "Box Breathing (Respiración Cuadrada)",
        description: "Utilizada por los Navy SEALs para mantener la calma y la concentración en situaciones de alto estrés.",
        category: "Respiración",
        duration: "10 min",
        difficulty: "Intermedio",
        image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=400",
        steps: ["Inhala en 4 tiempos", "Mantén 4 tiempos", "Exhala en 4 tiempos", "Mantén 4 tiempos"]
      },
      {
        title: "Meditación de Gratitud",
        description: "Enfoca tu mente en los aspectos positivos de tu vida para mejorar tu bienestar general y reducir la ansiedad.",
        category: "Meditación",
        duration: "15 min",
        difficulty: "Principiante",
        image: "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=400",
        steps: ["Cierra los ojos y respira profundo", "Visualiza 3 cosas por las que estés agradecido hoy", "Siente la calidez de esa gratitud en tu pecho"]
      }
    ];

    for (const ex of realExercises) {
      await sql`
        INSERT INTO exercises (title, description, category, duration, difficulty, image, steps)
        VALUES (${ex.title}, ${ex.description}, ${ex.category}, ${ex.duration}, ${ex.difficulty}, ${ex.image}, ${ex.steps})
      `;
    }

    // 3. Insertar Especialistas Realistas
    const realSpecialists = [
      {
        name: "Dra. Elena Martínez",
        specialty: "Psicóloga Clínica / TCC",
        rating: "4.9",
        experience: "12 años",
        image: "https://images.unsplash.com/photo-1559839734-2b71f1e3c7e5?auto=format&fit=crop&q=80&w=400",
        availability: "Lunes a Viernes"
      },
      {
        name: "Dr. Carlos Ruiz",
        specialty: "Psiquiatra / Especialista en Ansiedad",
        rating: "4.8",
        experience: "15 años",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
        availability: "Mañanas"
      },
      {
        name: "Lic. Sofía Vega",
        specialty: "Terapeuta Holística / Mindfulness",
        rating: "5.0",
        experience: "8 años",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400",
        availability: "Fines de semana"
      }
    ];

    for (const spec of realSpecialists) {
      await sql`
        INSERT INTO specialists (name, specialty, rating, experience, image, availability)
        VALUES (${spec.name}, ${spec.specialty}, ${spec.rating}, ${spec.experience}, ${spec.image}, ${spec.availability})
      `;
    }

    console.log('Super Seed completado con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error en el seed:', error);
    process.exit(1);
  }
}

seed();

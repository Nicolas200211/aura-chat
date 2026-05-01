import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { specialists, exercises } from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || '';
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

async function seed() {
  console.log('Sembrando datos iniciales...');

  await db.insert(specialists).values([
    {
      name: 'Dra. María García',
      specialty: 'Psicología Clínica',
      rating: '4.9',
      experience: '8 años',
      image: 'https://i.pravatar.cc/150?img=47',
      availability: 'Lun - Vie',
    },
    {
      name: 'Dr. Carlos López',
      specialty: 'Terapia Cognitivo-Conductual',
      rating: '4.8',
      experience: '12 años',
      image: 'https://i.pravatar.cc/150?img=12',
      availability: 'Lun - Sáb',
    },
    {
      name: 'Lic. Ana Martínez',
      specialty: 'Mindfulness y Bienestar',
      rating: '4.7',
      experience: '6 años',
      image: 'https://i.pravatar.cc/150?img=32',
      availability: 'Mar - Sáb',
    },
    {
      name: 'Dr. Roberto Silva',
      specialty: 'Psiquiatría',
      rating: '4.9',
      experience: '15 años',
      image: 'https://i.pravatar.cc/150?img=8',
      availability: 'Lun - Jue',
    },
  ]).onConflictDoNothing();

  await db.insert(exercises).values([
    {
      title: 'Respiración 4-7-8',
      description: 'Técnica de respiración para reducir la ansiedad y mejorar el sueño de forma rápida y efectiva.',
      category: 'respiracion',
      duration: '5 min',
      difficulty: 'Fácil',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      steps: [
        'Siéntate cómodamente con la espalda recta.',
        'Exhala completamente por la boca.',
        'Inhala por la nariz durante 4 segundos.',
        'Mantén el aire durante 7 segundos.',
        'Exhala lentamente por la boca durante 8 segundos.',
        'Repite el ciclo 4 veces.',
      ],
    },
    {
      title: 'Meditación Mindfulness',
      description: 'Práctica de atención plena para calmar la mente y conectar con el momento presente.',
      category: 'meditacion',
      duration: '10 min',
      difficulty: 'Medio',
      image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400',
      steps: [
        'Encuentra un lugar tranquilo y siéntate cómodamente.',
        'Cierra los ojos suavemente.',
        'Enfoca tu atención en tu respiración natural.',
        'Cuando tu mente divague, redirige la atención sin juzgarte.',
        'Observa los pensamientos sin engancharte a ellos.',
        'Finaliza tomando 3 respiraciones profundas.',
      ],
    },
    {
      title: 'Relajación Muscular Progresiva',
      description: 'Técnica para liberar la tensión corporal contrayendo y relajando grupos musculares.',
      category: 'relajacion',
      duration: '15 min',
      difficulty: 'Fácil',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      steps: [
        'Acuéstate o siéntate en una posición cómoda.',
        'Comienza por los pies: contrae los músculos 5 segundos.',
        'Suelta la tensión y siente la relajación 10 segundos.',
        'Sube progresivamente por piernas, abdomen, brazos.',
        'Finaliza con cuello y cara.',
        'Permanece en calma durante 2 minutos antes de levantarte.',
      ],
    },
    {
      title: 'Diario Emocional Guiado',
      description: 'Ejercicio de escritura para procesar emociones y ganar claridad mental.',
      category: 'escritura',
      duration: '20 min',
      difficulty: 'Fácil',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400',
      steps: [
        'Toma papel y lápiz o abre una nota digital.',
        'Escribe cómo te sientes en este momento sin filtros.',
        'Identifica qué situación generó esa emoción.',
        'Escribe 3 cosas que podrías hacer al respecto.',
        'Termina con una afirmación positiva sobre ti mismo.',
      ],
    },
    {
      title: 'Caminata Consciente',
      description: 'Práctica de movimiento consciente para reconectar con el cuerpo y reducir el estrés.',
      category: 'movimiento',
      duration: '15 min',
      difficulty: 'Fácil',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
      steps: [
        'Sal a un espacio abierto o camina dentro de casa.',
        'Reduce el ritmo de tu caminar al mínimo.',
        'Siente cada paso: el talón, la planta, los dedos.',
        'Observa lo que ves, escuchas y hueles sin juzgar.',
        'Sincroniza la respiración con tus pasos.',
        'Al terminar, quédate quieto 1 minuto agradeciendo.',
      ],
    },
  ]).onConflictDoNothing();

  console.log('Datos sembrados correctamente.');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Error en el seed:', error);
  process.exit(1);
});

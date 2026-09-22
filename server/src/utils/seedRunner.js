import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { seedDatabase } from './seedData.js';

dotenv.config();

async function run() {
  await connectDB();
  await seedDatabase();
  process.exit(0);
}

run();

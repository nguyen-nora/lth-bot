// Check if tables exist
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const tables = await prisma.$queryRaw`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'
  `;
  console.log('Tables in database:');
  tables.forEach(t => console.log(`  - ${t.name}`));
  
  const hasAttendances = tables.some(t => t.name === 'attendances');
  if (hasAttendances) {
    console.log('\n✅ attendances table exists!');
  } else {
    console.log('\n❌ attendances table NOT found!');
  }
  
  await prisma.$disconnect();
} catch (error) {
  console.error('Error:', error.message);
  await prisma.$disconnect();
  process.exit(1);
}


// Quick verification script
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  console.log('Verifying database...\n');

  // Test connection
  await prisma.$queryRaw`SELECT 1`;
  console.log('✅ Database connection successful');

  // Check attendance table structure
  const tableInfo = await prisma.$queryRaw`
    SELECT sql FROM sqlite_master WHERE type='table' AND name='attendances'
  `;
  
  if (tableInfo.length > 0) {
    const sql = tableInfo[0].sql;
    const hasUnique = sql.includes('UNIQUE') && sql.includes('user_id') && sql.includes('guild_id') && sql.includes('date');
    if (hasUnique) {
      console.log('❌ Attendance table still has unique constraint');
    } else {
      console.log('✅ Attendance table does NOT have unique constraint');
    }
  }

  // Test multiple inserts
  const testDate = new Date().toISOString().split('T')[0];
  const testGuild = 'verify-test';
  const testUser = 'verify-user';
  
  await prisma.attendance.create({
    data: { userId: testUser, guildId: testGuild, channelId: 'ch1', date: testDate, recordedAt: new Date() }
  });
  await prisma.attendance.create({
    data: { userId: testUser, guildId: testGuild, channelId: 'ch2', date: testDate, recordedAt: new Date() }
  });
  console.log('✅ Multiple records per day works!');
  
  await prisma.attendance.deleteMany({ where: { guildId: testGuild } });
  
  console.log('\n✅ Database is ready!');
  await prisma.$disconnect();
} catch (error) {
  console.error('❌ Error:', error.message);
  await prisma.$disconnect();
  process.exit(1);
}


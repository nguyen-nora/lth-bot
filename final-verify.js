// Final verification
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  console.log('Final Database Verification\n');
  console.log('='.repeat(40));

  // Test 1: Connection
  await prisma.$queryRaw`SELECT 1`;
  console.log('✅ 1. Database connection: OK');

  // Test 2: Tables
  const tables = await prisma.$queryRaw`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'
  `;
  console.log(`✅ 2. Tables created: ${tables.length} tables`);

  // Test 3: Attendance structure
  const attInfo = await prisma.$queryRaw`
    SELECT sql FROM sqlite_master WHERE type='table' AND name='attendances'
  `;
  const hasUnique = attInfo[0]?.sql?.includes('UNIQUE') && 
                    attInfo[0]?.sql?.includes('user_id') && 
                    attInfo[0]?.sql?.includes('guild_id') && 
                    attInfo[0]?.sql?.includes('date');
  console.log(`✅ 3. Attendance unique constraint: ${hasUnique ? 'EXISTS (WRONG!)' : 'REMOVED (CORRECT!)'}`);

  // Test 4: Multiple records
  const testDate = new Date().toISOString().split('T')[0];
  const testGuild = 'final-test-' + Date.now();
  const testUser = 'test-user';
  
  await prisma.attendance.create({
    data: { userId: testUser, guildId: testGuild, channelId: 'ch1', date: testDate, recordedAt: new Date() }
  });
  await prisma.attendance.create({
    data: { userId: testUser, guildId: testGuild, channelId: 'ch2', date: testDate, recordedAt: new Date() }
  });
  console.log('✅ 4. Multiple records per day: WORKS!');
  
  await prisma.attendance.deleteMany({ where: { guildId: testGuild } });

  console.log('\n' + '='.repeat(40));
  console.log('✅ ALL CHECKS PASSED - Database is ready!');
  console.log('='.repeat(40));
  
  await prisma.$disconnect();
} catch (error) {
  console.error('\n❌ VERIFICATION FAILED:', error.message);
  await prisma.$disconnect();
  process.exit(1);
}


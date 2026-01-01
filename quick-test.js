// Quick test to verify attendance works
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const testDate = new Date().toISOString().split('T')[0];
  const testGuild = 'quick-test-' + Date.now();
  const testUser = 'test-user';
  
  // Insert multiple records
  await prisma.attendance.create({
    data: { userId: testUser, guildId: testGuild, channelId: 'ch1', date: testDate, recordedAt: new Date() }
  });
  await prisma.attendance.create({
    data: { userId: testUser, guildId: testGuild, channelId: 'ch2', date: testDate, recordedAt: new Date() }
  });
  console.log('✅ Multiple records inserted successfully!');
  
  // Verify they exist
  const records = await prisma.attendance.findMany({
    where: { guildId: testGuild }
  });
  console.log(`✅ Found ${records.length} records for the same user/date`);
  
  // Cleanup
  await prisma.attendance.deleteMany({ where: { guildId: testGuild } });
  console.log('✅ Test data cleaned up');
  console.log('\n✅ Database is ready for the bot!');
  
  await prisma.$disconnect();
} catch (error) {
  console.error('❌ Error:', error.message);
  await prisma.$disconnect();
  process.exit(1);
}


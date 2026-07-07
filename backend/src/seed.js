const { sequelize } = require('./config/database');
const { User, Group, Membership } = require('./models');

async function seedTestUsers() {
  try {
    // Wait for connection
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Find your group (e.g., መርካቶ)
    const group = await Group.findOne({ where: { name: 'መርካቶ' } });
    if (!group) {
      console.log('❌ Group "መርካቶ" not found!');
      process.exit(1);
    }
    console.log(`✅ Found group: ${group.name} (ID: ${group.id})`);

    // Create 10 test users
    const testUsers = [];
    for (let i = 1; i <= 10; i++) {
      const user = await User.create({
        email: `user${i}@test.com`,
        password_hash: 'password123',
        full_name: `Test User ${i}`,
        phone: `+251 900 000 00${i}`,
        role: 'member',
        email_verified: true,
        is_active: true,
      });
      testUsers.push(user);
      console.log(`✅ Created: user${i}@test.com`);
    }

    // Make them request to join the group
    for (const user of testUsers) {
      await Membership.create({
        user_id: user.id,
        group_id: group.id,
        role: 'pending',
      });
      console.log(`✅ ${user.full_name} requested to join ${group.name}`);
    }

    console.log('\n🎉 All test users created and requested to join!');
    console.log('📋 Credentials:');
    console.log('  Email: user1@test.com - user10@test.com');
    console.log('  Password: password123');
    console.log(`  Group: ${group.name} (ID: ${group.id})`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedTestUsers();

const { sequelize } = require('./config/database');
const { User, Group, Membership } = require('./models');
const { Op } = require('sequelize');

async function addAllUsersToGroup() {
  try {
    // 1. Connect to the database
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // 2. Find your target group (change the name if needed)
    const group = await Group.findOne({ where: { name: 'መርካቶ' } });
    if (!group) {
      console.log('❌ Group "መርካቶ" not found!');
      console.log('📋 Available groups:');
      const allGroups = await Group.findAll({ attributes: ['id', 'name'] });
      allGroups.forEach(g => console.log(`   - ${g.name} (ID: ${g.id})`));
      process.exit(1);
    }
    console.log(`✅ Found group: ${group.name} (ID: ${group.id})`);

    // 3. Fetch ALL existing users from the database
    // You can add filters here if needed
    const allUsers = await User.findAll({
      where: {
        is_active: true,
        // Uncomment below to only add @test.com users:
        // email: { [Op.endsWith]: '@test.com' }
      },
      attributes: ['id', 'full_name', 'email'],
      order: [['id', 'ASC']],
    });

    if (allUsers.length === 0) {
      console.log('⚠️ No users found in the database. Nothing to add.');
      process.exit(0);
    }

    console.log(`📋 Found ${allUsers.length} existing users in the database.`);

    // 4. Loop through users and add them to the group
    let addedCount = 0;
    let skippedCount = 0;

    for (const user of allUsers) {
      // Check if this user is already a member of this group
      const existingMembership = await Membership.findOne({
        where: {
          user_id: user.id,
          group_id: group.id,
        },
      });

      if (existingMembership) {
        console.log(`⏭️ Skipped: ${user.full_name} (${user.email}) - Already a member.`);
        skippedCount++;
        continue;
      }

      // Create the membership with 'pending' status
      await Membership.create({
        user_id: user.id,
        group_id: group.id,
        role: 'pending',
      });

      console.log(`✅ Added: ${user.full_name} (${user.email}) requested to join.`);
      addedCount++;
    }

    // 5. Summary
    console.log('\n🎉 Process completed!');
    console.log(`📊 Summary: ${addedCount} users added, ${skippedCount} users skipped (already members).`);
    console.log(`🔗 Group: ${group.name} (ID: ${group.id})`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
addAllUsersToGroup();
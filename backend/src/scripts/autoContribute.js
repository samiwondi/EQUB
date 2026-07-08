const { sequelize } = require('../config/database');
const { Group, Membership, Cycle, Contribution, User } = require('../models');

async function autoContribute() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // ===== CHANGE THIS GROUP NAME IF NEEDED =====
    const groupName = 'መርካቶ';
    // ============================================

    const group = await Group.findOne({ where: { name: groupName } });
    if (!group) {
      console.log(`❌ Group "${groupName}" not found!`);
      process.exit(1);
    }
    console.log(`✅ Found group: ${group.name} (ID: ${group.id})`);

    const cycle = await Cycle.findOne({
      where: { group_id: group.id, status: 'active' },
    });
    if (!cycle) {
      console.log('❌ No active cycle found!');
      process.exit(1);
    }
    console.log(`✅ Active cycle (ID: ${cycle.id}), current round: ${cycle.current_round}`);

    // Get all active members (including admin)
    const members = await Membership.findAll({
      where: {
        group_id: group.id,
        role: ['member', 'admin'],
        active_in_cycle: true,
      },
      include: [{ model: User, attributes: ['id', 'full_name'] }],
    });

    if (members.length === 0) {
      console.log('⚠️ No active members found.');
      process.exit(0);
    }

    let added = 0;
    let skipped = 0;

    for (const member of members) {
      const existing = await Contribution.findOne({
        where: {
          user_id: member.user_id,
          group_id: group.id,
          cycle_id: cycle.id,
          round_number: cycle.current_round,
        },
      });

      if (existing) {
        console.log(`⏭️ ${member.User.full_name} already contributed for Round ${cycle.current_round}.`);
        skipped++;
        continue;
      }

      await Contribution.create({
        user_id: member.user_id,
        group_id: group.id,
        cycle_id: cycle.id,
        round_number: cycle.current_round,
        amount: group.contribution_amount,
        status: 'paid',
        payment_method: 'auto',
        paid_at: new Date(),
      });

      console.log(`✅ Added contribution for ${member.User.full_name} (Round ${cycle.current_round})`);
      added++;
    }

    console.log(`\n🎉 Done! Added ${added} contributions, ${skipped} already existed.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

autoContribute();
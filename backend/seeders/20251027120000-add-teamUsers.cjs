// seeders/20251027120000-add-teamUsers.js
'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, _Sequelize) {
    const salt = await bcrypt.genSalt(12);

    const [managerPassword, employeePassword] = await Promise.all([
      bcrypt.hash('Manager123!', salt),
      bcrypt.hash('Employee123!', salt),
    ]);

    // --- USERS ---
    await queryInterface.bulkInsert('User', [
      {
        name: 'Alice',
        surname: 'Smith',
        mobileNumber: '0987654321',
        email: 'alice.manager@example.com',
        password: managerPassword,
        role: 'manager',
        id_manager: null,
      },
      {
        name: 'John',
        surname: 'Doe',
        mobileNumber: '0123456789',
        email: 'john.employee@example.com',
        password: employeePassword,
        role: 'employee',
        id_manager: 1,
      },
    ]);

    // --- TEAMS ---
    await queryInterface.bulkInsert('Team', [ // No quotes, singular
      {
        name: 'Team Alpha',
        id_manager: 1,
        id_timetable: null,
      },
      {
        name: 'Team Beta',
        id_manager: 1,
        id_timetable: null,
      },
    ]);

    // --- TEAM MEMBERS ---
    await queryInterface.bulkInsert('TeamMember', [
      { teamId: 1, userId: 1 },
      { teamId: 1, userId: 2 },
    ]);

    console.log('✅ Teams and users seeded successfully.');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete('TeamMember', null, {});
    await queryInterface.bulkDelete('Team', null, {});
    await queryInterface.bulkDelete('User', {
      email: {
        [Sequelize.Op.in]: [
          'alice.manager@example.com',
          'john.employee@example.com',
        ],
      },
    });
  },
};
// migrations/xxxx-create-team.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Team', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id',
        },
      },
      timetableId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Timetable',
          key: 'id',
        },
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Team');
  },
};

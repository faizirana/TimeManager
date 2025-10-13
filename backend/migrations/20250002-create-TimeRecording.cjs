// migrations/xxxx-create-TimeRecording.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TimeRecording', {
      id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        timestamp: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        type: {
            type: Sequelize.ENUM('Arrival','Departure'),
            allowNull: false,
        },
        id_user: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'User',
                key: 'id',
            },
        },
      // Add other fields here
      });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TimeRecording');
  },
};

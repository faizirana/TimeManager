// migrations/xxxx-create-TimeRecording.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Timetable", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Shift_start: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Shift_end: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      // Add other fields here
    });
  },
  down: async (queryInterface, _Sequelize) => {
    await queryInterface.dropTable("Timetable");
  },
};

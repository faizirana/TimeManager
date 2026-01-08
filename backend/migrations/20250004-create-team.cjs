// migrations/xxxx-create-team.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Team", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_manager: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },
      id_timetable: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Timetable",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },
  down: async (queryInterface, _Sequelize) => {
    await queryInterface.dropTable("Team");
  },
};

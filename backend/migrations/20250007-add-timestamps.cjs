// migrations/20250007-add-timestamps.cjs
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add createdAt and updatedAt to User table
    await queryInterface.addColumn("User", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
    await queryInterface.addColumn("User", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    // Add createdAt and updatedAt to Team table
    await queryInterface.addColumn("Team", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
    await queryInterface.addColumn("Team", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    // Add createdAt and updatedAt to TeamMember table
    await queryInterface.addColumn("TeamMember", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
    await queryInterface.addColumn("TeamMember", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    // Add createdAt and updatedAt to TimeRecording table
    await queryInterface.addColumn("TimeRecording", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
    await queryInterface.addColumn("TimeRecording", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    // Add createdAt and updatedAt to Timetable table
    await queryInterface.addColumn("Timetable", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
    await queryInterface.addColumn("Timetable", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });
  },

  down: async (queryInterface, _Sequelize) => {
    // Remove timestamps in reverse order
    await queryInterface.removeColumn("Timetable", "updatedAt");
    await queryInterface.removeColumn("Timetable", "createdAt");

    await queryInterface.removeColumn("TimeRecording", "updatedAt");
    await queryInterface.removeColumn("TimeRecording", "createdAt");

    await queryInterface.removeColumn("TeamMember", "updatedAt");
    await queryInterface.removeColumn("TeamMember", "createdAt");

    await queryInterface.removeColumn("Team", "updatedAt");
    await queryInterface.removeColumn("Team", "createdAt");

    await queryInterface.removeColumn("User", "updatedAt");
    await queryInterface.removeColumn("User", "createdAt");
  },
};

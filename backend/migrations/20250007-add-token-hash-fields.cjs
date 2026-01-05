// migrations/20250007-add-token-hash-fields.cjs
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove old refreshToken column
    await queryInterface.removeColumn("User", "refreshToken");

    // Add new secure columns
    await queryInterface.addColumn("User", "refreshTokenHash", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("User", "refreshTokenFamily", {
      type: Sequelize.STRING(36), // UUID length
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Restore old structure
    await queryInterface.removeColumn("User", "refreshTokenHash");
    await queryInterface.removeColumn("User", "refreshTokenFamily");

    await queryInterface.addColumn("User", "refreshToken", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};

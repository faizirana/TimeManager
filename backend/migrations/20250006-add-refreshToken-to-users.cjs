// migrations/20250006-add-refreshToken-to-users.cjs
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("User", "refreshToken", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, _Sequelize) => {
    await queryInterface.removeColumn("User", "refreshToken");
  },
};

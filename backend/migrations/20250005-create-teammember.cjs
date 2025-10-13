// migrations/xxxx-create-team-member.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TeamMember', {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id',
        },
      },
      teamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Team',
          key: 'id',
        },
      },
    });

    // Add an unique constraint for the field userID.
    // Make the unicity of the apprtenance to a unique team for a user in Teammember.
    await queryInterface.addConstraint('TeamMember', {
      fields: ['userId'],
      type: 'unique',
      name: 'unique_team_member_user',
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TeamMember');
  },
};

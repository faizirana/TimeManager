"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename userId to id_user
    await queryInterface.renameColumn("TeamMember", "userId", "id_user");

    // Rename teamId to id_team
    await queryInterface.renameColumn("TeamMember", "teamId", "id_team");
  },

  async down(queryInterface, Sequelize) {
    // Revert id_user back to userId
    await queryInterface.renameColumn("TeamMember", "id_user", "userId");

    // Revert id_team back to teamId
    await queryInterface.renameColumn("TeamMember", "id_team", "teamId");
  },
};

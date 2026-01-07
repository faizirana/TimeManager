"use strict";

module.exports = {
  up: async (queryInterface, _Sequelize) => {
    // 1. Supprimer la contrainte unique sur id_user qui empêche le multi-équipes
    await queryInterface.removeConstraint("TeamMember", "unique_team_member_user");

    // 2. Ajouter une contrainte composite unique (id_user, id_team)
    // pour empêcher les doublons dans la même équipe
    await queryInterface.addConstraint("TeamMember", {
      fields: ["id_user", "id_team"],
      type: "unique",
      name: "unique_user_team_membership",
    });

    // 3. Supprimer les foreign keys existantes pour les recréer avec ON DELETE CASCADE
    await queryInterface.removeConstraint("TeamMember", "TeamMember_id_user_fkey");
    await queryInterface.removeConstraint("TeamMember", "TeamMember_id_team_fkey");

    // 4. Recréer les foreign keys avec ON DELETE CASCADE
    await queryInterface.addConstraint("TeamMember", {
      fields: ["id_user"],
      type: "foreign key",
      name: "TeamMember_id_user_fkey",
      references: {
        table: "User",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("TeamMember", {
      fields: ["id_team"],
      type: "foreign key",
      name: "TeamMember_id_team_fkey",
      references: {
        table: "Team",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface, _Sequelize) => {
    // 1. Supprimer la contrainte composite
    await queryInterface.removeConstraint("TeamMember", "unique_user_team_membership");

    // 2. Supprimer les foreign keys avec CASCADE
    await queryInterface.removeConstraint("TeamMember", "TeamMember_id_user_fkey");
    await queryInterface.removeConstraint("TeamMember", "TeamMember_id_team_fkey");

    // 3. Recréer les foreign keys sans CASCADE (état original)
    await queryInterface.addConstraint("TeamMember", {
      fields: ["id_user"],
      type: "foreign key",
      name: "TeamMember_id_user_fkey",
      references: {
        table: "User",
        field: "id",
      },
    });

    await queryInterface.addConstraint("TeamMember", {
      fields: ["id_team"],
      type: "foreign key",
      name: "TeamMember_id_team_fkey",
      references: {
        table: "Team",
        field: "id",
      },
    });

    // 4. Restaurer la contrainte unique sur id_user (état original)
    await queryInterface.addConstraint("TeamMember", {
      fields: ["id_user"],
      type: "unique",
      name: "unique_team_member_user",
    });
  },
};

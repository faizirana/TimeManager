"use strict";

module.exports = {
  up: async (queryInterface, _Sequelize) => {
    // 1. Supprimer la contrainte unique sur id_user qui empêche le multi-équipes
    try {
      await queryInterface.removeConstraint("TeamMember", "unique_team_member_user");
    } catch {
      console.log("⚠️  Constraint 'unique_team_member_user' not found, skipping...");
    }

    // 2. Ajouter une contrainte composite unique (id_user, id_team)
    // pour empêcher les doublons dans la même équipe
    await queryInterface.addConstraint("TeamMember", {
      fields: ["id_user", "id_team"],
      type: "unique",
      name: "unique_user_team_membership",
    });

    // 3. Trouver et supprimer les foreign keys existantes avec leur vrai nom
    const [fkConstraints] = await queryInterface.sequelize.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'TeamMember' 
      AND constraint_type = 'FOREIGN KEY'
    `);

    for (const constraint of fkConstraints) {
      await queryInterface.removeConstraint("TeamMember", constraint.constraint_name);
    }

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
    try {
      await queryInterface.removeConstraint("TeamMember", "unique_user_team_membership");
    } catch {
      console.log("⚠️  Constraint 'unique_user_team_membership' not found, skipping...");
    }

    // 2. Nettoyer les données : garder seulement la première appartenance par utilisateur
    await queryInterface.sequelize.query(`
      DELETE FROM "TeamMember" 
      WHERE ctid NOT IN (
        SELECT MIN(ctid) 
        FROM "TeamMember" 
        GROUP BY id_user
      )
    `);

    // 3. Trouver et supprimer toutes les foreign keys avec CASCADE
    const [fkConstraints] = await queryInterface.sequelize.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'TeamMember' 
      AND constraint_type = 'FOREIGN KEY'
    `);

    for (const constraint of fkConstraints) {
      await queryInterface.removeConstraint("TeamMember", constraint.constraint_name);
    }

    // 4. Recréer les foreign keys sans CASCADE (état original)
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

    // 5. Restaurer la contrainte unique sur id_user (état original)
    await queryInterface.addConstraint("TeamMember", {
      fields: ["id_user"],
      type: "unique",
      name: "unique_team_member_user",
    });
  },
};

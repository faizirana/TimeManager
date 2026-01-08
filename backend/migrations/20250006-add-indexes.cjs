// migrations/20250006-add-indexes.cjs
module.exports = {
  up: async (queryInterface, _Sequelize) => {
    // Helper function to check if index exists
    const indexExists = async (tableName, indexName) => {
      const [results] = await queryInterface.sequelize.query(`
        SELECT 1 FROM pg_indexes WHERE tablename = '${tableName}' AND indexname = '${indexName}'
      `);
      return results.length > 0;
    };

    // Add unique index on User.email for fast lookups and enforce uniqueness at DB level
    if (!(await indexExists("User", "user_email_unique_idx"))) {
      await queryInterface.addIndex("User", ["email"], {
        name: "user_email_unique_idx",
        unique: true,
      });
    }

    // Add index on User.id_manager for faster joins and queries
    if (!(await indexExists("User", "user_id_manager_idx"))) {
      await queryInterface.addIndex("User", ["id_manager"], {
        name: "user_id_manager_idx",
      });
    }

    // Add index on TimeRecording.id_user for filtering by user
    if (!(await indexExists("TimeRecording", "time_recording_id_user_idx"))) {
      await queryInterface.addIndex("TimeRecording", ["id_user"], {
        name: "time_recording_id_user_idx",
      });
    }

    // Add index on TimeRecording.timestamp for date-based queries and sorting
    if (!(await indexExists("TimeRecording", "time_recording_timestamp_idx"))) {
      await queryInterface.addIndex("TimeRecording", ["timestamp"], {
        name: "time_recording_timestamp_idx",
      });
    }

    // Add composite index on TimeRecording for common query pattern (user + date)
    if (!(await indexExists("TimeRecording", "time_recording_user_timestamp_idx"))) {
      await queryInterface.addIndex("TimeRecording", ["id_user", "timestamp"], {
        name: "time_recording_user_timestamp_idx",
      });
    }

    // Add index on TeamMember.id_user for faster lookups
    if (!(await indexExists("TeamMember", "team_member_user_id_idx"))) {
      await queryInterface.addIndex("TeamMember", ["id_user"], {
        name: "team_member_user_id_idx",
      });
    }

    // Add index on TeamMember.id_team for faster lookups
    if (!(await indexExists("TeamMember", "team_member_team_id_idx"))) {
      await queryInterface.addIndex("TeamMember", ["id_team"], {
        name: "team_member_team_id_idx",
      });
    }

    // Add index on Team.id_manager for filtering teams by manager
    if (!(await indexExists("Team", "team_id_manager_idx"))) {
      await queryInterface.addIndex("Team", ["id_manager"], {
        name: "team_id_manager_idx",
      });
    }

    // Add index on Team.id_timetable for joins
    if (!(await indexExists("Team", "team_id_timetable_idx"))) {
      await queryInterface.addIndex("Team", ["id_timetable"], {
        name: "team_id_timetable_idx",
      });
    }
  },

  down: async (queryInterface, _Sequelize) => {
    // Helper function to check if index exists
    const indexExists = async (tableName, indexName) => {
      const [results] = await queryInterface.sequelize.query(`
        SELECT 1 FROM pg_indexes WHERE tablename = '${tableName}' AND indexname = '${indexName}'
      `);
      return results.length > 0;
    };

    // Remove all indexes in reverse order (only if they exist)
    if (await indexExists("Team", "team_id_timetable_idx")) {
      await queryInterface.removeIndex("Team", "team_id_timetable_idx");
    }
    if (await indexExists("Team", "team_id_manager_idx")) {
      await queryInterface.removeIndex("Team", "team_id_manager_idx");
    }
    if (await indexExists("TeamMember", "team_member_team_id_idx")) {
      await queryInterface.removeIndex("TeamMember", "team_member_team_id_idx");
    }
    if (await indexExists("TeamMember", "team_member_user_id_idx")) {
      await queryInterface.removeIndex("TeamMember", "team_member_user_id_idx");
    }
    if (await indexExists("TimeRecording", "time_recording_user_timestamp_idx")) {
      await queryInterface.removeIndex("TimeRecording", "time_recording_user_timestamp_idx");
    }
    if (await indexExists("TimeRecording", "time_recording_timestamp_idx")) {
      await queryInterface.removeIndex("TimeRecording", "time_recording_timestamp_idx");
    }
    if (await indexExists("TimeRecording", "time_recording_id_user_idx")) {
      await queryInterface.removeIndex("TimeRecording", "time_recording_id_user_idx");
    }
    if (await indexExists("User", "user_id_manager_idx")) {
      await queryInterface.removeIndex("User", "user_id_manager_idx");
    }
    if (await indexExists("User", "user_email_unique_idx")) {
      await queryInterface.removeIndex("User", "user_email_unique_idx");
    }
  },
};

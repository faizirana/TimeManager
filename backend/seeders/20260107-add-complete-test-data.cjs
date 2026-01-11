// seeders/20260107-add-complete-test-data.cjs
"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, _Sequelize) {
    const salt = await bcrypt.genSalt(12);

    // Hash passwords for all users
    const [managerPassword, employeePassword] = await Promise.all([
      bcrypt.hash("Manager123!", salt),
      bcrypt.hash("Employee123!", salt),
    ]);

    // --- ADDITIONAL USERS ---
    // Insert users with explicit IDs to maintain consistency
    // Note: "admin" role does not exist in DB enum, using "manager" for admin user

    // First insert Alice and John (base users from original seed)
    await queryInterface.bulkInsert(
      "User",
      [
        {
          id: 1,
          name: "Alice",
          surname: "Smith",
          mobileNumber: "0987654321",
          email: "alice.manager@example.com",
          password: managerPassword,
          role: "manager",
          id_manager: null, // Top-level manager
        },
        {
          id: 2,
          name: "John",
          surname: "Doe",
          mobileNumber: "0123456789",
          email: "john.employee@example.com",
          password: employeePassword,
          role: "employee",
          id_manager: 1, // Reports to Alice
        },
      ],
      { ignoreDuplicates: true },
    );

    // Then insert admin (no manager)
    await queryInterface.bulkInsert(
      "User",
      [
        {
          id: 3,
          name: "System",
          surname: "Administrator",
          mobileNumber: "0900000000",
          email: "admin@example.com",
          password: managerPassword,
          role: "admin",
          id_manager: null,
        },
      ],
      { ignoreDuplicates: true },
    );

    // Then insert Sarah (manager reporting to Alice)
    await queryInterface.bulkInsert(
      "User",
      [
        {
          id: 4,
          name: "Sarah",
          surname: "Johnson",
          mobileNumber: "0987654322",
          email: "sarah.manager@example.com",
          password: managerPassword,
          role: "manager",
          id_manager: 1, // Reports to Alice for hierarchy demonstration
        },
      ],
      { ignoreDuplicates: true },
    );

    // Finally insert employees (some reporting to Alice, others to Sarah)
    await queryInterface.bulkInsert(
      "User",
      [
        {
          id: 5,
          name: "Mike",
          surname: "Brown",
          mobileNumber: "0123456788",
          email: "mike.employee@example.com",
          password: employeePassword,
          role: "employee",
          id_manager: 1, // Reports to Alice
        },
        {
          id: 6,
          name: "Lisa",
          surname: "Davis",
          mobileNumber: "0123456787",
          email: "lisa.employee@example.com",
          password: employeePassword,
          role: "employee",
          id_manager: 1, // Reports to Alice
        },
        {
          id: 7,
          name: "Emma",
          surname: "Wilson",
          mobileNumber: "0123456786",
          email: "emma.employee@example.com",
          password: employeePassword,
          role: "employee",
          id_manager: 1, // Reports to Alice
        },
        {
          id: 8,
          name: "David",
          surname: "Martinez",
          mobileNumber: "0123456785",
          email: "david.employee@example.com",
          password: employeePassword,
          role: "employee",
          id_manager: 4, // Reports to Sarah
        },
        {
          id: 9,
          name: "Sophie",
          surname: "Anderson",
          mobileNumber: "0123456784",
          email: "sophie.employee@example.com",
          password: employeePassword,
          role: "employee",
          id_manager: 4, // Reports to Sarah
        },
        {
          id: 10,
          name: "Tom",
          surname: "Taylor",
          mobileNumber: "0123456783",
          email: "tom.employee@example.com",
          password: employeePassword,
          role: "employee",
          id_manager: 4, // Reports to Sarah
        },
      ],
      { ignoreDuplicates: true },
    );

    // Reset the User sequence to avoid duplicate key errors
    await queryInterface.sequelize.query(
      `SELECT setval(pg_get_serial_sequence('"User"', 'id'), (SELECT MAX(id) FROM "User"));`,
    );

    // --- TIMETABLES ---
    await queryInterface.bulkInsert(
      "Timetable",
      [
        {
          id: 1,
          Shift_start: "09:00",
          Shift_end: "17:00",
        },
        {
          id: 2,
          Shift_start: "14:00",
          Shift_end: "22:00",
        },
        {
          id: 3,
          Shift_start: "08:00",
          Shift_end: "16:00",
        },
      ],
      { ignoreDuplicates: true },
    );

    // Reset the Timetable sequence to avoid duplicate key errors
    await queryInterface.sequelize.query(
      `SELECT setval(pg_get_serial_sequence('"Timetable"', 'id'), (SELECT MAX(id) FROM "Timetable"));`,
    );

    // --- CREATE TEAMS WITH TIMETABLES ---
    // Create Team Alpha with standard day shift (9-17) managed by Alice
    await queryInterface.bulkInsert(
      "Team",
      [
        {
          id: 1,
          name: "Team Alpha",
          id_manager: 1, // Managed by Alice
          id_timetable: 1, // Standard shift (9-17)
        },
        {
          id: 2,
          name: "Team Beta",
          id_manager: 1, // Managed by Alice
          id_timetable: 2, // Afternoon shift (14-22)
        },
        {
          id: 3,
          name: "Team Gamma",
          id_manager: 4, // Managed by Sarah
          id_timetable: 3, // Early shift (8-16)
        },
      ],
      { ignoreDuplicates: true },
    );

    // Reset the Team sequence to avoid duplicate key errors
    await queryInterface.sequelize.query(
      `SELECT setval(pg_get_serial_sequence('"Team"', 'id'), (SELECT MAX(id) FROM "Team"));`,
    );

    // --- ADD MORE TEAM MEMBERS (Multi-team membership) ---
    await queryInterface.bulkInsert(
      "TeamMember",
      [
        { id_team: 1, id_user: 1 }, // Alice (manager) in Team Alpha
        { id_team: 1, id_user: 5 }, // Mike in Team Alpha
        { id_team: 1, id_user: 6 }, // Lisa in Team Alpha
        { id_team: 2, id_user: 1 }, // Alice (manager) in Team Beta
        { id_team: 2, id_user: 6 }, // Lisa also in Team Beta (multi-membership)
        { id_team: 2, id_user: 7 }, // Emma in Team Beta
        { id_team: 2, id_user: 3 }, // Admin in Team Beta (for testing)
        { id_team: 3, id_user: 4 }, // Sarah (manager) in Team Gamma
        { id_team: 3, id_user: 8 }, // David in Team Gamma
        { id_team: 3, id_user: 9 }, // Sophie in Team Gamma
        { id_team: 3, id_user: 10 }, // Tom in Team Gamma
        { id_team: 3, id_user: 2 }, // John in Team Gamma
      ],
      { ignoreDuplicates: true },
    );

    // --- TIME RECORDINGS ---
    // Generate realistic time recordings for the past 7 days (2026-01-01 to 2026-01-07)
    const timeRecordings = [];
    let recordingId = 1;

    // John's recordings (user 2) - consistent 9-5 worker
    for (let day = 1; day <= 7; day++) {
      // Skip weekend (Jan 4 & 5 = Saturday & Sunday)
      if (day === 4 || day === 5) continue;

      timeRecordings.push({
        id: recordingId++,
        timestamp: `2026-01-0${day}T09:00:00.000Z`,
        type: "Arrival",
        id_user: 2,
      });
      timeRecordings.push({
        id: recordingId++,
        timestamp: `2026-01-0${day}T17:00:00.000Z`,
        type: "Departure",
        id_user: 2,
      });
    }

    // Mike's recordings (user 5) - slightly late arrivals
    for (let day = 1; day <= 7; day++) {
      if (day === 4 || day === 5) continue;

      timeRecordings.push({
        id: recordingId++,
        timestamp: `2026-01-0${day}T09:15:00.000Z`,
        type: "Arrival",
        id_user: 5,
      });
      timeRecordings.push({
        id: recordingId++,
        timestamp: `2026-01-0${day}T17:30:00.000Z`,
        type: "Departure",
        id_user: 5,
      });
    }

    // Lisa's recordings (user 6) - afternoon shift worker
    for (let day = 1; day <= 7; day++) {
      if (day === 4 || day === 5) continue;

      timeRecordings.push({
        id: recordingId++,
        timestamp: `2026-01-0${day}T14:00:00.000Z`,
        type: "Arrival",
        id_user: 6,
      });
      timeRecordings.push({
        id: recordingId++,
        timestamp: `2026-01-0${day}T22:00:00.000Z`,
        type: "Departure",
        id_user: 6,
      });
    }

    // Emma's recordings (user 7) - early shift worker
    for (let day = 1; day <= 7; day++) {
      if (day === 4 || day === 5) continue;

      timeRecordings.push({
        id: recordingId++,
        timestamp: `2026-01-0${day}T08:00:00.000Z`,
        type: "Arrival",
        id_user: 7,
      });
      timeRecordings.push({
        id: recordingId++,
        timestamp: `2026-01-0${day}T16:00:00.000Z`,
        type: "Departure",
        id_user: 7,
      });
    }

    // Add recordings for Alice (manager) - Team Alpha manager
    timeRecordings.push({
      id: recordingId++,
      timestamp: "2026-01-02T09:30:00.000Z",
      type: "Arrival",
      id_user: 1,
    });
    timeRecordings.push({
      id: recordingId++,
      timestamp: "2026-01-02T16:30:00.000Z",
      type: "Departure",
      id_user: 1,
    });
    timeRecordings.push({
      id: recordingId++,
      timestamp: "2026-01-06T10:00:00.000Z",
      type: "Arrival",
      id_user: 1,
    });
    timeRecordings.push({
      id: recordingId++,
      timestamp: "2026-01-06T15:00:00.000Z",
      type: "Departure",
      id_user: 1,
    });

    // David's recordings (user 8) - Team Gamma early shift, always punctual
    for (let day = 1; day <= 7; day++) {
      if (day === 4 || day === 5) continue;

      timeRecordings.push({
        id: recordingId++,
        timestamp: `2026-01-0${day}T08:00:00.000Z`,
        type: "Arrival",
        id_user: 8,
      });
      timeRecordings.push({
        id: recordingId++,
        timestamp: `2026-01-0${day}T16:00:00.000Z`,
        type: "Departure",
        id_user: 8,
      });
    }

    // Sophie's recordings (user 9) - Team Gamma, regular 5-10 min delays
    const sophieDelays = [5, 10, 8, 12, 7]; // minutes late per day
    let dayIndex = 0;
    for (let day = 1; day <= 7; day++) {
      if (day === 4 || day === 5) continue;

      const arrivalHour = 8;
      const arrivalMinute = sophieDelays[dayIndex];
      timeRecordings.push({
        id: recordingId++,
        timestamp: `2026-01-0${day}T0${arrivalHour}:${arrivalMinute.toString().padStart(2, "0")}:00.000Z`,
        type: "Arrival",
        id_user: 9,
      });
      timeRecordings.push({
        id: recordingId++,
        timestamp: `2026-01-0${day}T16:${arrivalMinute.toString().padStart(2, "0")}:00.000Z`,
        type: "Departure",
        id_user: 9,
      });
      dayIndex++;
    }

    // Tom's recordings (user 10) - Team Gamma, occasional early departures (10-15 min)
    const tomEarlyLeaves = [0, 15, 0, 10, 0]; // minutes early per day (0 = on time)
    dayIndex = 0;
    for (let day = 1; day <= 7; day++) {
      if (day === 4 || day === 5) continue;

      timeRecordings.push({
        id: recordingId++,
        timestamp: `2026-01-0${day}T08:05:00.000Z`,
        type: "Arrival",
        id_user: 10,
      });

      const earlyLeave = tomEarlyLeaves[dayIndex];
      const departureMinute = earlyLeave > 0 ? 60 - earlyLeave : 0;
      const departureHour = earlyLeave > 0 ? 15 : 16;
      timeRecordings.push({
        id: recordingId++,
        timestamp: `2026-01-0${day}T${departureHour}:${departureMinute.toString().padStart(2, "0")}:00.000Z`,
        type: "Departure",
        id_user: 10,
      });
      dayIndex++;
    }

    // Sarah's recordings (user 4) - Manager spot checks on Team Gamma days
    timeRecordings.push({
      id: recordingId++,
      timestamp: "2026-01-02T08:30:00.000Z",
      type: "Arrival",
      id_user: 4,
    });
    timeRecordings.push({
      id: recordingId++,
      timestamp: "2026-01-02T15:30:00.000Z",
      type: "Departure",
      id_user: 4,
    });
    timeRecordings.push({
      id: recordingId++,
      timestamp: "2026-01-06T09:00:00.000Z",
      type: "Arrival",
      id_user: 4,
    });
    timeRecordings.push({
      id: recordingId++,
      timestamp: "2026-01-06T14:00:00.000Z",
      type: "Departure",
      id_user: 4,
    });

    await queryInterface.bulkInsert("TimeRecording", timeRecordings, {
      ignoreDuplicates: true,
    });

    // Reset the TimeRecording sequence to avoid duplicate key errors
    await queryInterface.sequelize.query(
      `SELECT setval(pg_get_serial_sequence('"TimeRecording"', 'id'), (SELECT MAX(id) FROM "TimeRecording"));`,
    );

    console.log("✅ Complete test data seeded successfully!");
    console.log("   - Added 8 additional users (1 admin, 1 manager, 6 employees)");
    console.log("   - Created 3 timetables (9-5, 2-10, 8-4 shifts)");
    console.log("   - Created/updated 3 teams with timetables");
    console.log("     • Team Alpha (Manager: Alice, Shift: 9-17)");
    console.log("     • Team Beta (Manager: Alice, Shift: 14-22)");
    console.log("     • Team Gamma (Manager: Sarah, Shift: 8-16)");
    console.log("   - Added multi-team memberships (Lisa in Alpha & Beta)");
    console.log(`   - Generated ${timeRecordings.length} time recordings with realistic patterns`);
    console.log("   - Login example: alice.manager@example.com / Manager123!");
  },

  async down(queryInterface, Sequelize) {
    // Remove time recordings
    await queryInterface.bulkDelete("TimeRecording", null, {});

    // Remove additional team members
    await queryInterface.bulkDelete("TeamMember", {
      id_user: { [Sequelize.Op.in]: [3, 4, 5, 6, 7, 8, 9, 10] },
    });

    // Remove Team Gamma
    await queryInterface.bulkDelete("Team", { id: 3 });

    // Reset teams timetable assignments
    await queryInterface.bulkUpdate(
      "Team",
      { id_timetable: null },
      { id: { [Sequelize.Op.in]: [1, 2] } },
    );

    // Remove timetables
    await queryInterface.bulkDelete("Timetable", null, {});

    // Remove additional users
    await queryInterface.bulkDelete("User", {
      email: {
        [Sequelize.Op.in]: [
          "admin@example.com",
          "sarah.manager@example.com",
          "mike.employee@example.com",
          "lisa.employee@example.com",
          "emma.employee@example.com",
          "david.employee@example.com",
          "sophie.employee@example.com",
          "tom.employee@example.com",
        ],
      },
    });

    console.log("✅ Test data rollback completed.");
  },
};

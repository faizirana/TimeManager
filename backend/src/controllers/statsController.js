import db from "../../models/index.cjs";
import { Op } from "sequelize";

const { User, Team, TimeRecording, Timetable, sequelize } = db;

/**
 * Get advanced admin statistics
 * Returns comprehensive stats for the admin dashboard
 */
export const getAdminStats = async (req, res) => {
  try {
    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Execute all queries in parallel
    const [
      totalUsers,
      totalTeams,
      totalTimetables,
      roleDistribution,
      todayRecordings,
      currentlyPresent,
      teamsWithoutTimetable,
      avgTeamSize,
      managersWithTeams,
      totalManagers,
    ] = await Promise.all([
      // Basic counts
      User.count(),
      Team.count(),
      Timetable.count(),

      // Role distribution
      User.findAll({
        attributes: ["role", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
        group: ["role"],
        raw: true,
      }),

      // Today's time recordings
      TimeRecording.count({
        where: {
          timestamp: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      }),

      // Currently present employees (last recording was Arrival)
      sequelize.query(
        `
        SELECT COUNT(DISTINCT tr.id_user) as count
        FROM "TimeRecording" tr
        INNER JOIN (
          SELECT id_user, MAX(timestamp) as last_timestamp
          FROM "TimeRecording"
          GROUP BY id_user
        ) latest ON tr.id_user = latest.id_user AND tr.timestamp = latest.last_timestamp
        WHERE tr.type = 'Arrival'
        AND DATE(tr.timestamp) = CURRENT_DATE
      `,
        { type: sequelize.QueryTypes.SELECT },
      ),

      // Teams without timetable
      Team.count({
        where: {
          id_timetable: null,
        },
      }),

      // Average team size
      sequelize.query(
        `
        SELECT AVG(member_count) as "avgSize"
        FROM (
          SELECT id_team, COUNT(*) as member_count
          FROM "TeamMember"
          GROUP BY id_team
        ) AS team_sizes
      `,
        { type: sequelize.QueryTypes.SELECT },
      ),

      // Managers with teams
      sequelize.query(
        `
        SELECT COUNT(DISTINCT id_manager) as count
        FROM "Team"
      `,
        { type: sequelize.QueryTypes.SELECT },
      ),

      // Total managers
      User.count({
        where: {
          role: "manager",
        },
      }),
    ]);

    // Format role distribution
    const roles = {
      managers: 0,
      employees: 0,
      admins: 0,
    };

    roleDistribution.forEach((item) => {
      if (item.role === "manager") roles.managers = parseInt(item.count);
      else if (item.role === "employee") roles.employees = parseInt(item.count);
      else if (item.role === "admin") roles.admins = parseInt(item.count);
    });

    // Format response
    const stats = {
      // Basic counts
      totalUsers,
      totalTeams,
      totalTimetables,

      // Role distribution
      roles,

      // Activity
      todayRecordings,
      currentlyPresent: currentlyPresent[0]?.count || 0,

      // Team health
      teamsWithoutTimetable,
      avgTeamSize: parseFloat(avgTeamSize[0]?.avgSize || 0).toFixed(1),

      // Managers
      activeManagers: managersWithTeams[0]?.count || 0,
      inactiveManagers: totalManagers - (managersWithTeams[0]?.count || 0),
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching admin statistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

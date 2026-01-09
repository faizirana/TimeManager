import db from "../../models/index.cjs";

const { Team, User, TeamMember, sequelize } = db;

// GET /teams
export const getTeams = async (req, res) => {
  try {
    const { id_user, id_manager } = req.query;
    const whereClause = {};

    // Filter by manager
    if (id_manager) {
      whereClause.id_manager = id_manager;
    }

    // Filter by member (user in team)
    if (id_user) {
      const memberships = await TeamMember.findAll({
        where: { id_user },
        attributes: ["id_user", "id_team"],
      });
      const teamIds = memberships.map((m) => m.id_team);
      whereClause.id = teamIds.length ? teamIds : [-1];
    }

    const teams = await Team.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["id", "name", "surname", "email"],
        },
        {
          model: User,
          as: "members",
          attributes: ["id", "name", "surname", "email", "role"],
          through: { attributes: [] }, // No attributes from join table
        },
      ],
      attributes: ["id", "id_manager", "id_timetable", "name"],
    });

    res.status(200).json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /teams/:id
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: [
        { model: User, as: "manager", attributes: ["id", "name", "surname", "email"] },
        {
          model: User,
          as: "members",
          attributes: ["id", "name", "surname", "email", "role"],
          through: { attributes: [] },
        },
      ],
    });

    if (!team) return res.status(404).json({ message: "Team not found" });
    return res.status(200).json(team);
  } catch (error) {
    console.error("Error fetching team:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /teams
export const createTeam = async (req, res) => {
  const { name, id_manager, id_timetable } = req.body;
  if (!name || !id_manager)
    return res.status(400).json({ message: "name and id_manager are required" });

  try {
    const manager = await User.findByPk(id_manager);
    if (!manager) return res.status(400).json({ message: "Manager does not exist" });

    const newTeam = await Team.create({ name, id_manager, id_timetable });
    return res.status(201).json(newTeam);
  } catch (error) {
    console.error("Error creating team:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /teams/:id
export const updateTeam = async (req, res) => {
  const { name, id_manager, id_timetable } = req.body;

  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (id_manager) {
      const manager = await User.findByPk(id_manager);
      if (!manager) return res.status(400).json({ message: "Manager does not exist" });
    }

    await team.update({
      name: name ?? team.name,
      id_manager: id_manager ?? team.id_manager,
      id_timetable: id_timetable ?? team.id_timetable,
    });
    return res.status(200).json(team);
  } catch (error) {
    console.error("Error updating team:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /teams/:id
export const deleteTeam = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const team = await Team.findByPk(req.params.id, { transaction });
    if (!team) {
      await transaction.rollback();
      return res.status(404).json({ message: "Team not found" });
    }

    await team.destroy({ transaction });
    await transaction.commit();
    return res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting team:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /teams/:id/users
export const addUserToTeam = async (req, res) => {
  const { id } = req.params;
  const { id_user } = req.body;

  if (!id_user) return res.status(400).json({ message: "id_user is required" });

  const transaction = await sequelize.transaction();

  try {
    const team = await Team.findByPk(id, { transaction });
    const user = await User.findByPk(id_user, { transaction });
    if (!team || !user) {
      await transaction.rollback();
      return res.status(404).json({ message: "Team or user not found" });
    }

    // Check if already in team
    const exists = await TeamMember.findOne({ where: { id_team: id, id_user }, transaction });
    if (exists) {
      await transaction.rollback();
      return res.status(400).json({ message: "User already in this team" });
    }

    await TeamMember.create({ id_team: id, id_user }, { transaction });
    await transaction.commit();
    return res.status(201).json({ message: "User added to team" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error adding user to team:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /teams/:id/users/:userId
export const removeUserFromTeam = async (req, res) => {
  const { id, userId: id_user } = req.params;

  const transaction = await sequelize.transaction();

  try {
    const link = await TeamMember.findOne({ where: { id_team: id, id_user }, transaction });
    if (!link) {
      await transaction.rollback();
      return res.status(404).json({ message: "User not in this team" });
    }

    await link.destroy({ transaction });
    await transaction.commit();
    return res.status(200).json({ message: "User removed from team" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error removing user from team:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get statistics for a specific team
 * Returns aggregated stats for all team members
 */
export const getTeamStats = async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    const { start_date, end_date } = req.query;

    // Get team with members
    const team = await Team.findByPk(teamId, {
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["id", "name", "surname", "email"],
        },
        {
          model: User,
          as: "members",
          attributes: ["id", "name", "surname", "email"],
          through: { attributes: [] },
        },
      ],
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Authorization check
    if (req.user.role === "manager" && team.id_manager !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden - Cannot access statistics for other managers' teams",
      });
    }

    // Get member IDs
    const memberIds = team.members.map((m) => m.id);

    if (memberIds.length === 0) {
      return res.status(200).json({
        team: {
          id: team.id,
          name: team.name,
          manager: team.manager,
        },
        statistics: [],
        aggregated: {
          totalMembers: 0,
          totalHours: 0,
          averageHoursPerMember: 0,
        },
        period: {
          start: start_date || null,
          end: end_date || null,
        },
      });
    }

    // Build where clause for time recordings
    const whereClause = {
      id_user: memberIds,
    };

    if (start_date || end_date) {
      whereClause.timestamp = {};
      if (start_date) {
        whereClause.timestamp[db.Sequelize.Op.gte] = new Date(start_date);
      }
      if (end_date) {
        whereClause.timestamp[db.Sequelize.Op.lte] = new Date(end_date);
      }
    }

    // Fetch all recordings for team members
    const recordings = await db.TimeRecording.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "surname", "email"],
        },
      ],
      order: [
        ["id_user", "ASC"],
        ["timestamp", "ASC"],
      ],
    });

    // Calculate stats per user
    const userStats = {};
    recordings.forEach((record) => {
      const userId = record.id_user;

      if (!userStats[userId]) {
        userStats[userId] = {
          user: {
            id: record.user.id,
            name: record.user.name,
            surname: record.user.surname,
            email: record.user.email,
          },
          totalHours: 0,
          totalDays: 0,
          arrivals: [],
          departures: [],
        };
      }

      if (record.type === "Arrival") {
        userStats[userId].arrivals.push(record.timestamp);
      } else {
        userStats[userId].departures.push(record.timestamp);
      }
    });

    // Calculate work hours
    let teamTotalHours = 0;
    let teamTotalDays = 0;
    let teamTotalAveragePerDay = 0;

    Object.keys(userStats).forEach((userId) => {
      const stats = userStats[userId];
      const { arrivals, departures } = stats;

      const workDays = new Set();
      for (let i = 0; i < Math.min(arrivals.length, departures.length); i++) {
        const arrival = new Date(arrivals[i]);
        const departure = new Date(departures[i]);

        if (departure > arrival) {
          const hoursWorked = (departure - arrival) / (1000 * 60 * 60);
          stats.totalHours += hoursWorked;

          const dayKey = arrival.toISOString().split("T")[0];
          workDays.add(dayKey);
        }
      }

      stats.totalDays = workDays.size;
      stats.averageHoursPerDay = stats.totalDays > 0 ? stats.totalHours / stats.totalDays : 0;

      // Accumulate for team aggregations
      teamTotalHours += stats.totalHours;
      teamTotalDays += stats.totalDays;
      teamTotalAveragePerDay += stats.averageHoursPerDay;

      delete stats.arrivals;
      delete stats.departures;
    });

    const statsArray = Object.values(userStats);
    const memberCount = memberIds.length;

    // Calculate team averages according to new formulas:
    // - totalHours: sum of all member hours
    // - averageDaysWorked: (1/memberCount) * sum of days worked by each member
    // - averageHoursPerDay: (1/memberCount) * sum of average hours per day of each member
    return res.status(200).json({
      team: {
        id: team.id,
        name: team.name,
        manager: team.manager,
      },
      statistics: statsArray,
      aggregated: {
        totalMembers: memberCount,
        totalHours: teamTotalHours,
        averageDaysWorked: memberCount > 0 ? teamTotalDays / memberCount : 0,
        averageHoursPerDay: memberCount > 0 ? teamTotalAveragePerDay / memberCount : 0,
      },
      period: {
        start: start_date || null,
        end: end_date || null,
      },
    });
  } catch (error) {
    console.error("Error fetching team statistics:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

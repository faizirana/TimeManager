import db from "../../models/index.cjs";

const { Team, User, TeamMember } = db;

// GET /teams
export const getTeams = async (req, res) => {
  try {
    const { id_user } = req.query;
    const whereClause = {};

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
  const { name, id_manager } = req.body;
  if (!name || !id_manager)
    return res.status(400).json({ message: "name and id_manager are required" });

  try {
    const manager = await User.findByPk(id_manager);
    if (!manager) return res.status(400).json({ message: "Manager does not exist" });

    const newTeam = await Team.create({ name, id_manager });
    return res.status(201).json(newTeam);
  } catch (error) {
    console.error("Error creating team:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /teams/:id
export const updateTeam = async (req, res) => {
  const { name, id_manager } = req.body;

  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (id_manager) {
      const manager = await User.findByPk(id_manager);
      if (!manager) return res.status(400).json({ message: "Manager does not exist" });
    }

    await team.update({ name: name ?? team.name, id_manager: id_manager ?? team.id_manager });
    return res.status(200).json(team);
  } catch (error) {
    console.error("Error updating team:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /teams/:id
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    await team.destroy();
    return res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /teams/:id/users
export const addUserToTeam = async (req, res) => {
  const { id } = req.params;
  const { id_user } = req.body;

  if (!id_user) return res.status(400).json({ message: "id_user is required" });

  try {
    const team = await Team.findByPk(id);
    const user = await User.findByPk(id_user);
    if (!team || !user) return res.status(404).json({ message: "Team or user not found" });

    // Check if already in team
    const exists = await TeamMember.findOne({ where: { id_team: id, id_user } });
    if (exists) return res.status(400).json({ message: "User already in this team" });

    await TeamMember.create({ id_team: id, id_user });
    return res.status(201).json({ message: "User added to team" });
  } catch (error) {
    console.error("Error adding user to team:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /teams/:id/users/:userId
export const removeUserFromTeam = async (req, res) => {
  const { id, userId: id_user } = req.params;

  try {
    const link = await TeamMember.findOne({ where: { id_team: id, id_user } });
    if (!link) return res.status(404).json({ message: "User not in this team" });

    await link.destroy();
    return res.status(200).json({ message: "User removed from team" });
  } catch (error) {
    console.error("Error removing user from team:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /teams/validate/conflicts
export const validateTeamAssignments = async (req, res) => {
  try {
    const teams = await Team.findAll({ include: [{ model: User, as: "members" }] });

    // Simple rule: a user cannot belong to 2 teams managed by the same manager
    const userToManagers = {};

    for (const team of teams) {
      for (const user of team.members) {
        if (!userToManagers[user.id]) userToManagers[user.id] = new Set();
        if (userToManagers[user.id].has(team.id_manager)) {
          return res.status(400).json({
            message: `User ${user.id} is in conflicting teams managed by manager ${team.id_manager}`,
          });
        }
        userToManagers[user.id].add(team.id_manager);
      }
    }

    return res.status(200).json({ message: "All team assignments are valid" });
  } catch (error) {
    console.error("Error validating team assignments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

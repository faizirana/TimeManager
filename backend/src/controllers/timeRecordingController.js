import db from "../../models/index.cjs";
const { TimeRecording, User, Team, TeamMember } = db;

/**
 * Get all time recordings with optional filters
 * Employees can only view their own recordings
 * Managers can view their team members' recordings
 * Admins can view all recordings
 */
export const getTimeRecordings = async (req, res) => {
  try {
    const { id_user, start_date, end_date, type } = req.query;
    const whereClause = {};

    // Authorization logic
    if (req.user.role === "employee") {
      // Employees can only see their own recordings
      whereClause.id_user = req.user.id;
    } else if (req.user.role === "manager") {
      // Managers can see their team members' recordings
      if (id_user) {
        // Check if the requested user is in the manager's team
        const teamMember = await TeamMember.findOne({
          include: [
            {
              model: Team,
              as: "team",
              where: { id_manager: req.user.id },
            },
          ],
          where: { id_user: parseInt(id_user) },
        });

        if (!teamMember && parseInt(id_user) !== req.user.id) {
          return res
            .status(403)
            .json({
              message: "Interdit - Impossible d'accéder aux enregistrements d'autres utilisateurs",
            });
        }
        whereClause.id_user = parseInt(id_user);
      } else {
        // Get all team members for this manager
        const teamMembers = await TeamMember.findAll({
          include: [
            {
              model: Team,
              as: "team",
              where: { id_manager: req.user.id },
            },
          ],
        });
        const memberIds = teamMembers.map((tm) => tm.id_user);
        memberIds.push(req.user.id); // Include manager's own recordings
        whereClause.id_user = memberIds;
      }
    } else if (req.user.role === "admin") {
      // Admins can see all recordings
      if (id_user) {
        whereClause.id_user = parseInt(id_user);
      }
    }

    // Apply filters
    if (type && ["Arrival", "Departure"].includes(type)) {
      whereClause.type = type;
    }

    if (start_date || end_date) {
      whereClause.timestamp = {};
      if (start_date) {
        whereClause.timestamp[db.Sequelize.Op.gte] = new Date(start_date);
      }
      if (end_date) {
        whereClause.timestamp[db.Sequelize.Op.lte] = new Date(end_date);
      }
    }

    const recordings = await TimeRecording.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "surname", "email"],
        },
      ],
      order: [["timestamp", "DESC"]],
    });

    return res.status(200).json(recordings);
  } catch (error) {
    console.error("Error fetching time recordings:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

/**
 * Get a single time recording by ID
 * Authorization: Same rules as getTimeRecordings
 */
export const getTimeRecordingById = async (req, res) => {
  try {
    const recording = await TimeRecording.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "surname", "email"],
        },
      ],
    });

    if (!recording) {
      return res.status(404).json({ message: "Enregistrement de temps introuvable" });
    }

    // Authorization check
    if (req.user.role === "employee" && recording.id_user !== req.user.id) {
      return res
        .status(403)
        .json({
          message: "Interdit - Impossible d'accéder aux enregistrements d'autres utilisateurs",
        });
    }

    if (req.user.role === "manager") {
      // Check if the user is in the manager's team
      const teamMember = await TeamMember.findOne({
        include: [
          {
            model: Team,
            as: "team",
            where: { id_manager: req.user.id },
          },
        ],
        where: { id_user: recording.id_user },
      });

      if (!teamMember && recording.id_user !== req.user.id) {
        return res
          .status(403)
          .json({
            message: "Interdit - Impossible d'accéder aux enregistrements d'autres utilisateurs",
          });
      }
    }

    return res.status(200).json(recording);
  } catch (error) {
    console.error("Error fetching time recording:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

/**
 * Create a new time recording
 * Validates that there are no consecutive Arrivals or Departures
 */
export const createTimeRecording = async (req, res) => {
  const { timestamp, type, id_user } = req.body;

  // Validation
  if (!timestamp || !type || !id_user) {
    return res.status(400).json({
      message: "L'horodatage, le type et l'id_user sont requis",
    });
  }

  if (!["Arrival", "Departure"].includes(type)) {
    return res.status(400).json({
      message: 'Le type doit être "Arrival" ou "Departure"',
    });
  }

  try {
    // Authorization: Employees can only create their own recordings
    if (req.user.role === "employee" && parseInt(id_user) !== req.user.id) {
      return res
        .status(403)
        .json({
          message: "Interdit - Les employés ne peuvent créer que leurs propres enregistrements",
        });
    }

    // Managers can create for their team members
    if (req.user.role === "manager" && parseInt(id_user) !== req.user.id) {
      const teamMember = await TeamMember.findOne({
        include: [
          {
            model: Team,
            as: "team",
            where: { id_manager: req.user.id },
          },
        ],
        where: { id_user: parseInt(id_user) },
      });

      if (!teamMember) {
        return res.status(403).json({
          message:
            "Interdit - Impossible de créer des enregistrements pour des utilisateurs hors de votre équipe",
        });
      }
    }

    // Check for duplicate consecutive type (anti-doublon validation)
    const lastRecording = await TimeRecording.findOne({
      where: { id_user: parseInt(id_user) },
      order: [["timestamp", "DESC"]],
    });

    if (lastRecording && lastRecording.type === type) {
      return res.status(400).json({
        message: `Cannot clock ${type.toLowerCase()} twice without clocking ${
          type === "Arrival" ? "out" : "in"
        } first`,
      });
    }

    // Verify user exists
    const targetUser = await User.findByPk(parseInt(id_user));
    if (!targetUser) {
      return res.status(404).json({
        error: "Non trouvé",
        message: `Utilisateur avec l'ID ${id_user} introuvable`,
      });
    }

    // Create the time recording
    const newRecording = await TimeRecording.create({
      timestamp: new Date(timestamp),
      type,
      id_user: parseInt(id_user),
    });

    return res.status(201).json(newRecording);
  } catch (error) {
    console.error("Error creating time recording:", error);

    // Handle Sequelize validation errors
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        error: "Erreur de validation",
        message: error.errors.map((e) => e.message).join(", "),
        details: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
          value: e.value,
        })),
      });
    }

    // Handle Sequelize foreign key constraint errors
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        error: "Erreur de contrainte de clé étrangère",
        message: "L'utilisateur référencé n'existe pas",
        details: { id_user: parseInt(id_user) },
      });
    }

    // Handle Sequelize unique constraint errors (duplicate key)
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        error: "Entrée en double",
        message:
          "Un enregistrement avec cet ID existe déjà. Il s'agit probablement d'un problème de séquence de base de données. Veuillez contacter l'administrateur.",
        details: {
          constraint: error.parent?.constraint,
          fields: error.fields,
        },
      });
    }

    return res.status(500).json({
      error: "Erreur interne du serveur",
      message: error.message || "Une erreur inattendue s'est produite",
    });
  }
};

/**
 * Update an existing time recording
 * Only managers and admins can update recordings
 */
export const updateTimeRecording = async (req, res) => {
  try {
    const recording = await TimeRecording.findByPk(req.params.id);

    if (!recording) {
      return res.status(404).json({ message: "Enregistrement de temps introuvable" });
    }

    // Authorization check for managers
    if (req.user.role === "manager") {
      const teamMember = await TeamMember.findOne({
        include: [
          {
            model: Team,
            as: "team",
            where: { id_manager: req.user.id },
          },
        ],
        where: { id_user: recording.id_user },
      });

      if (!teamMember && recording.id_user !== req.user.id) {
        return res.status(403).json({
          message:
            "Interdit - Impossible de modifier les enregistrements d'utilisateurs hors de votre équipe",
        });
      }
    }

    const { timestamp, type, id_user } = req.body;

    // If updating type, check for consecutive duplicates
    if (type && type !== recording.type) {
      if (!["Arrival", "Departure"].includes(type)) {
        return res.status(400).json({
          message: 'Le type doit être "Arrival" ou "Departure"',
        });
      }

      const targetUserId = id_user ? parseInt(id_user) : recording.id_user;
      const targetTimestamp = timestamp ? new Date(timestamp) : recording.timestamp;

      // Get recordings before and after the target timestamp, excluding the current recording
      const [previousRecording, nextRecording] = await Promise.all([
        TimeRecording.findOne({
          where: {
            id_user: targetUserId,
            timestamp: { [db.Sequelize.Op.lt]: targetTimestamp },
            id: { [db.Sequelize.Op.ne]: recording.id },
          },
          order: [["timestamp", "DESC"]],
        }),
        TimeRecording.findOne({
          where: {
            id_user: targetUserId,
            timestamp: { [db.Sequelize.Op.gt]: targetTimestamp },
            id: { [db.Sequelize.Op.ne]: recording.id },
          },
          order: [["timestamp", "ASC"]],
        }),
      ]);

      if (
        (previousRecording && previousRecording.type === type) ||
        (nextRecording && nextRecording.type === type)
      ) {
        return res.status(400).json({
          message: `Cannot update to ${type} - would create consecutive ${type} recordings`,
        });
      }
    }

    // Update the recording
    const updateData = {};
    if (timestamp) updateData.timestamp = new Date(timestamp);
    if (type) updateData.type = type;
    if (id_user) updateData.id_user = parseInt(id_user);

    await recording.update(updateData);

    return res.status(200).json(recording);
  } catch (error) {
    console.error("Error updating time recording:", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur" });
  }
};

/**
 * Delete a time recording
 * Only managers and admins can delete recordings
 */
export const deleteTimeRecording = async (req, res) => {
  try {
    const recording = await TimeRecording.findByPk(req.params.id);

    if (!recording) {
      return res.status(404).json({ message: "Enregistrement de temps introuvable" });
    }

    // Authorization check for managers
    if (req.user.role === "manager") {
      const teamMember = await TeamMember.findOne({
        include: [
          {
            model: Team,
            as: "team",
            where: { id_manager: req.user.id },
          },
        ],
        where: { id_user: recording.id_user },
      });

      if (!teamMember && recording.id_user !== req.user.id) {
        return res.status(403).json({
          message:
            "Interdit - Impossible de supprimer les enregistrements d'utilisateurs hors de votre équipe",
        });
      }
    }

    await recording.destroy();

    return res.status(200).json({ message: "Enregistrement de temps supprimé avec succès" });
  } catch (error) {
    console.error("Error deleting time recording:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

/**
 * Get time recording statistics for employees
 * Calculates work hours, attendance rate, and other metrics
 */
export const getTimeRecordingStats = async (req, res) => {
  try {
    const { id_user, start_date, end_date } = req.query;
    let targetUserId = id_user ? parseInt(id_user) : null;

    // Authorization: employees can only see their own stats
    if (req.user.role === "employee") {
      targetUserId = req.user.id;
    } else if (req.user.role === "manager" && targetUserId) {
      // Check if user is in manager's team
      const teamMember = await TeamMember.findOne({
        include: [
          {
            model: Team,
            as: "team",
            where: { id_manager: req.user.id },
          },
        ],
        where: { id_user: targetUserId },
      });

      if (!teamMember && targetUserId !== req.user.id) {
        return res.status(403).json({
          message:
            "Interdit - Impossible d'accéder aux statistiques d'utilisateurs hors de votre équipe",
        });
      }
    }

    // If no specific user requested, default to current user for non-admins
    if (!targetUserId && req.user.role !== "admin") {
      targetUserId = req.user.id;
    }

    // Build where clause
    const whereClause = {};
    if (targetUserId) {
      whereClause.id_user = targetUserId;
    } else if (req.user.role === "manager") {
      // Get all team members for this manager
      const teamMembers = await TeamMember.findAll({
        include: [
          {
            model: Team,
            as: "team",
            where: { id_manager: req.user.id },
          },
        ],
      });
      const memberIds = teamMembers.map((tm) => tm.id_user);
      memberIds.push(req.user.id);
      whereClause.id_user = memberIds;
    }

    // Apply date filters
    if (start_date || end_date) {
      whereClause.timestamp = {};
      if (start_date) {
        whereClause.timestamp[db.Sequelize.Op.gte] = new Date(start_date);
      }
      if (end_date) {
        whereClause.timestamp[db.Sequelize.Op.lte] = new Date(end_date);
      }
    }

    // Fetch all recordings
    const recordings = await TimeRecording.findAll({
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

    // Group by user and calculate stats
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
          workSessions: [],
        };
      }

      if (record.type === "Arrival") {
        userStats[userId].arrivals.push(record.timestamp);
      } else {
        userStats[userId].departures.push(record.timestamp);
      }
    });

    // Calculate work hours for each user
    Object.keys(userStats).forEach((userId) => {
      const stats = userStats[userId];
      const { arrivals, departures } = stats;

      // Match arrivals with departures
      const workDays = new Set();
      for (let i = 0; i < Math.min(arrivals.length, departures.length); i++) {
        const arrival = new Date(arrivals[i]);
        const departure = new Date(departures[i]);

        if (departure > arrival) {
          const hoursWorked = (departure - arrival) / (1000 * 60 * 60);
          stats.totalHours += hoursWorked;

          // Track unique work days
          const dayKey = arrival.toISOString().split("T")[0];
          workDays.add(dayKey);

          stats.workSessions.push({
            date: dayKey,
            arrival: arrival.toISOString(),
            departure: departure.toISOString(),
            hours: hoursWorked,
          });
        }
      }

      stats.totalDays = workDays.size;
      stats.averageHoursPerDay = stats.totalDays > 0 ? stats.totalHours / stats.totalDays : 0;

      // Clean up temporary arrays
      delete stats.arrivals;
      delete stats.departures;
    });

    // Convert to array
    const statsArray = Object.values(userStats);

    return res.status(200).json({
      statistics: statsArray,
      period: {
        start: start_date || null,
        end: end_date || null,
      },
    });
  } catch (error) {
    console.error("Error fetching time recording statistics:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

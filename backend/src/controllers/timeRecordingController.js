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
            .json({ message: "Forbidden - Cannot access other users' time recordings" });
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
    return res.status(500).json({ message: "Internal server error" });
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
      return res.status(404).json({ message: "Time recording not found" });
    }

    // Authorization check
    if (req.user.role === "employee" && recording.id_user !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden - Cannot access other users' time recordings" });
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
          .json({ message: "Forbidden - Cannot access other users' time recordings" });
      }
    }

    return res.status(200).json(recording);
  } catch (error) {
    console.error("Error fetching time recording:", error);
    return res.status(500).json({ message: "Internal server error" });
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
      message: "timestamp, type, and id_user are required",
    });
  }

  if (!["Arrival", "Departure"].includes(type)) {
    return res.status(400).json({
      message: 'type must be either "Arrival" or "Departure"',
    });
  }

  try {
    // Authorization: Employees can only create their own recordings
    if (req.user.role === "employee" && parseInt(id_user) !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden - Employees can only create their own time recordings" });
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
          message: "Forbidden - Cannot create time recordings for users outside your team",
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
        error: "Not found",
        message: `User with ID ${id_user} not found`,
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
        error: "Validation error",
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
        error: "Foreign key constraint error",
        message: "The referenced user does not exist",
        details: { id_user: parseInt(id_user) },
      });
    }

    // Handle Sequelize unique constraint errors (duplicate key)
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        error: "Duplicate entry",
        message:
          "A time recording with this ID already exists. This is likely a database sequence issue. Please contact the administrator.",
        details: {
          constraint: error.parent?.constraint,
          fields: error.fields,
        },
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: error.message || "An unexpected error occurred",
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
      return res.status(404).json({ message: "Time recording not found" });
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
          message: "Forbidden - Cannot update time recordings for users outside your team",
        });
      }
    }

    const { timestamp, type, id_user } = req.body;

    // If updating type, check for consecutive duplicates
    if (type && type !== recording.type) {
      if (!["Arrival", "Departure"].includes(type)) {
        return res.status(400).json({
          message: 'type must be either "Arrival" or "Departure"',
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
    return res.status(500).json({ message: error.message || "Internal server error" });
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
      return res.status(404).json({ message: "Time recording not found" });
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
          message: "Forbidden - Cannot delete time recordings for users outside your team",
        });
      }
    }

    await recording.destroy();

    return res.status(200).json({ message: "Time recording deleted successfully" });
  } catch (error) {
    console.error("Error deleting time recording:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

import db from "../../models/index.cjs";

const { Team, Timetable } = db;

// Middleware pour vérifier que l'utilisateur peut modifier le timetable
export const canModifyTimetable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Les admins peuvent tout modifier
    if (userRole === "admin") {
      return next();
    }

    // Trouver le timetable
    const timetable = await Timetable.findByPk(id);
    if (!timetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    // Vérifier si l'utilisateur est manager d'une équipe utilisant ce timetable
    const team = await Team.findOne({
      where: {
        id_timetable: id,
        id_manager: userId,
      },
    });

    if (!team) {
      return res.status(403).json({
        message:
          "Forbidden: Only the manager of the team associated with this timetable can modify it",
      });
    }

    return next();
  } catch (error) {
    console.error("Error checking timetable permissions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware pour vérifier que seuls les managers et admins peuvent créer des timetables
export const canCreateTimetable = (req, res, next) => {
  const userRole = req.user.role;

  if (userRole !== "manager" && userRole !== "admin") {
    return res.status(403).json({
      message: "Forbidden: Only managers and admins can create timetables",
    });
  }

  return next();
};

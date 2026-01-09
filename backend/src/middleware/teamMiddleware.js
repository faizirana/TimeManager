import db from "../../models/index.cjs";

const { Team, TeamMember } = db;

/**
 * Middleware pour vérifier si l'utilisateur peut gérer une équipe
 * Autorisé: Admin OU Manager de l'équipe (Team.id_manager === req.user.id)
 */
export const canManageTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Admin a tous les droits
    if (req.user.role === "admin") {
      return next();
    }

    // Vérifier si l'utilisateur est le manager de cette équipe
    const team = await Team.findByPk(id);

    if (!team) {
      return res.status(404).json({ message: "Équipe non trouvée" });
    }

    if (team.id_manager === req.user.id) {
      return next();
    }

    return res.status(403).json({
      message: "Accès refusé: vous devez être admin ou manager de cette équipe",
    });
  } catch (error) {
    console.error("Erreur dans canManageTeam:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur peut gérer les membres d'une équipe
 * Autorisé: Admin OU Manager de l'équipe
 */
export const canManageTeamMembers = async (req, res, next) => {
  try {
    const { id, teamId } = req.params;
    const actualTeamId = teamId || id;

    // Admin a tous les droits
    if (req.user.role === "admin") {
      return next();
    }

    // Vérifier si l'utilisateur est le manager de cette équipe
    const team = await Team.findByPk(actualTeamId);

    if (!team) {
      return res.status(404).json({ message: "Équipe non trouvée" });
    }

    if (team.id_manager === req.user.id) {
      return next();
    }

    return res.status(403).json({
      message:
        "Accès refusé: vous devez être admin ou manager de cette équipe pour gérer ses membres",
    });
  } catch (error) {
    console.error("Erreur dans canManageTeamMembers:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur peut voir une équipe
 * Autorisé: Admin OU Manager de l'équipe OU Membre de l'équipe
 */
export const canViewTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Admin a tous les droits
    if (req.user.role === "admin") {
      return next();
    }

    // Vérifier si l'équipe existe
    const team = await Team.findByPk(id);

    if (!team) {
      return res.status(404).json({ message: "Équipe non trouvée" });
    }

    // Vérifier si l'utilisateur est le manager de cette équipe
    if (team.id_manager === req.user.id) {
      return next();
    }

    // Vérifier si l'utilisateur est membre de cette équipe
    const membership = await TeamMember.findOne({
      where: {
        id_team: id,
        id_user: req.user.id,
      },
    });

    if (membership) {
      return next();
    }

    return res.status(403).json({
      message: "Accès refusé: vous devez être admin, manager ou membre de cette équipe",
    });
  } catch (error) {
    console.error("Erreur dans canViewTeam:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur est le manager d'une équipe
 * Vérifie uniquement Team.id_manager (pas de vérification admin)
 */
export const isTeamManager = async (req, res, next) => {
  try {
    const { id, teamId } = req.params;
    const actualTeamId = teamId || id;

    const team = await Team.findByPk(actualTeamId);

    if (!team) {
      return res.status(404).json({ message: "Équipe non trouvée" });
    }

    if (team.id_manager !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Accès refusé: vous n'êtes pas le manager de cette équipe" });
    }

    return next();
  } catch (error) {
    console.error("Erreur dans isTeamManager:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

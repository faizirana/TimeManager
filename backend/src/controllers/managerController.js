import db from "../../models/index.cjs";

const { User } = db;

/**
 * Get all managers
 * Restricted to Admins only (checked in routes middleware)
 */
export const getAllManagers = async (req, res) => {
  try {
    // On filtre pour ne récupérer que les utilisateurs avec le rôle 'manager'
    const managers = await User.findAll({
      where: { role: "manager" },
      attributes: ["id", "name", "surname", "mobileNumber", "email", "role"],
    });

    res.status(200).json(managers);
  } catch (error) {
    console.error("Error fetching managers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get a specific manager's team (employees managed by them)
 * Security: Admin can see any team. Managers can only see their own team.
 */
export const getManagerTeam = async (req, res) => {
  try {
    const managerId = parseInt(req.params.id, 10);
    const requestingUser = req.user; // Injecté par le middleware authenticate

    // 1. Vérification de sécurité (Authorization Logic)
    // Si l'utilisateur n'est PAS admin ET que son ID ne correspond pas à l'ID demandé
    if (requestingUser.role !== "admin" && requestingUser.id !== managerId) {
      return res.status(403).json({
        message: "Forbidden: You can only view your own team.",
      });
    }

    // 2. Vérifier si le manager existe (optionnel, mais propre)
    const manager = await User.findByPk(managerId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // 3. Vérifier que c'est bien un manager (optionnel, selon votre logique métier)
    if (manager.role !== "manager" && manager.role !== "admin") {
      // Note : Parfois des admins peuvent aussi avoir des subordonnés
      // Si ce n'est pas le cas, vous pouvez restreindre ici.
    }

    // 4. Récupérer les employés liés à ce manager
    const teamMembers = await User.findAll({
      where: { id_manager: managerId },
      attributes: ["id", "name", "surname", "mobileNumber", "email", "role"],
    });

    return res.status(200).json(teamMembers);
  } catch (error) {
    console.error("Error fetching manager team:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

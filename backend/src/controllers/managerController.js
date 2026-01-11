import db from "../../models/index.cjs";

const { User } = db;

/**
 * Get all managers
 * Restricted to Admins only (checked in routes middleware)
 */
export const getAllManagers = async (req, res) => {
  try {
    // We filter to retrieve only users with the 'manager' role
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
    const requestingUser = req.user; // Injected by the authenticate middleware

    // 1. Security check (Authorization Logic)
    // If the user is NOT admin AND their ID does not match the requested ID
    if (requestingUser.role !== "admin" && requestingUser.id !== managerId) {
      return res.status(403).json({
        message: "Forbidden: You can only view your own team.",
      });
    }

    // 2. Check if the manager exists (optional, but best practice)
    const manager = await User.findByPk(managerId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // 3. Verify that it is indeed a manager (optional, depending on your business logic)
    if (manager.role !== "manager" && manager.role !== "admin") {
      // Note: Sometimes admins can also have subordinates
      // If that is not the case, you can restrict it here.
    }

    // 4. Retrieve employees linked to this manager
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

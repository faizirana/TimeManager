import db from "../../models/index.cjs";
import bcrypt from "bcryptjs";

const { User, sequelize } = db;
const SALT_ROUNDS = 12;

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "surname", "mobileNumber", "email", "role", "id_manager"],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "surname", "mobileNumber", "email", "role", "id_manager"],
    });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

export const createUser = async (req, res) => {
  const { name, surname, mobileNumber, email, password, role, id_manager } = req.body;
  if (!name || !surname || !mobileNumber || !email || !password || !role) {
    return res.status(400).json({
      message: "Le nom, prénom, numéro de mobile, email, mot de passe et rôle sont requis",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    const hashedPassword = password; //await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await User.create(
      {
        name,
        surname,
        mobileNumber,
        email,
        password: hashedPassword,
        role,
        id_manager: id_manager || null,
      },
      { transaction },
    );

    await transaction.commit();

    const newUserObj = newUser.toJSON();
    delete newUserObj.password;

    return res.status(201).json(newUserObj);
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating user:", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur" });
  }
};

// PUT /users/:id
export const updateUser = async (req, res) => {
  const { name, surname, mobileNumber, email, password, role, id_manager } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const user = await User.findByPk(req.params.id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // Check authorization: user can update themselves, or admin can update anyone
    const isOwnProfile = req.user.id === user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({ message: "Non autorisé à mettre à jour cet utilisateur" });
    }

    // Non-admins can only update their own basic info and password, not role or manager
    const updatedData = {
      name: name ?? user.name,
      surname: surname ?? user.surname,
      mobileNumber: mobileNumber === "" ? null : (mobileNumber ?? user.mobileNumber),
      email: email ?? user.email,
      role: isAdmin ? (role ?? user.role) : user.role,
      id_manager: isAdmin ? (id_manager ?? user.id_manager) : user.id_manager,
    };

    if (password) {
      updatedData.password = await bcrypt.hash(password, SALT_ROUNDS);
      // Invalider le refresh token lors du changement de mot de passe
      updatedData.refreshTokenHash = null;
      updatedData.refreshTokenFamily = null;
    }

    await user.update(updatedData, { transaction });

    await transaction.commit();

    const updatedUserObj = user.toJSON();
    delete updatedUserObj.password;

    return res.status(200).json(updatedUserObj);
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating user:", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    await user.destroy();
    return res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

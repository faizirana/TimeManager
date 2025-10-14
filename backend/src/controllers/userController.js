import db from "../../models/index.cjs";
const { User } = db;

// GET /users
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "surname", "mobileNumber", "email", "role", "id_manager"],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "surname", "mobileNumber", "email", "role", "id_manager"],
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /users
export const createUser = async (req, res) => {
  const { name, surname, mobileNumber, email, password, role, id_manager } = req.body;
  if (!name || !surname || !mobileNumber || !email || !password || !role) {
    return res.status(400).json({
      message: "name, surname, mobileNumber, email, password and role are required",
    });
  }

  try {
    const newUser = await User.create({
      name,
      surname,
      mobileNumber,
      email,
      password,
      role,
      id_manager: id_manager || null,
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// PUT /users/:id
export const updateUser = async (req, res) => {
  const { name, surname, mobileNumber, email, password, role, id_manager } = req.body;

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({
      name: name ?? user.name,
      surname: surname ?? user.surname,
      mobileNumber: mobileNumber ?? user.mobileNumber,
      email: email ?? user.email,
      password: password ?? user.password,
      role: role ?? user.role,
      id_manager: id_manager ?? user.id_manager,
    });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// DELETE /users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

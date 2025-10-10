import users from "../data/users.json" with { type: "json" };

export const getUsers = (req, res) => {
  res.status(200).json(users);
};

export const getUserById = (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user);
};

export const createUser = (req, res) => {
  const { firstName, lastName, email } = req.body;
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ message: "firstName, lastName, and email are required" });
  }
  const newId = users.length ? (parseInt(users[users.length - 1].id) + 1).toString() : "1";
  const newUser = {
    id: newId,
    firstName,
    lastName,
    email
  };
  users.push(newUser);
  res.status(201).json(newUser);
};

export const updateUser = (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const { firstName, lastName, email } = req.body;
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;
  res.status(200).json(user);
};

export const deleteUser = (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }
  const deletedUser = users.splice(index, 1)[0];
  res.status(200).json(deletedUser);
};

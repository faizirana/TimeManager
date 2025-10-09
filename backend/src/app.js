import express from "express";
import morgan from "morgan";

import usersRoutes from "./routes/userRoutes.js";

const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.use("/users", usersRoutes);

app.get("/", (req, res) => {
  res.send({ message: "Backend is running 🚀" });
});

export default app;
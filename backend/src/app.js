import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import usersRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";

import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Time manager API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "http://localhost/api",
        description: "Development server (via Nginx)",
      },
      {
        url: "http://localhost:3001",
        description: "Direct backend server (use it if CORS is enabled in backend)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token in the format: Bearer <token>",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/users", usersRoutes);
app.use("/auth", authRoutes);
app.use("/teams", teamRoutes);
app.use("/timetables", timetableRoutes);

app.get("/", (req, res) => {
  res.send({ message: "Backend is running 🚀" });
});

export default app;

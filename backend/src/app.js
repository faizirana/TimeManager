import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import usersRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import timeRecordingRoutes from "./routes/timeRecordingRoutes.js";

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
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 2,
            },
            name: {
              type: "string",
              example: "John",
            },
            surname: {
              type: "string",
              example: "Doe",
            },
            mobileNumber: {
              type: "string",
              example: "0123456789",
            },
            email: {
              type: "string",
              format: "email",
              example: "john.employee@example.com",
            },
            role: {
              type: "string",
              enum: ["admin", "manager", "employee"],
              example: "employee",
            },
            id_manager: {
              type: "integer",
              nullable: true,
              example: 1,
              description: "ID of the manager (null for top-level managers)",
            },
          },
        },
        Team: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "Team Alpha",
            },
            id_manager: {
              type: "integer",
              example: 1,
              description: "Manager user ID (must have manager role)",
            },
            id_timetable: {
              type: "integer",
              nullable: true,
              example: 1,
              description: "Associated timetable ID",
            },
          },
        },
        Timetable: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            Shift_start: {
              type: "string",
              pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$",
              example: "09:00",
              description: "Shift start time in HH:MM format",
            },
            Shift_end: {
              type: "string",
              pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$",
              example: "17:00",
              description: "Shift end time in HH:MM format",
            },
          },
        },
        TimeRecording: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2026-01-07T09:00:00.000Z",
            },
            type: {
              type: "string",
              enum: ["Arrival", "Departure"],
              example: "Arrival",
            },
            id_user: {
              type: "integer",
              example: 2,
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "alice.manager@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "Manager123!",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              example:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6Im1hbmFnZXIiLCJpYXQiOjE3MzY3MDg0MDAsImV4cCI6MTczNjcwOTMwMH0.example_signature",
              description: "JWT access token (expires in 15 minutes)",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Invalid credentials",
            },
            message: {
              type: "string",
              example: "The provided email or password is incorrect",
            },
            details: {
              type: "object",
              additionalProperties: true,
              description: "Additional error details (validation errors, field names, etc.)",
            },
          },
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
app.use("/timerecordings", timeRecordingRoutes);

app.get("/", (req, res) => {
  res.send({ message: "Backend is running 🚀" });
});

export default app;

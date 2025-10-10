import express from "express";
import morgan from "morgan";

import usersRoutes from "./routes/userRoutes.js";

import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";


const app = express();
app.use(express.json());
app.use(morgan("dev"));

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    myapi: '3.0.0',
    info: {
      title: 'Time manager API',
      version: '1.0.0',
      description: 'API documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/users", usersRoutes);

app.get("/", (req, res) => {
  res.send({ message: "Backend is running 🚀" });
});

export default app;
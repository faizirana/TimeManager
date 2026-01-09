// Charger les variables d'environnement dès que possible
import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

/**
 * Initialize database and create admin user in production
 */
async function initializeDatabase() {
  if (process.env.NODE_ENV === "production") {
    try {
      const { default: createAdmin } = await import("./scripts/createAdmin.js");
      await createAdmin();
    } catch (error) {
      console.error("Failed to initialize admin user:", error.message);
      process.exit(1);
    }
  }
}

// Start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });

const path = require("path");
// Charger le .env spécifique au backend (ce fichier est exécuté par Jest avant les tests)
require("dotenv").config({ path: path.join(__dirname, ".env") });

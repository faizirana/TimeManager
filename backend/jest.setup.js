const path = require("path");
// Charger le .env spécifique au backend (ce fichier est exécuté par Jest avant les tests)
// L'option silent: true permet au CI de fonctionner sans fichier .env (variables d'environnement fournies directement)
require("dotenv").config({ path: path.join(__dirname, ".env"), silent: true });

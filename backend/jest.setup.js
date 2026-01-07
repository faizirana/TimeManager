const path = require("path");
const dotenv = require("dotenv");

// Charger le .env spécifique au backend pour le développement local
// L'option silent: true empêche les erreurs si le fichier n'existe pas (CI/CD)
dotenv.config({ path: path.join(__dirname, ".env"), silent: true });

// En CI, GitHub Actions fournit les secrets via process.env
// dotenv ne remplace PAS les variables déjà définies dans process.env
// Donc si ACCESS_TOKEN_SECRET et REFRESH_TOKEN_SECRET sont déjà définis, ils restent intacts
// Cette approche fonctionne pour les deux environnements :
// - Local : charge depuis .env
// - CI : utilise les variables déjà dans process.env

// Pour les tests, utiliser des secrets par défaut si non définis
// Cela permet de lancer les tests localement sans configuration
if (!process.env.ACCESS_TOKEN_SECRET) {
  process.env.ACCESS_TOKEN_SECRET = "test_access_token_secret_for_jest_testing_min_32_chars";
}

if (!process.env.REFRESH_TOKEN_SECRET) {
  process.env.REFRESH_TOKEN_SECRET = "test_refresh_token_secret_for_jest_testing_min_32_chars";
}

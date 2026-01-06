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

// Diagnostic : Vérifier que les secrets sont présents (surtout pour CI)
if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  console.error("❌ ERREUR CRITIQUE: Les secrets JWT ne sont pas définis!");
  console.error("ACCESS_TOKEN_SECRET défini:", !!process.env.ACCESS_TOKEN_SECRET);
  console.error("REFRESH_TOKEN_SECRET défini:", !!process.env.REFRESH_TOKEN_SECRET);
  console.error("NODE_ENV:", process.env.NODE_ENV);
  console.error("\nVérifiez que les secrets GitHub sont correctement configurés dans:");
  console.error("Repository → Settings → Secrets and variables → Actions");
  throw new Error(
    "Les secrets JWT (ACCESS_TOKEN_SECRET et REFRESH_TOKEN_SECRET) doivent être définis",
  );
}

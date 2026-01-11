/**
 * Team Time Recordings Route
 *
 * GET /time-recordings/team/:teamId
 * Récupère tous les time recordings du jour pour les membres d'une équipe
 */

const timeRecordingController = require("../../controllers/timeRecordingController");
const { authenticate } = require("../../middleware/authMiddleware");

module.exports = (app) => {
  /**
   * GET /time-recordings/team/:teamId
   * Récupère les time recordings du jour pour tous les membres d'une équipe
   *
   * @param {number} teamId - ID de l'équipe
   * @param {string} date - Date au format YYYY-MM-DD (optional, défaut: aujourd'hui)
   * @returns {Array} Liste des time recordings avec user, start_time, end_time, location
   */
  app.get(
    "/time-recordings/team/:teamId",
    authenticate,
    timeRecordingController.getTeamTimeRecordings,
  );
};

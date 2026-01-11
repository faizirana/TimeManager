/**
 * Centralized error message definitions for the application
 * Provides consistent French error messages across all components
 */

/**
 * Validation error messages
 */
export const VALIDATION_ERRORS = {
  REQUIRED: (field: string) => `Le champ ${field} est requis.`,
  ALL_FIELDS_REQUIRED: "Tous les champs sont requis.",
  TEAM_NAME_REQUIRED: "Le nom de l'équipe est requis",
  TEAM_REQUIRED: "Équipe requis",
  TIMETABLE_REQUIRED: "Vous devez sélectionner un horaire",
  USER_NOT_CONNECTED: "Utilisateur non connecté",
  INVALID_EMAIL: "L'email n'est pas valide.",
  WEAK_PASSWORD:
    "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.",
  INVALID_MOBILE: "Le numéro de mobile doit comporter 10 chiffres et commencer par 0.",
  INVALID_COUNTRY_CODE: "L'indicatif doit être au format +00 à +999.",
  INVALID_ROLE: "Le rôle doit être admin, manager ou employé.",
  EMPTY_SELECTION: "Veuillez sélectionner au moins un élément.",
  INVALID_TIME_FORMAT: "Le format de l'heure est invalide (HH:MM attendu).",
  TIME_RANGE_INVALID: "L'heure de fin doit être après l'heure de début.",
} as const;

/**
 * API error messages
 */
export const API_ERRORS = {
  FETCH_FAILED: (resource: string) => `Échec du chargement des ${resource}. Veuillez réessayer.`,
  CREATE_FAILED: (resource: string) => `Échec de la création ${resource}. Veuillez réessayer.`,
  CREATE_TEAM_FAILED: "Erreur lors de la création de l'équipe",
  CREATE_USER_FAILED: "Erreur lors de la création de l'utilisateur",
  CREATE_TIMETABLE_FAILED: "Erreur lors de la création de l'horaire.",
  UPDATE_FAILED: (resource: string) => `Échec de la mise à jour ${resource}. Veuillez réessayer.`,
  UPDATE_TEAM_FAILED: "Erreur lors de la modification de l'équipe",
  UPDATE_USER_FAILED: "Erreur lors de la modification de l'utilisateur",
  DELETE_FAILED: (resource: string) => `Échec de la suppression ${resource}. Veuillez réessayer.`,
  NETWORK_ERROR: "Erreur réseau. Vérifiez votre connexion et réessayez.",
  UNAUTHORIZED: "Vous n'êtes pas autorisé à effectuer cette action.",
  FORBIDDEN: "Accès refusé.",
  NOT_FOUND: (resource: string) => `${resource} introuvable.`,
  GENERIC_ERROR: "Une erreur s'est produite. Veuillez réessayer.",
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  CREATED: (resource: string) => `${resource} créé avec succès.`,
  UPDATED: (resource: string) => `${resource} mis à jour avec succès.`,
  DELETED: (resource: string) => `${resource} supprimé avec succès.`,
  SAVED: "Modifications enregistrées avec succès.",
} as const;

/**
 * Resource names for consistent messaging
 */
export const RESOURCES = {
  USER: "l'utilisateur",
  USERS: "utilisateurs",
  TEAM: "l'équipe",
  TEAMS: "équipes",
  TIMETABLE: "l'horaire",
  TIMETABLES: "horaires",
  MEMBER: "le membre",
  MEMBERS: "membres",
} as const;

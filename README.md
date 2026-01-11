# 🕒 Time Manager

**Time Manager** est une application web de badgeuse permettant aux utilisateurs d’enregistrer, suivre et gérer leurs heures de travail en toute simplicité.  

Le projet est construit sur une architecture moderne et scalable comprenant un **back-end en Express.js**, un **reverse-proxy sous NGINX**, une **base de données PostgreSQL**, un **front-end en Next.js**, le tout **conteneurisé avec Docker** et documenté via **Swagger**.

---

## 📚 Table des matières

- [🕒 Time Manager](#-bootstrap-time-manager)
  - [📚 Table des matières](#-table-des-matières)
  - [📄 Introduction](#-introduction)
  - [🏗️ Architecture globale](#️-architecture-globale)
    - [🔄 Schéma général](#-schéma-général)
  - [⚙️ Choix techniques](#️-choix-techniques)
  - [| **Swagger** | Documentation interactive, communication facilitée |](#-swagger--documentation-interactive-communication-facilitée-)
  - [📁 Structure du projet](#-structure-du-projet)
  - [📡 Back-end – Express.js](#-back-end--expressjs)
    - [🔌 Endpoints principaux](#-endpoints-principaux)
    - [🛡️ Middleware recommandés](#️-middleware-recommandés)
  - [🗃️ Base de données – PostgreSQL](#️-base-de-données--postgresql)
    - [🧱 Modélisation / 🔗 Relations](#-modélisation---relations)
  - [🖥️ Front-end – Next.js](#️-front-end--nextjs)
    - [📑 Pages principales](#-pages-principales)
    - [🧠 Gestion d’état](#-gestion-détat)
    - [🔐 Authentification](#-authentification)
  - [📦 Dockerisation](#-dockerisation)
  - [🚀 Commandes utiles](#-commandes-utiles)
  - [📜 Documentation API – Swagger](#-documentation-api--swagger)
  - [🧪 Tests et Qualité](#-tests-et-qualité)
  - [🚀 Déploiement](#-déploiement)
  - [📊 Conclusion \& Perspectives](#-conclusion--perspectives)
    - [🔮 Améliorations possibles :](#-améliorations-possibles-)
  - [📎 Annexes](#-annexes)

---

## 📄 Introduction

**Time Manager** est une solution de gestion du temps destinée aux individus et aux équipes.  
Elle permet de :
- Enregistrer le temps passé en entreprise
- Visualiser des statistiques et rapports
- Gérer les utilisateurs et leur authentification

ℹ️ Un guide utilisateur détaillé est fourni dans le dossier `Documentation` sous le nom **Guide_Utilisateur.md**.

---

## 🏗️ Architecture globale

### 🔄 Schéma général

![Architecture](./Documentation/Resources/Architecture.png)

- **Frontend (Next.js)** : Interface utilisateur moderne et réactive  
- **Backend (Express.js)** : API RESTful sécurisée et extensible  
- **Base de données (PostgreSQL)** : Stockage fiable des données
- **NGINX** : Reverse-proxy pour la gestion des requêtes et la sécurité  
- **Swagger** : Documentation interactive de l’API  
- **Docker** : Conteneurisation pour un déploiement facile et portable

---

## ⚙️ Choix techniques

| Technologie    | Raison du choix |
|---------------|------------------|
| **Express.js** | Rapidité de développement, flexibilité et écosystème riche |
| **PostgreSQL** | Fiabilité, requêtes complexes, relations robustes |
| **Next.js** | Rendu côté serveur (SSR), SEO optimisé, architecture moderne |
| **Docker** | Environnements reproductibles, déploiement simplifié |
| **Swagger** | Documentation interactive, communication facilitée |
---

## 📁 Structure du projet

```
bootstrap-time-manager/
│
├── backend/
│ ├── src/
│ │ ├── routes/
│ │ ├── controllers/
│ │ ├── models/
│ │ ├── middleware/
│ │ └── index.js
│ ├── swagger/
│ ├── package.json
│ └── Dockerfile
│
├── frontend/
│ ├── pages/
│ ├── components/
│ ├── services/
│ ├── package.json
│ └── Dockerfile
│
├── database/
│ ├── init.sql
│ └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## 📡 Back-end – Express.js

Le backend fournit une API RESTful pour toutes les opérations.

### 🔌 Endpoints

#### Authentification
- `POST /auth/login` : Connexion, retourne un access token et un refresh token (cookie)
- `POST /auth/logout` : Déconnexion (supprime le refresh token)
- `POST /auth/refresh` : Rafraîchit le token d'accès via le refresh token (cookie)
- `GET /auth/me` : Récupère l'utilisateur actuellement authentifié

#### Santé
- `GET /health` : Vérifie la santé de l’API

#### Utilisateurs
- `GET /users` : Liste tous les utilisateurs
- `GET /users/{id}` : Détail d’un utilisateur
- `POST /users` : Crée un utilisateur (admin uniquement)
- `PUT /users/{id}` : Modifie un utilisateur (self/admin/manager)
- `DELETE /users/{id}` : Supprime un utilisateur (admin uniquement)

#### Managers
- `GET /managers` : Liste tous les managers (admin uniquement)
- `GET /managers/{id}/team` : Liste l’équipe d’un manager (admin ou manager concerné)

#### Équipes
- `GET /teams` : Liste toutes les équipes (filtrage possible par utilisateur)
- `GET /teams/{id}` : Détail d’une équipe
- `POST /teams` : Crée une équipe (admin/manager)
- `PUT /teams/{id}` : Modifie une équipe (manager de l’équipe/admin)
- `DELETE /teams/{id}` : Supprime une équipe (manager de l’équipe/admin)
- `POST /teams/{id}/users` : Ajoute un membre à une équipe
- `DELETE /teams/{id}/users/{userId}` : Retire un membre d’une équipe
- `GET /teams/{id}/stats` : Statistiques d’équipe

#### Pointages (TimeRecordings)
- `GET /timerecordings` : Liste tous les pointages (filtrage possible)
- `GET /timerecordings/stats` : Statistiques de pointage
- `GET /timerecordings/{id}` : Détail d’un pointage
- `POST /timerecordings` : Crée un pointage
- `PUT /timerecordings/{id}` : Modifie un pointage (manager/admin)
- `DELETE /timerecordings/{id}` : Supprime un pointage (manager/admin)

#### Horaires (Timetables)
- `GET /timetables` : Liste tous les horaires
- `GET /timetables/{id}` : Détail d’un horaire
- `POST /timetables` : Crée un horaire (manager/admin)
- `PUT /timetables/{id}` : Modifie un horaire (manager/admin)
- `DELETE /timetables/{id}` : Supprime un horaire (manager/admin)

### 🛡️ Middleware recommandés
- `cors` – gestion des origines
- `helmet` – sécurité des headers
- `morgan` – logs HTTP

#### Middlewares métiers principaux utilisés dans l’API :
- `authenticate` : vérifie le JWT d’accès (authMiddleware)
- `authorize(...roles)` : contrôle d’accès par rôle (rolesMiddleware)
- `canManageTeam`, `canManageTeamMembers`, `canViewTeam` : gestion fine des droits sur les équipes (teamMiddleware)
- `canCreateTimetable`, `canModifyTimetable` : gestion des droits sur les horaires (timetableMiddleware)

---

## 🗃️ Base de données – PostgreSQL

### 🧱 Modélisation / 🔗 Relations

![Diagramme-DB](./Documentation/Resources/Diagramme_DB.png)

---

## 🖥️ Front-end – Next.js

### 📑 Pages principales
- `/login` : Authentification (route protégée, layout dédié)
- `/dashboard` : Vue d’ensemble après connexion
- `/dashboard/profile` : Profil utilisateur (infos, édition)
- `/dashboard/statistics` : Statistiques et graphiques personnels
- `/dashboard/teams` : Liste des équipes
- `/dashboard/teams/[id]` : Détail d’une équipe avec indicateurs de pointage en temps réel (statut, temps depuis pointage, auto-refresh)
- `/admin/users` : Gestion complète des utilisateurs (CRUD, recherche, tri, pagination, modals)
- `/admin/teams` : Gestion des équipes (CRUD, gestion membres, colonnes personnalisées, modals)
- `/admin/timetables` : Gestion des horaires (CRUD, modals)
- `/admin` : Dashboard admin avec statistiques globales (10+ métriques)
- `/dashboard/clock-in` : Badgeuse/pointage

### 🧩 Composants UI principaux
- Boutons, inputs, sélecteurs, modals, tables, badges de rôle/statut, skeletons, etc. (voir dossier `components/UI`)
- Toasts de notification (`ToastContainer`, `Toast`)
- Switcher dark/light (`DarkModeSwitcher`)
- Pagination avancée (`TablePagination.tsx`)
- Affichage d'erreurs (`ErrorDisplay.tsx`)
- États de chargement (`LoadingState.tsx`)
- Indicateur de statut de pointage (`ClockStatusIndicator.tsx`)
- Statistiques admin (`AdminStats.tsx`)

### 🧠 Gestion d’état & hooks
- Utilisation de contextes React et hooks personnalisés pour l’auth, les équipes, etc.
- 10 hooks personnalisés pour la gestion CRUD (utilisateurs, équipes, horaires), statistiques admin, gestion d'erreurs, modals, recherche, pagination, notifications, pointage équipe en temps réel.

### 🔐 Authentification & sécurité
- Authentification centralisée (login, refresh, logout)
- JWT stocké en cookie sécurisé (httpOnly)
- Redirection automatique si non authentifié
- Protection des routes côté serveur et client
- Gestion des rôles utilisateurs (admin, manager, employé)
- Autorisation stricte sur les endpoints (admin, manager, membre d'équipe)
- Validation renforcée côté client et serveur (email RFC, mot de passe fort, numéro mobile E.164, horaires HH:MM)
- Messages d'erreur centralisés et sécurisés
### 🧠 Validation & utilitaires
- Validation stricte des emails, mots de passe, numéros mobiles, horaires (voir `lib/utils/validation.ts`)
- Helpers pour la normalisation et le parsing des données (voir `lib/utils/formHelpers.ts`)
- Messages d'erreur centralisés et support i18n (`lib/types/errorMessages.ts`)
## 🛠️ Nouveautés de l'interface d'administration

- Interface d'administration complète (utilisateurs, équipes, horaires, statistiques)
- Statut de pointage en temps réel sur les pages équipes
- Pagination, recherche, tri multi-colonnes, modals avancés
- Validation stricte et messages d'erreur centralisés
- 19 nouveaux tests unitaires pour les hooks CRUD
- Sécurité renforcée (autorisation, validation, gestion des erreurs)

### 🎨 Thème
- Support du mode sombre/clair

---

## 📦 Dockerisation

## 🚀 Commandes utiles

```bash
docker compose up --build
docker compose down
```

---

## 📜 Documentation API – Swagger
Swagger est intégré directement dans le backend :
- URL d’accès : http://localhost/api-docs

---

## 🧪 Tests et Qualité
- Tests unitaires : Jest
- Linting : ESLint + Prettier
- CI/CD : GitHub Actions

---

## 🚀 Déploiement
- Build frontend : ```npm run build```
- Lancer en production : ```docker compose -f docker-compose.prod.yml up -d```
- Variables d’environnement : ```.env```

---

## 📊 Conclusion & Perspectives

Time Manager offre une base solide pour toute application de gestion du temps passé en entreprise.

### 🔮 Améliorations possibles :
- Notifications en temps réel
- Intégration d’un calendrier
- Export PDF/CSV
- Application mobile

---

## 📎 Annexes
- 📦 Commandes utiles :

```bash
npm run dev          # Lancer en dev
npm run migrate      # Lancer les migrations
docker compose logs  # Voir les logs
````

- 📚 Ressources recommandées :
* [Express.js Docs](https://expressjs.com/)
* [Next.js Docs](https://nextjs.org/docs)
* [PostgreSQL Docs](https://www.postgresql.org/docs/)
* [Swagger Docs](https://swagger.io/docs/)

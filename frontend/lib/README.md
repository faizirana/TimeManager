# Frontend Library Architecture

## Structure

```
lib/
├── hooks/              # React hooks par domaine métier
├── services/           # Services API par domaine
├── types/              # TypeScript types par domaine
├── utils/              # Fonctions utilitaires génériques
└── constants/          # Valeurs constantes de l'application
```

## Organisation détaillée

### hooks/
Hooks React organisés par domaine métier (alignés avec le backend)

```
hooks/
├── useAuth.ts           # Authentification (login, logout)
├── useTableSort.ts      # Generic - tri de tableaux
├── useTeams.ts          # Gestion des équipes
├── useTimetable.ts      # Gestion des horaires
├── useTimeRecording.ts  # Gestion du pointage
└── useUsers.ts          # Gestion des utilisateurs
```

### services/
Services d'appels API organisés par domaine (miroir des controllers backend)

```
services/
├── auth/
│   ├── authService.ts        # Login, logout, refresh
│   └── jwt.ts                # Vérification JWT
├── teams/
│   ├── teamsService.ts       # CRUD équipes
│   └── teamMembersService.ts # Gestion membres
├── timetable/
│   └── timetableService.ts   # CRUD horaires
├── timeRecording/
│   └── timeRecordingService.ts # Pointage
└── users/
    └── usersService.ts       # CRUD utilisateurs
```

**Correspondance Backend → Frontend:**
- `controllers/teamController.js` → `services/teams/teamsService.ts`
- `controllers/timetableController.js` → `services/timetable/timetableService.ts`
- `controllers/authController.js` → `services/auth/authService.ts`

### types/
Types TypeScript organisés par domaine (miroir des models backend)

```
types/
├── auth.ts           # LoginCredentials, AuthenticationError, LoginResponse
├── teams.ts          # Team, TeamMember, TeamRole
├── timetable.ts      # Timetable, Shift, Schedule
├── timeRecording.ts  # TimeRecord, ClockIn, ClockOut
└── users.ts          # User, Role, UserProfile
```

**Correspondance Backend → Frontend:**
- `models/Team.cjs` → `types/teams.ts`
- `models/User.cjs` → `types/users.ts`
- `models/Timetable.cjs` → `types/timetable.ts`

### utils/
Fonctions utilitaires génériques réutilisables

```
utils/
├── cn.ts            # Merge className (tailwind)
├── sortHelpers.ts   # compareShifts, compareSituations
├── dateHelpers.ts   # formatDate, parseTime, calculateDuration
├── validation.ts    # validateEmail, validatePassword
└── api.ts           # Fetch wrapper, error handler
```

### constants/
Valeurs constantes de l'application

```
constants/
├── routes.ts   # API endpoints
├── roles.ts    # ADMIN, MANAGER, USER
└── status.ts   # Badge variants, status labels
```

## Principes

1. **Séparation par fonction technique** (hooks, services, types, utils)
2. **Organisation par domaine métier** à l'intérieur de chaque fonction
3. **Alignement avec le backend** pour faciliter la maintenance
4. **Réutilisabilité** des utils et hooks génériques
5. **Type-safety** avec TypeScript
6. **Scalabilité** facile d'ajout de nouveaux domaines

## Migration actuelle

### Avant
```
lib/
├── Utils.ts (mauvaise casse)
├── api/ (vide)
└── auth/
    ├── authService.ts
    ├── jwt.ts
    ├── types.ts
    └── useAuth.ts (hook mal placé)
```

### Après (en cours)
```
lib/
├── hooks/
│   ├── useAuth.ts
│   └── useTableSort.ts
├── services/
│   └── auth/
│       ├── authService.ts
│       └── jwt.ts
├── types/
│   └── auth.ts
└── utils/
    ├── cn.ts
    └── sortHelpers.ts
```

## Exemples d'imports

```typescript
// Hooks
import { useAuth } from "@/lib/hooks/useAuth";
import { useTableSort } from "@/lib/hooks/useTableSort";

// Services
import { loginUser, logoutUser } from "@/lib/services/auth/authService";
import { verifyToken } from "@/lib/services/auth/jwt";

// Types
import { LoginCredentials, AuthenticationError } from "@/lib/types/auth";
import { Team, TeamMember } from "@/lib/types/teams";

// Utils
import { cn } from "@/lib/utils/cn";
import { compareShifts } from "@/lib/utils/sortHelpers";

// Constants
import { API_ROUTES } from "@/lib/constants/routes";
import { USER_ROLES } from "@/lib/constants/roles";
```

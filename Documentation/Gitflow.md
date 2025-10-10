# GITFLOW

## Naming Conventions

### Branches

Chaque branche doit être nommée d’après l’ID de la User Story Jira associée.

- Ex : 
```
KAN-8
```

### Commits

Le message de commit doit suivre le format suivant :

```
[<ID Jira>] <TYPE>: <description>
```

- Exemple:

```
[KAN-13] FEAT: Add Dockerfile for backend
```

## Commit Message Structure

### Template

````
[[ID Jira ticket]] <TYPE>[optional scope]: <description>

[optional body]

[optional footer(s)]
````

- Le message doit être rédigé en anglais.

- La description doit être courte, claire et impérative.

- Vous pouvez ajouter des détails techniques ou contextuels dans le corps du message si nécessaire.

### Exemple complet

```
[KAN-13] FEAT Init ExpressJS project

Create the initial structure for the ExpressJS backend.

Configure ESLint and Prettier for code quality.

Add npm scripts for starting the server and running in development mode.
```

### Commit Types

Les commits doivent utiliser l’un des types suivants pour indiquer leur intention :

| Type                | Signification                                                                                           | Sémantique |
| ------------------- | ------------------------------------------------------------------------------------------------------- | ---------- |
| **FIX**             | Correction d’un bug dans le code.                                                                       | [`PATCH`](https://semver.org/#summary)    |
| **FEAT**            | Ajout d’une nouvelle fonctionnalité.                                                                    | [`MINOR`](https://semver.org/#summary)    |
| **BREAKING CHANGE** | Modification majeure ou incompatible. Peut être indiqué dans le pied de page ou avec `!` après le type. | [`MAJOR`](https://semver.org/#summary)    |

Vous pouvez ajouter un scope pour plus de précision contextuelle :

```
[<ID>] FEAT(parser): add support for parsing arrays
```

#### BREAKING CHANGES

- Indiqués dans le footer :

```
BREAKING CHANGE: The authentication API has been refactored.
```

- Ou en ajoutant ! après le type :

```
[KAN-42] FEAT!: remove deprecated authentication endpoints
```

## Annexes

Ressources :
* [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/)
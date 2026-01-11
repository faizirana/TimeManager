## 🐳 Infrastructure & Docker
- [ ] dockerfiles : Les Dockerfiles pour les environnements de développement et de production sont fonctionnels.

- [x] containers : Le frontend, le backend et la base de données sont isolés dans des conteneurs distincts.

- [x] persistency : Les logs sont persistants (ne disparaissent pas si le conteneur crash ou redémarre).

- [x] orchestration : Utilisation de docker-compose pour orchestrer les services.

- [x] clean_deploy : Différenciation claire entre les configurations de chaque environnement.

- [x] env_specificity : Les variables d'environnement sont spécifiques à chaque environnement.

- [x] secrets : Les secrets (clés, mots de passe) ne sont pas en clair sur Git et sont protégés.

## ⚙️ Backend & Base de données
- [x] api_crafting : Une API REST fonctionnelle est livrée.

- [x] framework_back : Un framework backend est utilisé avec une justification professionnelle du choix.

- [x] data_persist : Base de données cohérente, sans redondance, avec plusieurs tables.

- [x] data_viz : L'application permet de visualiser des graphiques pertinents.


## 🔐 Sécurité & Authentification
- [x] roles : Des rôles avec des droits en cascade sont définis.

- [x] auth_jwt : Authentification par JWT obligatoire pour utiliser l'application.

- [x] auth_persist : La session utilisateur persiste jusqu'à son expiration.

- [x] auth_sec : Protection active contre les failles CSRF et XSS.

## 🎨 Frontend & UI/UX
- [x] framework_front : Un framework frontend est utilisé avec justification.

- [x] api_consumption : Le frontend consomme correctement les données de l'API backend.

- [x] hmi : Interface fonctionnelle avec différentes vues/écrans.

- [x] uiux_quality : L'interface est soignée, polie et offre une expérience utilisateur de haute qualité.

- [x] code_orga : Le code frontend est bien organisé (utilisation de classes/composants).

## 🧪 Tests & Qualité de Code
- [x] maintainability : Code lisible, fonctions atomiques, syntaxe propre et noms explicites.

- [x] robustness : Aucune erreur n'apparaît dans la console web.

- [x] tests_sequence : Suite de tests unitaires fournie et facile à lancer.

- [x] tests_coverage : Un rapport de couverture de code est fourni.

- [x] tests_automation : Les tests sont lancés automatiquement via un script ou pipeline.

## 🔄 CI/CD & Versioning
- [x] versioning_basics : Workflow Git propre (branches, messages clairs, .gitignore).

- [x] ci_pipeline : Fichier(s) YAML définissant un pipeline CI complet.

- [x] ci_quality : Le pipeline bloque le déploiement si les tests ou le linting échouent.

## 📄 Documentation & Présentation
- [x] constraints : Respect strict de toutes les contraintes techniques du sujet.

- [x] doc_basic_ : Documentation technique couvrant les choix technologiques et l'architecture.

- [ ] presentation : Support de présentation professionnel (slides/démo).

- [ ] argumentation : Choix techniques argumentés avec logique et preuves.

- [ ] answers : Capacité à répondre aux questions techniques (Ops, Back, Front).
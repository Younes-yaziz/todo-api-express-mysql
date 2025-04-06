# API "To-Do List" Basique (Node.js, Express, MySQL)

Une API RESTful simple pour gérer une liste de tâches (To-Do List), construite avec Node.js, Express, et utilisant une base de données MySQL pour la persistance des données.

## Fonctionnalités

*   Lister toutes les tâches existantes.
*   Obtenir les détails d'une tâche spécifique par son ID.
*   Créer une nouvelle tâche (avec un titre).
*   Mettre à jour une tâche existante (modifier son titre et/ou son statut 'complété').
*   Supprimer une tâche par son ID.

## Technologies Utilisées

*   [Node.js](https://nodejs.org/) - Environnement d'exécution JavaScript côté serveur.
*   [Express.js](https://expressjs.com/fr/) - Framework web minimaliste pour Node.js.
*   [MySQL](https://www.mysql.com/) - Système de gestion de base de données relationnelle.
*   [mysql2](https://github.com/sidorares/node-mysql2) - Client MySQL pour Node.js (avec support des Promises).
*   [Nodemon](https://nodemon.io/) (pour le développement) - Utilitaire qui redémarre automatiquement le serveur lors de changements dans le code.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants sur votre système :

*   Node.js (v14 ou supérieur recommandé) et npm (généralement inclus avec Node.js)
*   Un serveur MySQL fonctionnel (localement ou accessible à distance)
*   Un outil de gestion de base de données comme [MySQL Workbench](https://www.mysql.com/products/workbench/), DBeaver, ou la ligne de commande `mysql`.
*   [Git](https://git-scm.com/) (optionnel, pour cloner le dépôt)
*   Un client API comme [Postman](https://www.postman.com/) ou [Insomnia](https://insomnia.rest/) pour tester les endpoints.

## Installation et Configuration

1.  **Cloner le dépôt (si vous l'avez mis sur GitHub) :**
    ```bash
    git clone https://github.com/VOTRE_NOM_UTILISATEUR/VOTRE_NOM_DE_DEPOT.git
    cd VOTRE_NOM_DE_DEPOT
    ```
    *Ou si vous travaillez localement, naviguez simplement vers le dossier du projet.*

2.  **Installer les dépendances Node.js :**
    ```bash
    npm install
    ```

3.  **Configurer la Base de Données MySQL :**
    *   Connectez-vous à votre serveur MySQL.
    *   Créez la base de données :
        ```sql
        CREATE DATABASE IF NOT EXISTS todo_db;
        ```
    *   Sélectionnez la base de données :
        ```sql
        USE todo_db;
        ```
    *   Créez la table `tasks` :
        ```sql
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            completed BOOLEAN DEFAULT false,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
        ```

4.  **Configurer la Connexion à la Base de Données dans l'API :**
    *   Ouvrez le fichier `server.js`.
    *   Localisez l'objet `dbConfig`.
    *   **Modifiez les valeurs** pour `host`, `user`, `password`, et `database` pour correspondre à votre configuration MySQL.
        ```javascript
        const dbConfig = {
            host: 'localhost',          // Ou l'adresse de votre serveur DB
            user: 'VOTRE_USER_MYSQL',   // VOTRE utilisateur MySQL
            password: 'VOTRE_MOT_DE_PASSE_MYSQL', // VOTRE mot de passe MySQL
            database: 'todo_db'         // Le nom de la base de données
            // port: 3306 // Décommentez et modifiez si nécessaire
        };
        ```
    *   **(Bonne pratique pour de vrais projets) :** Il est fortement recommandé d'utiliser des variables d'environnement (avec un package comme `dotenv`) pour gérer ces informations sensibles plutôt que de les coder en dur.

## Lancer le Serveur

*   **En mode développement (avec redémarrage automatique via Nodemon) :**
    ```bash
    npm run dev
    ```
*   **En mode production (ou standard) :**
    ```bash
    npm start
    ```

Le serveur démarrera généralement sur `http://localhost:3000`. Vérifiez les logs dans la console pour confirmer le port exact et la connexion à la base de données.

## Endpoints de l'API

L'URL de base est `http://localhost:3000`.

### `GET /`

*   **Description :** Endpoint racine pour vérifier si l'API fonctionne.
*   **Réponse Succès (200 OK) :**
    ```html
    <h1>API To-Do List fonctionne !</h1><p>Prête à recevoir des requêtes sur /tasks.</p>
    ```

### `GET /tasks`

*   **Description :** Récupère la liste de toutes les tâches.
*   **Réponse Succès (200 OK) :**
    ```json
    [
        {
            "id": 1,
            "title": "Faire les courses",
            "completed": false,
            "createdAt": "2023-10-27T10:00:00.000Z",
            "updatedAt": "2023-10-27T10:00:00.000Z"
        },
        {
            "id": 2,
            "title": "Apprendre Node.js",
            "completed": true,
            "createdAt": "2023-10-26T15:30:00.000Z",
            "updatedAt": "2023-10-27T11:00:00.000Z"
        }
        // ... autres tâches
    ]
    ```
*   **Réponse Erreur (500 Internal Server Error) :** En cas de problème serveur/base de données.
    ```json
    { "message": "Erreur interne du serveur lors de la récupération des tâches." }
    ```

### `POST /tasks`

*   **Description :** Crée une nouvelle tâche.
*   **Corps de la Requête (Body - JSON) :**
    ```json
    {
        "title": "Nouvelle tâche importante"
    }
    ```
*   **Réponse Succès (201 Created) :** Renvoie la tâche nouvellement créée.
    ```json
    {
        "id": 3,
        "title": "Nouvelle tâche importante",
        "completed": false,
        "createdAt": "2023-10-27T12:00:00.000Z",
        "updatedAt": "2023-10-27T12:00:00.000Z"
    }
    ```
*   **Réponse Erreur (400 Bad Request) :** Si le `title` est manquant ou vide.
    ```json
    { "message": "Le champ 'title' est obligatoire et ne peut pas être vide." }
    ```
*   **Réponse Erreur (500 Internal Server Error) :** En cas de problème serveur/base de données.

### `GET /tasks/:id`

*   **Description :** Récupère une tâche spécifique par son `id`.
*   **Paramètre d'URL :** `:id` (l'identifiant numérique de la tâche). Exemple : `/tasks/1`.
*   **Réponse Succès (200 OK) :**
    ```json
    {
        "id": 1,
        "title": "Faire les courses",
        "completed": false,
        "createdAt": "2023-10-27T10:00:00.000Z",
        "updatedAt": "2023-10-27T10:00:00.000Z"
    }
    ```
*   **Réponse Erreur (400 Bad Request) :** Si l'`id` n'est pas un nombre valide.
    ```json
    { "message": "L'ID de la tâche doit être un nombre valide." }
    ```
*   **Réponse Erreur (404 Not Found) :** Si aucune tâche avec cet `id` n'est trouvée.
    ```json
    { "message": "Tâche non trouvée." }
    ```
*   **Réponse Erreur (500 Internal Server Error) :** En cas de problème serveur/base de données.

### `PUT /tasks/:id`

*   **Description :** Met à jour une tâche existante (titre et/ou statut `completed`).
*   **Paramètre d'URL :** `:id` (l'identifiant numérique de la tâche).
*   **Corps de la Requête (Body - JSON) :** Inclure au moins `title` ou `completed`.
    ```json
    {
        "title": "Faire les courses (URGENT)",
        "completed": true
    }
    ```
    *Ou juste :*
    ```json
    {
        "completed": true
    }
    ```
*   **Réponse Succès (200 OK) :** Renvoie la tâche mise à jour.
    ```json
    {
        "id": 1,
        "title": "Faire les courses (URGENT)",
        "completed": true,
        "createdAt": "2023-10-27T10:00:00.000Z",
        "updatedAt": "2023-10-27T13:00:00.000Z" // Timestamp mis à jour
    }
    ```
*   **Réponse Erreur (400 Bad Request) :** Si l'`id` est invalide, si aucun champ n'est fourni, si `completed` n'est pas un booléen, ou si `title` est une chaîne vide.
*   **Réponse Erreur (404 Not Found) :** Si aucune tâche avec cet `id` n'est trouvée.
*   **Réponse Erreur (500 Internal Server Error) :** En cas de problème serveur/base de données.

### `DELETE /tasks/:id`

*   **Description :** Supprime une tâche spécifique par son `id`.
*   **Paramètre d'URL :** `:id` (l'identifiant numérique de la tâche).
*   **Réponse Succès (204 No Content) :** Aucune donnée n'est renvoyée dans le corps de la réponse.
*   **Réponse Erreur (400 Bad Request) :** Si l'`id` n'est pas un nombre valide.
*   **Réponse Erreur (404 Not Found) :** Si aucune tâche avec cet `id` n'est trouvée.
*   **Réponse Erreur (500 Internal Server Error) :** En cas de problème serveur/base de données.

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
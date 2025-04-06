// server.js
const express = require('express');
const mysql = require('mysql2/promise'); // On utilise la version avec Promises

const app = express();
const port = process.env.PORT || 3000; // Port d'écoute (3000 par défaut)

// --- Configuration de la connexion à la base de données ---
// !!! METTEZ VOS VRAIES INFORMATIONS ICI !!!
// (celles que vous utilisez dans MySQL Workbench pour vous connecter)
// Pour un projet réel, utilisez des variables d'environnement (ex: avec dotenv)
const dbConfig = {
    host: 'localhost',          // Ou l'adresse IP/nom d'hôte de votre serveur MySQL
    user: 'root',   // Votre nom d'utilisateur MySQL
    password: 'Aminux12', // Votre mot de passe MySQL
    database: 'todo_db'         // Le nom de la base de données créée
    // port: 3306 // Décommentez si votre port MySQL n'est pas 3306
};

let pool; // Variable pour stocker le pool de connexions MySQL

// Fonction asynchrone pour établir la connexion à la DB
async function connectDB() {
    try {
        // Crée un pool de connexions pour une meilleure gestion
        pool = mysql.createPool(dbConfig);

        // Optionnel: Tester la connexion en faisant une requête simple
        await pool.query('SELECT 1'); // Attend que la requête soit terminée
        console.log('Connecté avec succès à la base de données MySQL (todo_db).');

    } catch (error) {
        console.error('--- ERREUR DE CONNEXION À LA BASE DE DONNÉES ---');
        console.error(error);
        console.error('-------------------------------------------------');
        console.error('Vérifiez vos informations dans dbConfig (host, user, password, database).');
        console.error('Assurez-vous que le serveur MySQL est démarré.');
        process.exit(1); // Arrête l'application si la connexion échoue
    }
}

// --- Middlewares ---
// Middleware essentiel pour qu'Express puisse lire le JSON envoyé dans le corps des requêtes (POST, PUT)
app.use(express.json());

// --- Routes (seront définies à l'étape suivante) ---
// Route de base pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
    res.status(200).send('<h1>API To-Do List fonctionne !</h1><p>Prête à recevoir des requêtes sur /tasks.</p>');
});

// !! IMPORTANT !! Les routes spécifiques pour /tasks (GET, POST, PUT, DELETE)
// seront ajoutées ici à la prochaine étape.
// server.js (Ajoutez ce bloc APRÈS app.get('/') et AVANT la fonction startServer())

// --- Routes API pour les Tâches (CRUD) ---

// GET /tasks - Récupérer TOUTES les tâches
app.get('/tasks', async (req, res) => {
  console.log("Requête reçue : GET /tasks"); // Log pour le débogage
  try {
      // Exécute la requête SQL pour sélectionner toutes les tâches
      // 'pool.query' renvoie un tableau [rows, fields], on ne garde que rows avec la déstructuration [rows]
      const [rows] = await pool.query('SELECT * FROM tasks ORDER BY createdAt DESC'); // Ordonne par date de création

      console.log(`Récupéré ${rows.length} tâches.`);
      res.status(200).json(rows); // Renvoie les tâches en JSON avec le statut 200 OK

  } catch (error) {
      console.error("Erreur lors de la récupération des tâches:", error);
      // En cas d'erreur serveur, renvoyer un statut 500
      res.status(500).json({ message: "Erreur interne du serveur lors de la récupération des tâches." });
  }
});

// POST /tasks - Créer une NOUVELLE tâche
app.post('/tasks', async (req, res) => {
  console.log("Requête reçue : POST /tasks", req.body); // Affiche le corps de la requête
  const { title } = req.body; // Extrait la propriété 'title' du corps JSON de la requête

  // Validation simple : vérifier si le titre est fourni
  if (!title || title.trim() === '') { // Vérifie aussi si le titre n'est pas vide après avoir retiré les espaces
      console.log("Erreur de validation : titre manquant ou vide.");
      return res.status(400).json({ message: "Le champ 'title' est obligatoire et ne peut pas être vide." });
  }

  try {
      // Exécute la requête SQL pour insérer une nouvelle tâche
      const [result] = await pool.query('INSERT INTO tasks (title) VALUES (?)', [title]);
      const insertId = result.insertId; // Récupère l'ID auto-généré par MySQL pour la nouvelle tâche

      console.log(`Tâche créée avec l'ID: ${insertId}`);

      // Optionnel mais recommandé : Récupérer la tâche complète qui vient d'être créée
      const [newTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [insertId]);

      // Renvoyer la tâche nouvellement créée avec le statut 201 Created
      res.status(201).json(newTask[0]);

  } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error);
      res.status(500).json({ message: "Erreur interne du serveur lors de la création de la tâche." });
  }
});

// GET /tasks/:id - Récupérer UNE tâche spécifique par son ID
app.get('/tasks/:id', async (req, res) => {
  const { id } = req.params; // Extrait l'ID depuis les paramètres de l'URL (ex: /tasks/5 -> id = 5)
  console.log(`Requête reçue : GET /tasks/${id}`);

  // Vérifier si l'ID est un nombre valide (sécurité basique)
  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
      return res.status(400).json({ message: "L'ID de la tâche doit être un nombre valide." });
  }

  try {
      const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);

      // Vérifier si une tâche avec cet ID a été trouvée
      if (rows.length === 0) {
          console.log(`Tâche avec ID ${taskId} non trouvée.`);
          return res.status(404).json({ message: "Tâche non trouvée." }); // Statut 404 Not Found
      }

      console.log(`Tâche ID ${taskId} trouvée.`);
      res.status(200).json(rows[0]); // Renvoie la première (et unique) tâche trouvée

  } catch (error) {
      console.error(`Erreur lors de la récupération de la tâche ${taskId}:`, error);
      res.status(500).json({ message: "Erreur interne du serveur lors de la récupération de la tâche." });
  }
});

// PUT /tasks/:id - Mettre à jour une tâche existante
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body; // Récupère 'title' et/ou 'completed' du corps JSON
  console.log(`Requête reçue : PUT /tasks/${id}`, req.body);

  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
      return res.status(400).json({ message: "L'ID de la tâche doit être un nombre valide." });
  }

  // Validation : au moins un champ doit être fourni pour la mise à jour
  if (title === undefined && completed === undefined) {
      return res.status(400).json({ message: "Requête invalide. Fournissez au moins 'title' ou 'completed' pour la mise à jour." });
  }

  // Validation : si 'completed' est fourni, il doit être un booléen
  if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ message: "Le champ 'completed' doit être un booléen (true ou false)." });
  }
  // Validation : si 'title' est fourni, il ne peut pas être une chaîne vide
   if (title !== undefined && typeof title === 'string' && title.trim() === '') {
       return res.status(400).json({ message: "Le champ 'title' ne peut pas être vide." });
   }


  try {
      // Construction dynamique de la requête UPDATE pour ne modifier que les champs fournis
      const fieldsToUpdate = [];
      const values = [];

      if (title !== undefined) {
          fieldsToUpdate.push('title = ?');
          values.push(title);
      }
      if (completed !== undefined) {
          fieldsToUpdate.push('completed = ?');
          values.push(completed);
      }

      // S'il n'y a rien à mettre à jour (ne devrait pas arriver avec la validation ci-dessus, mais par sécurité)
      if (fieldsToUpdate.length === 0) {
           return res.status(400).json({ message: "Aucun champ valide fourni pour la mise à jour." });
      }

      // Ajoute l'ID à la fin pour la clause WHERE
      values.push(taskId);

      const sqlQuery = `UPDATE tasks SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
      console.log("Executing SQL:", sqlQuery, values); // Affiche la requête SQL générée

      const [result] = await pool.query(sqlQuery, values);

      // Vérifier si une ligne a été affectée (si la tâche existait)
      if (result.affectedRows === 0) {
          console.log(`Tâche ID ${taskId} non trouvée pour la mise à jour.`);
          return res.status(404).json({ message: "Tâche non trouvée." });
      }

      console.log(`Tâche ID ${taskId} mise à jour.`);

      // Récupérer la tâche mise à jour pour la renvoyer
      const [updatedTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
      res.status(200).json(updatedTask[0]); // Renvoyer la tâche mise à jour

  } catch (error) {
      console.error(`Erreur lors de la mise à jour de la tâche ${taskId}:`, error);
      res.status(500).json({ message: "Erreur interne du serveur lors de la mise à jour de la tâche." });
  }
});

// DELETE /tasks/:id - Supprimer une tâche
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Requête reçue : DELETE /tasks/${id}`);

  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
      return res.status(400).json({ message: "L'ID de la tâche doit être un nombre valide." });
  }

  try {
      const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [taskId]);

      // Vérifier si une ligne a été supprimée
      if (result.affectedRows === 0) {
          console.log(`Tâche ID ${taskId} non trouvée pour la suppression.`);
          return res.status(404).json({ message: "Tâche non trouvée." });
      }

      console.log(`Tâche ID ${taskId} supprimée.`);
      // Statut 204 No Content : succès, mais il n'y a rien à renvoyer dans le corps
      res.status(204).send();

  } catch (error) {
      console.error(`Erreur lors de la suppression de la tâche ${taskId}:`, error);
      res.status(500).json({ message: "Erreur interne du serveur lors de la suppression de la tâche." });
  }
});

// --- Fin des Routes API ---
// --- Démarrage du serveur ---
// Fonction pour démarrer le serveur APRÈS s'être connecté à la DB
async function startServer() {
    await connectDB(); // 1. Se connecter à la base de données

    // 2. Démarrer le serveur Express seulement si la connexion DB est réussie
    app.listen(port, () => {
        console.log(`Serveur API Express démarré et écoutant sur http://localhost:${port}`);
    });
}

// Lancer le processus de démarrage
startServer();

// Exporter `pool` pour pouvoir l'utiliser dans d'autres fichiers (si vous structurez en modules plus tard)
// Pour cette version simple, on ne l'exporte pas car tout est dans server.js
// module.exports = pool;
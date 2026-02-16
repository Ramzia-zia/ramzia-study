// Importation des modules nécessaires
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

// Initialisation
const app = express();
const PORT = 3000;

// Configuration de l'API Gemini
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Base de données simple en mémoire
let planningData = [];
let rappels = [];

/* ============================
   ROUTE 1 : Chat IA
============================ */
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    console.log('Message reçu:', message);

    const prompt = `Tu es RAMZIA, un assistant IA spécialisé pour aider les étudiants. Tu es pédagogue, encourageant et précis.

Tes rôles :
- Expliquer clairement les concepts
- Aider avec devoirs et exercices
- Donner conseils d'étude
- Motiver les étudiants

Question de l'étudiant : ${message}

Réponds clairement en 2-3 paragraphes maximum.`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = result.text;

    console.log('Réponse envoyée');

    res.json({ reply: text });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      error: 'Erreur communication avec RAMZIA'
    });
  }
});

/* ============================
   ROUTE 2 : Résumé
============================ */
app.post('/api/resume', async (req, res) => {
  try {
    const { texte } = req.body;
    console.log('Demande résumé reçue');

    const prompt = `Fais un résumé clair pour étudiant :

${texte}

Structure :
1. Points principaux
2. Concepts clés
3. Conseil de révision`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const resume = result.text;

    res.json({ resume });

  } catch (error) {
    console.error('Erreur résumé:', error);
    res.status(500).json({
      error: 'Erreur génération résumé'
    });
  }
});

/* ============================
   ROUTE 3 : Planning
============================ */
app.get('/api/planning', (req, res) => {
  res.json(planningData);
});

app.post('/api/planning', (req, res) => {
  const event = {
    id: Date.now(),
    ...req.body,
  };

  planningData.push(event);
  console.log('Événement ajouté:', event.title);
  res.json(event);
});

app.delete('/api/planning/:id', (req, res) => {
  const id = parseInt(req.params.id);
  planningData = planningData.filter(e => e.id !== id);
  res.json({ success: true });
});

/* ============================
   ROUTE 4 : Rappels
============================ */
app.get('/api/rappels', (req, res) => {
  res.json(rappels);
});

app.post('/api/rappels', (req, res) => {
  const rappel = {
    id: Date.now(),
    ...req.body,
  };

  rappels.push(rappel);
  console.log('Rappel ajouté:', rappel.matiere);
  res.json(rappel);
});

app.delete('/api/rappels/:id', (req, res) => {
  const id = parseInt(req.params.id);
  rappels = rappels.filter(r => r.id !== id);
  res.json({ success: true });
});

/* ============================
   Démarrage serveur
============================ */
app.listen(PORT, () => {
  console.log(`🚀 Serveur RAMZIA Study démarré sur http://localhost:${PORT}`);
  console.log(`📚 RAMZIA Study propulsé par Google Gemini AI !`);
  console.log(`✨ Prêt à aider les étudiants !`);
});

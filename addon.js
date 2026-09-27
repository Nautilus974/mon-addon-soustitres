const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const PORT = process.env.PORT || 7000;
// Adresse publique de l'addon une fois en ligne (ex : https://mes-sous-titres.onrender.com)
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;

// Tes sous-titres : code IMDb du film -> fichiers placés dans le dossier "subs"
const SOUS_TITRES = {
  "tt1904937": [ // Kaiji 2: The Ultimate Gambler
    { fichier: "kaiji2.fr.srt", langue: "fre" }
  ],
  "tt10423160": [ // Kaiji: Final Game
    { fichier: "Kaiji_Final_Game_2020_FR.srt", langue: "fre" }
  ]
  // Pour ajouter un film : "ttXXXXXXX": [{ fichier: "nom.srt", langue: "fre" }],
};

const manifest = {
  id: "org.nautilus97.soustitres",
  version: "1.0.0",
  name: "Mes sous-titres",
  description: "Mes sous-titres personnels",
  resources: ["subtitles"],
  types: ["movie"],
  idPrefixes: ["tt"],
  catalogs: []
};

const builder = new addonBuilder(manifest);

builder.defineSubtitlesHandler(({ id }) => {
  const liste = SOUS_TITRES[id] || [];
  const subtitles = liste.map((s, i) => ({
    id: `perso-${id}-${i}`,
    url: `${BASE_URL}/subs/${encodeURIComponent(s.fichier)}`,
    lang: s.langue
  }));
  return Promise.resolve({ subtitles });
});

serveHTTP(builder.getInterface(), { port: PORT, static: "/subs" });

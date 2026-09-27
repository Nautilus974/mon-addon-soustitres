const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const PORT = process.env.PORT || 7000;
// Adresse publique de l'addon une fois en ligne (ex : https://mes-sous-titres.onrender.com)
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;

// Tes sous-titres. Pour chaque film :
// - imdb : code IMDb (quand le film est lancé depuis sa fiche Stremio)
// - motsCles : mots présents dans le nom de la vidéo (quand elle est lancée depuis tes fichiers AllDebrid)
// - fichier : nom du fichier dans le dossier "subs"
const SOUS_TITRES = [
  { film: "Kaiji 2", imdb: "tt1904937", fichier: "kaiji2.fr.srt", langue: "fre" },
  { film: "Kaiji: Final Game", imdb: "tt10423160", motsCles: ["kaiji", "final"], fichier: "Kaiji_Final_Game_2020_FR.srt", langue: "fre" },
];

const manifest = {
  id: "org.nautilus97.soustitres",
  version: "1.1.0",
  name: "Mes sous-titres",
  description: "Mes sous-titres personnels",
  resources: ["subtitles"],
  types: ["movie", "series", "other"],
  catalogs: []
};

const builder = new addonBuilder(manifest);

builder.defineSubtitlesHandler(({ type, id, extra }) => {
  const nomVideo = ((extra && extra.filename) || "").toLowerCase();
  const texte = (id + " " + nomVideo).toLowerCase();
  console.log(`Demande de sous-titres : type=${type} id=${id} fichier=${nomVideo}`);

  const trouves = SOUS_TITRES.filter(s =>
    (s.imdb && id.split(":")[0] === s.imdb) ||
    (s.motsCles && s.motsCles.every(mot => texte.includes(mot)))
  );

  const subtitles = trouves.map((s, i) => ({
    id: `perso-${i}-${s.fichier}`,
    url: `${BASE_URL}/subs/${encodeURIComponent(s.fichier)}`,
    lang: s.langue
  }));
  return Promise.resolve({ subtitles });
});

serveHTTP(builder.getInterface(), { port: PORT, static: "/subs" });

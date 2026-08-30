const chemins = {
    "39001": "39 - JURA/39001 - LAC NARLAY/",
    "39002": "39 - JURA/39002 - LACS ILAY + MACLU/",
    "39003": "39 - JURA/39003 - CASCADES HERISSON/",
    "39004": "39 - JURA/39004 - LACS ILAY + MACLU + NARLAY/",
    "39005": "39 - JURA/39005 - LAC ABBAYE/",
	"39006": "39 - JURA/39006 - MOREZ"
};

const elements = {
    nom: document.getElementById("nom"),
    code: document.getElementById("code"),
    distance: document.getElementById("distance"),
    duree: document.getElementById("duree"),
    denivele: document.getElementById("denivele"),
    lieu: document.getElementById("lieu"),
    adresse: document.getElementById("adresse"),
    carte: document.getElementById("carte"),
    telecharger: document.getElementById("telecharger"),
    erreur: document.getElementById("erreur"),
    boutonMaps: document.getElementById("boutonMaps"),
    boutonWaze: document.getElementById("boutonWaze"),
    carteConteneur: document.getElementById("carteConteneur"),
    boutonPleinEcran: document.getElementById("boutonPleinEcran")
};


function afficherErreur(message) {
    elements.nom.textContent = "Erreur";
    elements.erreur.textContent = message;
}


function afficherDuree(minutesTotal) {
    const heures = Math.floor(minutesTotal / 60);
    const minutes = minutesTotal % 60;
    const morceaux = [];

    if (heures) morceaux.push(`${heures} h`);
    if (minutes) morceaux.push(`${minutes} min`);

    elements.duree.textContent = morceaux.join(" ");
}


function configurerNavigation(latitude, longitude) {
    const destinations = {
        boutonMaps: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
        boutonWaze: `https://www.waze.com/ul?ll=${latitude},${longitude}&navigate=yes`
    };

    for (const [bouton, url] of Object.entries(destinations)) {
        elements[bouton].onclick = () => {
            window.location.href = url;
        };
    }
}


elements.boutonPleinEcran.onclick = function () {
    const pleinEcran = elements.carteConteneur.classList.toggle("plein-ecran");

    elements.boutonPleinEcran.textContent = pleinEcran ? "✕" : "⛶";
};


async function chargerRandonnee() {
    const code = new URLSearchParams(window.location.search).get("rando");

    if (!code) {
        afficherErreur("Aucune randonnée n'a été indiquée.");
        return;
    }

    const dossier = chemins[code];

    if (!dossier) {
        afficherErreur("Randonnée introuvable.");
        return;
    }

    try {
        const base = dossier + code;
        const reponse = await fetch(base + ".json");

        if (!reponse.ok) {
            throw new Error("JSON introuvable");
        }

        const rando = await reponse.json();

        const {
            nom,
            distance_km,
            duree_minutes,
            denivele_positif_m,
            depart
        } = rando;

        const [codeRandonnee, ...nomRandonnee] = nom.split(" - ");

        document.title = nom;

        elements.nom.textContent = nomRandonnee.join(" - ");
        elements.code.textContent = "Référence : " + codeRandonnee;

        elements.distance.textContent = distance_km + " km";

        afficherDuree(duree_minutes);

        elements.denivele.textContent = denivele_positif_m + " m";

        elements.lieu.textContent = depart.lieu_dit;
        elements.adresse.textContent = depart.adresse;

        elements.carte.src = base + "1 - carte.png";

        elements.telecharger.href = base + "2 - trace.gpx";
        elements.telecharger.download = code + "2 - trace.gpx";

        configurerNavigation(depart.latitude, depart.longitude);
    }

    catch (erreur) {
        afficherErreur("Impossible de charger les informations de la randonnée.");
        console.error(erreur);
    }
}

chargerRandonnee();
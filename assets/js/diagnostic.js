/*
 * Diagnostic « Où en est votre application ? »
 * Tout se passe dans le navigateur : aucune réponse n'est envoyée ni enregistrée.
 */
(function (racine) {
  'use strict';

  var USAGES = {
    corriger: {
      nom: 'Corriger et maintenir',
      texte: "Remettre l'application en état de marche et la faire vivre."
    },
    identique: {
      nom: "Refaire à l'identique",
      texte: "Reconstruire ce qui doit l'être, sans changer ce que l'application fait."
    },
    repenser: {
      nom: "Repenser l'application",
      texte: "Revoir avec vous ce qu'elle doit faire. C'est un projet à part, chiffré séparément et proposé sur la feuille de route."
    }
  };

  // En cas d'égalité, le premier de la liste l'emporte : on part du plus prudent.
  var ORDRE_USAGES = ['corriger', 'identique', 'repenser'];

  var POINTS = {
    q2: {
      evolution: { corriger: 1, identique: 1 },
      pannes: { corriger: 2 },
      intouchable: { identique: 2 },
      decalage: { repenser: 2 }
    },
    q4: {
      stable: { corriger: 2 },
      evoluer: { identique: 2 },
      besoins: { repenser: 2 },
      comprendre: { corriger: 1 }
    }
  };

  var VALIDATION = {
    interne: 'Vous validez',
    suivre: 'Nous donnons un avis, vous validez',
    personne: 'Nous validons pour vous'
  };

  var SAVOIR = {
    origine: "Votre développeur connaît l'application, mais ce savoir n'est écrit nulle part. Nous l'écrivons, pour qu'il ne dépende plus d'une seule personne.",
    parti: "Personne ne peut plus vous l'expliquer. Nous repartons du code pour écrire ce que l'application fait vraiment.",
    partiel: "Votre équipe en connaît une partie. Nous partons de ce qu'elle sait et nous complétons à partir du code.",
    personne: "Nous repartons du code pour écrire ce que l'application fait vraiment : les règles de gestion, ce qui est cassé, ce qui est risqué, ce qui peut évoluer."
  };

  var APPLICATION = {
    devis: 'votre application de devis et de facturation',
    stocks: 'votre application de stocks et de production',
    clients: 'votre application de clients et de commandes',
    autre: 'votre application métier'
  };

  function calculer(reponses) {
    var scores = { corriger: 0, identique: 0, repenser: 0 };
    ['q2', 'q4'].forEach(function (q) {
      var points = POINTS[q][reponses[q]] || {};
      Object.keys(points).forEach(function (usage) { scores[usage] += points[usage]; });
    });

    var usage = ORDRE_USAGES.reduce(function (meilleur, u) {
      return scores[u] > scores[meilleur] ? u : meilleur;
    }, ORDRE_USAGES[0]);

    return {
      application: APPLICATION[reponses.q1] || APPLICATION.autre,
      usage: usage,
      usageNom: USAGES[usage].nom,
      usageTexte: USAGES[usage].texte,
      validation: VALIDATION[reponses.q5] || VALIDATION.personne,
      savoir: SAVOIR[reponses.q3] || SAVOIR.personne
    };
  }

  function mailto(adresse, questions, reponses, resultat) {
    var lignes = ['Bonjour,', '', "J'ai répondu au diagnostic du site Darkmira Service.", ''];
    questions.forEach(function (q) {
      lignes.push('- ' + q.question + ' ' + q.libelles[reponses[q.id]]);
    });
    lignes.push('', 'Suite proposée : ' + resultat.usageNom + '. Validation : ' + resultat.validation + '.');
    lignes.push('', "J'aimerais en parler avec vous.");
    return 'mailto:' + adresse +
      '?subject=' + encodeURIComponent('Rendez-vous Darkmira Service') +
      '&body=' + encodeURIComponent(lignes.join('\r\n'));
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculer: calculer, mailto: mailto };
  }

  if (typeof document === 'undefined') return;

  function el(tag, classe, texte) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texte) n.textContent = texte;
    return n;
  }

  function demarrer(bloc) {
    var form = bloc.querySelector('form');
    var accueil = bloc.querySelector('.diag__accueil');
    var resultatBloc = bloc.querySelector('.diag__resultat');
    var etapes = Array.prototype.slice.call(form.querySelectorAll('fieldset'));
    var etapeTexte = form.querySelector('.diag__etape');
    var barre = form.querySelector('.diag__progression span');
    var retour = form.querySelector('[data-retour]');
    var suivant = form.querySelector('[data-suivant]');
    var courante = 0;

    var questions = etapes.map(function (f) {
      var libelles = {};
      f.querySelectorAll('input').forEach(function (i) {
        libelles[i.value] = i.parentNode.textContent.trim();
      });
      return { id: f.dataset.q, question: f.dataset.resume, libelles: libelles };
    });

    function reponses() {
      var r = {};
      etapes.forEach(function (f) {
        var coche = f.querySelector('input:checked');
        r[f.dataset.q] = coche ? coche.value : null;
      });
      return r;
    }

    function afficher(i, focus) {
      courante = i;
      etapes.forEach(function (f, n) { f.hidden = n !== i; });
      etapeTexte.textContent = 'Question ' + (i + 1) + ' sur ' + etapes.length;
      barre.style.width = ((i + 1) / etapes.length * 100) + '%';
      retour.hidden = i === 0;
      suivant.textContent = i === etapes.length - 1 ? 'Voir le résultat' : 'Suivant';
      suivant.disabled = !etapes[i].querySelector('input:checked');
      if (focus) etapes[i].querySelector('legend').focus();
    }

    function montrerResultat() {
      var r = reponses();
      var res = calculer(r);
      resultatBloc.textContent = '';

      resultatBloc.appendChild(el('h3', 'diag__titre', 'Pour ' + res.application + ', voici une première piste.'));

      var liste = el('ol', 'frise diag__frise');
      [
        ['Nous analysons', "Le code, l'environnement et les problèmes rencontrés. Une mission courte, chiffrée et facturée."],
        ["Nous écrivons ce que l'application fait vraiment", res.savoir + ' Ce document vous appartient dès la prestation payée.'],
        ['Vous choisissez par quoi nous commençons', "Sur une feuille de route claire, sur laquelle un décideur peut s'engager."]
      ].forEach(function (t) {
        var li = el('li');
        li.appendChild(el('h4', null, t[0]));
        li.appendChild(el('p', null, t[1]));
        liste.appendChild(li);
      });
      resultatBloc.appendChild(liste);

      var synthese = el('dl', 'diag__synthese');
      [
        ['La suite que vous pourriez choisir', res.usageNom, res.usageTexte],
        ['Qui valide', res.validation, 'Rien de stratégique ou de critique ne part en production sans contrôle humain.']
      ].forEach(function (t) {
        var d = el('div');
        d.appendChild(el('dt', null, t[0]));
        var dd = el('dd');
        dd.appendChild(el('strong', null, t[1]));
        dd.appendChild(el('span', null, t[2]));
        d.appendChild(dd);
        synthese.appendChild(d);
      });
      resultatBloc.appendChild(synthese);

      resultatBloc.appendChild(el('p', 'diag__mention', "C'est une première idée, tirée de vos réponses. Après l'analyse, c'est vous qui décidez."));

      var actions = el('div', 'actions');
      var rdv = el('a', 'bouton bouton--vert', 'Prendre rendez-vous');
      rdv.href = mailto('contact@darkmira.fr', questions, r, res);
      var recommencer = el('button', 'bouton bouton--lien', 'Recommencer');
      recommencer.type = 'button';
      recommencer.addEventListener('click', function () {
        form.reset();
        resultatBloc.hidden = true;
        form.hidden = false;
        afficher(0, true);
      });
      actions.appendChild(rdv);
      actions.appendChild(recommencer);
      resultatBloc.appendChild(actions);

      form.hidden = true;
      resultatBloc.hidden = false;
      resultatBloc.focus();
    }

    bloc.querySelector('[data-commencer]').addEventListener('click', function () {
      accueil.hidden = true;
      form.hidden = false;
      afficher(0, true);
    });

    form.addEventListener('change', function () {
      suivant.disabled = !etapes[courante].querySelector('input:checked');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (suivant.disabled) return;
      if (courante < etapes.length - 1) afficher(courante + 1, true);
      else montrerResultat();
    });

    retour.addEventListener('click', function () {
      if (courante > 0) afficher(courante - 1, true);
    });

    bloc.hidden = false;
  }

  document.querySelectorAll('[data-diagnostic]').forEach(demarrer);
})(this);

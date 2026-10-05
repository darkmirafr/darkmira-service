/*
 * Diagnostic « Où en est votre application ? »
 * Tout se passe dans le navigateur : aucune réponse n'est envoyée ni enregistrée.
 * Les textes suivent la langue de la page (<html lang="fr"> ou <html lang="en">).
 */
(function (racine) {
  'use strict';

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

  var TEXTES = {
    fr: {
      usages: {
        corriger: { nom: 'Corriger et maintenir', texte: "Remettre l'application en état de marche et la faire vivre." },
        identique: { nom: "Refaire à l'identique", texte: "Reconstruire ce qui doit l'être, sans changer ce que l'application fait." },
        repenser: { nom: "Repenser l'application", texte: "Revoir avec vous ce qu'elle doit faire. C'est un projet à part, chiffré séparément et proposé sur la feuille de route." }
      },
      validation: {
        interne: 'Vous validez',
        suivre: 'Nous donnons un avis, vous validez',
        personne: 'Nous validons pour vous'
      },
      savoir: {
        origine: "Votre développeur connaît l'application, mais ce savoir n'est écrit nulle part. Nous l'écrivons, pour qu'il ne dépende plus d'une seule personne.",
        parti: "Personne ne peut plus vous l'expliquer. Nous repartons du code pour écrire ce que l'application fait vraiment.",
        partiel: "Votre équipe en connaît une partie. Nous partons de ce qu'elle sait et nous complétons à partir du code.",
        personne: "Nous repartons du code pour écrire ce que l'application fait vraiment : les règles de gestion, ce qui est cassé, ce qui est risqué, ce qui peut évoluer."
      },
      application: {
        devis: 'votre application de devis et de facturation',
        stocks: 'votre application de stocks et de production',
        clients: 'votre application de clients et de commandes',
        autre: 'votre application métier'
      },
      etape: function (i, n) { return 'Question ' + i + ' sur ' + n; },
      suivant: 'Suivant',
      voirResultat: 'Voir le résultat',
      titre: function (application) { return 'Pour ' + application + ', voici une première piste.'; },
      temps: [
        ['Nous analysons', "Le code, l'environnement et les problèmes rencontrés. Une mission courte, chiffrée et facturée."],
        ["Nous écrivons ce que l'application fait vraiment", 'Ce document vous appartient dès la prestation payée.'],
        ['Vous choisissez par quoi nous commençons', "Sur une feuille de route claire, sur laquelle un décideur peut s'engager."]
      ],
      suite: 'La suite que vous pourriez choisir',
      quiValide: 'Qui valide',
      garantie: 'Rien de stratégique ou de critique ne part en production sans contrôle humain.',
      mention: "C'est une première idée, tirée de vos réponses. Après l'analyse, c'est vous qui décidez.",
      rendezVous: 'Prendre rendez-vous',
      recommencer: 'Recommencer',
      mail: {
        objet: 'Rendez-vous Darkmira Service',
        debut: ['Bonjour,', '', "J'ai répondu au diagnostic du site Darkmira Service.", ''],
        suite: function (r) { return 'Suite proposée : ' + r.usageNom + '. Validation : ' + r.validation + '.'; },
        fin: "J'aimerais en parler avec vous."
      }
    },
    en: {
      usages: {
        corriger: { nom: 'Fix and maintain', texte: 'Get the application working properly again and keep it running.' },
        identique: { nom: 'Rebuild as is', texte: 'Rebuild what needs rebuilding, without changing what the application does.' },
        repenser: { nom: 'Rethink the application', texte: 'Review with you what it should do. This is a separate project, priced separately and proposed in the roadmap.' }
      },
      validation: {
        interne: 'You approve',
        suivre: 'We advise, you approve',
        personne: 'We approve on your behalf'
      },
      savoir: {
        origine: "Your developer knows the application, but that knowledge isn't written down anywhere. We write it down, so it no longer depends on one person.",
        parti: 'Nobody can explain it to you any more. We work from the code to write down what the application really does.',
        partiel: 'Your team knows part of it. We start from what they know and fill in the rest from the code.',
        personne: "We work from the code to write down what the application really does: the business rules, what's broken, what's risky, what can evolve."
      },
      application: {
        devis: 'your quoting and invoicing application',
        stocks: 'your inventory and production application',
        clients: 'your customer and order application',
        autre: 'your business application'
      },
      etape: function (i, n) { return 'Question ' + i + ' of ' + n; },
      suivant: 'Next',
      voirResultat: 'See the result',
      titre: function (application) { return 'For ' + application + ', here is a first lead.'; },
      temps: [
        ['We analyse', 'The code, the environment and the problems you are facing. A short assignment, quoted and invoiced.'],
        ['We write down what the application really does', 'This document is yours once the assignment is paid for.'],
        ['You choose where we start', 'Based on a clear roadmap that a decision-maker can commit to.']
      ],
      suite: 'The next step you might choose',
      quiValide: 'Who approves',
      garantie: 'Nothing strategic or critical goes into production without human oversight.',
      mention: "This is a first idea, based on your answers. After the analysis, you're the one who decides.",
      rendezVous: 'Book a meeting',
      recommencer: 'Start again',
      mail: {
        objet: 'Darkmira Service meeting',
        debut: ['Hello,', '', 'I completed the assessment on the Darkmira Service website.', ''],
        suite: function (r) { return 'Suggested next step: ' + r.usageNom + '. Approval: ' + r.validation + '.'; },
        fin: "I'd like to discuss it with you."
      }
    }
  };

  function textes(langue) {
    return TEXTES[langue] || TEXTES.fr;
  }

  function calculer(reponses, langue) {
    var t = textes(langue);
    var scores = { corriger: 0, identique: 0, repenser: 0 };
    ['q2', 'q4'].forEach(function (q) {
      var points = POINTS[q][reponses[q]] || {};
      Object.keys(points).forEach(function (usage) { scores[usage] += points[usage]; });
    });

    var usage = ORDRE_USAGES.reduce(function (meilleur, u) {
      return scores[u] > scores[meilleur] ? u : meilleur;
    }, ORDRE_USAGES[0]);

    return {
      application: t.application[reponses.q1] || t.application.autre,
      usage: usage,
      usageNom: t.usages[usage].nom,
      usageTexte: t.usages[usage].texte,
      validation: t.validation[reponses.q5] || t.validation.personne,
      savoir: t.savoir[reponses.q3] || t.savoir.personne
    };
  }

  function mailto(adresse, questions, reponses, resultat, langue) {
    var m = textes(langue).mail;
    var lignes = m.debut.slice();
    questions.forEach(function (q) {
      lignes.push('- ' + q.question + ' ' + q.libelles[reponses[q.id]]);
    });
    lignes.push('', m.suite(resultat));
    lignes.push('', m.fin);
    return 'mailto:' + adresse +
      '?subject=' + encodeURIComponent(m.objet) +
      '&body=' + encodeURIComponent(lignes.join('\r\n'));
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculer: calculer, mailto: mailto };
  }

  if (typeof document === 'undefined') return;

  var langue = (document.documentElement.lang || 'fr').slice(0, 2);
  var t = textes(langue);

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
      etapeTexte.textContent = t.etape(i + 1, etapes.length);
      barre.style.width = ((i + 1) / etapes.length * 100) + '%';
      retour.hidden = i === 0;
      suivant.textContent = i === etapes.length - 1 ? t.voirResultat : t.suivant;
      suivant.disabled = !etapes[i].querySelector('input:checked');
      if (focus) etapes[i].querySelector('legend').focus();
    }

    function montrerResultat() {
      var r = reponses();
      var res = calculer(r, langue);
      resultatBloc.textContent = '';

      resultatBloc.appendChild(el('h3', 'diag__titre', t.titre(res.application)));

      var liste = el('ol', 'frise diag__frise');
      t.temps.forEach(function (temps, n) {
        var li = el('li');
        li.appendChild(el('h4', null, temps[0]));
        li.appendChild(el('p', null, n === 1 ? res.savoir + ' ' + temps[1] : temps[1]));
        liste.appendChild(li);
      });
      resultatBloc.appendChild(liste);

      var synthese = el('dl', 'diag__synthese');
      [
        [t.suite, res.usageNom, res.usageTexte],
        [t.quiValide, res.validation, t.garantie]
      ].forEach(function (ligne) {
        var d = el('div');
        d.appendChild(el('dt', null, ligne[0]));
        var dd = el('dd');
        dd.appendChild(el('strong', null, ligne[1]));
        dd.appendChild(el('span', null, ligne[2]));
        d.appendChild(dd);
        synthese.appendChild(d);
      });
      resultatBloc.appendChild(synthese);

      resultatBloc.appendChild(el('p', 'diag__mention', t.mention));

      var actions = el('div', 'actions');
      var rdv = el('a', 'bouton bouton--vert', t.rendezVous);
      rdv.href = mailto('contact@darkmira.fr', questions, r, res, langue);
      var recommencer = el('button', 'bouton bouton--lien', t.recommencer);
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

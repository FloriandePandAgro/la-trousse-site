# La Trousse — Site

Pages web de la marque **La Trousse** : agendas 2026-2027 pour enseignants, une page par matière + une page d'accueil vitrine.

## Contenu

| Fichier | Page | Statut |
|---|---|---|
| `pages/index.html` | Accueil (choix de matière) | ✅ |
| `pages/svt.html` | Agenda SVT (× Pandagro) | ✅ |
| `pages/physique-chimie.html` | Agenda Physique-Chimie | ✅ |
| `pages/maths.html` | Agenda Maths | ✅ |
| `pages/francais.html` | Agenda Français | ✅ |
| `pages/histoire-geographie.html` | Agenda Histoire-Géo | ✅ |
| `pages/eps.html` | Agenda EPS | ✅ |
| `pages/espagnol.html` | Agenda Espagnol | ✅ |
| `pages/enseignant.html` | Agenda Enseignant collège-lycée | ✅ |
| `pages/anglais.html` | Agenda Anglais | 🕓 Bientôt (pas encore en vente) |

## Comment modifier avec Claude Code

Depuis ce dossier, lancer `claude` puis demander en langage naturel, par exemple :
- « Change le footer sur toutes les pages pour dire X »
- « Sur toutes les pages produit, remplace le souligné du titre par celui de l'accueil »
- « Ajoute une bannière promo en haut de la page maths »

Claude Code lit `CLAUDE.md` (conventions, couleurs, liens, règles) avant chaque modif pour rester cohérent.

## Design

Voir `CLAUDE.md` pour le design system complet (couleurs, polices, liens Amazon/Bookmundo, règles de contenu).

## Hébergement

Ces fichiers sont des blocs HTML autonomes (CSS inline). Deux options :
1. **Coller** dans Systeme.io / CMS (manuel).
2. **Héberger le repo** via GitHub Pages, Netlify ou Vercel → mise en ligne automatique à chaque `git push`. Recommandé pour tirer parti de Claude Code.

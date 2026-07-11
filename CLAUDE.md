# La Trousse — Agendas pour enseignants

Site vitrine + pages produit pour la marque **La Trousse** (agendas scolaires par matière).
Chaque page est un bloc HTML autonome (inline `<style>`, pas de fichier CSS externe) pour pouvoir être collé dans un CMS si besoin.

## Structure

```
pages/
  index.html              → page d'accueil (vitrine, choix de matière)
  svt.html                → agenda SVT (La Trousse × Pandagro)
  physique-chimie.html
  maths.html
  francais.html
  histoire-geographie.html
  eps.html
  espagnol.html
  enseignant.html         → agenda enseignant collège-lycée (générique)
  anglais.html            → PAS ENCORE EN VENTE (tout en "Bientôt disponible")
```

Les URLs finales suivent le pattern : `https://www.la-trousse.fr/agendas/{slug}` (ex : `/agendas/svt`).
La page d'accueil est à la racine `https://www.la-trousse.fr/`.

## Design system (À RESPECTER STRICTEMENT)

- **Polices** : `Baloo 2` (titres, ronde/chaleureuse) + `Nunito Sans` (corps). Importées via Google Fonts.
- **Couleurs** :
  - `--navy: #1e2d5a` (bleu marine principal, couleur du logo)
  - `--navy2: #2a3d6f` (marine plus clair)
  - `--navy-ink: #16213f` (texte très foncé)
  - `--wash: #eff2f9` / `--wash2: #f6f8fc` (fonds bleutés pâles)
  - `--muted: #5f6c8a` / `--muted2: #94a0bd` (textes secondaires)
  - `--line: #e3e8f2` (filets)
  - Emphase titres : `#3d5fc4` (bleu plus vif pour les mots mis en valeur dans les H1)
- **Palette = bleu marine + blanc UNIQUEMENT.** Pas de crème, pas de vert-ardoise, pas de doré. Chaque page produit peut avoir une micro-touche d'accent matière, mais l'ossature reste marine/blanc.
- **Préfixe CSS** : pages produit = `lt-`, page d'accueil = `ltv-`. Ne jamais mélanger.
- **Formes** : coins très arrondis (12-20px), ombres douces (`rgba(30,45,90,...)`), style chaleureux.

## Logos (URLs)

- Logo navy (fond clair) : `https://images.pandagro-svt.fr/Images%20agendas%20la%20trousse/logo%20sans%20fond%20la%20trousse.png`
- Logo blanc (fond foncé) : `https://images.pandagro-svt.fr/Images%20agendas%20la%20trousse/logo%20blanc%20sans%20fond%20la%20trousse.png`
- Logo Bookmundo : `https://images.pandagro-svt.fr/Images%20agendas%20la%20trousse/Logo%20boomundo%20en%20250%20x%2050%20px%20sans%20fond%20(1).png`

## Images agendas (CDN Bunny)

Base : `https://pandagro.b-cdn.net/Images%20agendas%20la%20trousse/`
- SVT : `1 Agenda svt.png` → `18 Agenda svt.png` (18 couvertures) · panorama `Vue panorama Agenda SVT (1).png`
- PC : `Agenda PC 1.png` → `9` · panorama `Vue panarama agendas PC sans fond.png`
- Maths : `Agenda Maths 1.png` → `10` · panorama `Vue panorama agendas Maths sans fond.png`
- Français : `agenda Français 1.png` → `6` (encodage `Franc%CC%A7ais`) · panorama `Vue panarama agendas francais sans fond.png`
- HG : `agenda HG1.png` → `HG6.png` (6) · panorama `Vue panarama agendas HG sans fond.png`
- EPS : `Agenda EPS 1.png` → `6` · panorama `Vue panarama agendas EPS sans fond.png`
- Espagnol : `Agenda Espa 1.png` → `9` · panorama `Vue panarama agendas espagnol sans fond.png`
- Enseignant : `1 Agenda prof college lycee 3D.png` → `9` · panorama `Vue panarama agendas senseignants college lycee sans fond.png`
- Anglais : `Agenda Anglais 1.png` → `8` · panorama `Vue panarama agendas anglais sans fond.png`

## Liens Amazon série (bouton "Commander" principal)

Suffixe commun : `?binding=paperback&ref=dbs_dp_rwt_sb_pc_tpbk`
- Enseignant : `B0GX36QB7H`
- SVT : `B0H3WWSC29`
- HG : `B0H79CTW6W`
- Espagnol : `B0H7Z2R65D`
- Français : `B0H7Z1DN7Z`
- Maths : `B0H7Z6GX8G`
- EPS : `B0H7YZ9GYP`
- PC : `B0H7YRT9S9`
- Anglais : `B0H8FL21PL`

Bookmundo (boutique, toutes matières) : `https://publishnl.bookmundo.com/site/?r=userwebsite/index&id=agendaslatrousse`

## Règles de contenu (IMPORTANT)

1. **Pages** : 214 pour SVT, **208 pour toutes les autres matières**.
2. **Prix** : 11,55 € (sauf SVT qui n'affiche pas de prix fixe).
3. **"Imprimé en France" = Bookmundo UNIQUEMENT**, jamais Amazon. Ne jamais laisser une formulation qui laisse croire qu'Amazon imprime en France.
4. **Footer** (identique sur toutes les pages) : `Imprimé à la demande (pas de gâchis) et distribué via Amazon & Bookmundo.`
5. **SVT** : positionné "La Trousse × Pandagro" (Pandagro = caution d'expertise SVT, pas partenaire effacé). Garde le badge partenariat, la note 4,7★, le jeu de cartes SVT.
6. **Anglais** : désormais disponible sur Amazon (`B0H8FL21PL`). Couvertures et CTAs tous actifs.
7. **H1 format** : "L'agenda pour prof de/d'[matière] qui comprend **vraiment votre métier**" (jamais "L'agenda de [matière]" seul, ambigu).
8. **Titres SEO** : DOIVENT contenir "2026-2027" (mettre à jour chaque année dans le title ET la description).
9. **Listes à puces** : toujours alignées à gauche, jamais centrées.

## Composants partagés (présents sur les 9 pages produit)

- Barre unique sticky : logo + menu 9 matières (matière courante = `lt-active`) + bouton Commander
- Badge partenariat (hero) — spécifique SVT
- Sticker "🇫🇷 Imprimé en France" (drapeau CSS 3 bandes) dans le bloc Bookmundo
- Logo Bookmundo dans le bloc Bookmundo
- Lien FAQ cliquable vers Bookmundo
- FAQ avec mots-clés en gras
- Zoom loupe au survol des couvertures (desktop)

## ⚠️ Dette connue à corriger

- **Le souligné du H1 diffère** : la page d'accueil (`index.html`) a un souligné SVG manuscrit fin ; les 9 pages produit ont encore l'ancien surlignage bloc (`#dbe4f7`). À harmoniser.
- **La vidéo YouTube est celle de SVT (`-XqnB-BqzSk`) sur TOUTES les pages.** À remplacer par une vidéo par matière ou à retirer sur les pages non-SVT avant mise en ligne définitive.
- Contenu présumé (non validé par un prof) pour Maths, HG, EPS, Anglais — surtout EPS (cycles/séances/compétences).

## Conventions de travail

- Quand une modif concerne "toutes les pages", l'appliquer aux 10 fichiers de `pages/` de façon identique.
- Vérifier l'équilibre des accolades CSS après chaque modif (`{` == `}`).
- Ne jamais utiliser `abs()` en CSS (support navigateur insuffisant).
- Ne pas utiliser `localStorage`/`sessionStorage`.
- Tester le rendu responsive (breakpoints 900px et 560px sur l'accueil).

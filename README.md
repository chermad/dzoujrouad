🏍️ Blog Moto – Next.js & Firebase

Projet de blog dédié à l’univers de la moto, développé avec Next.js (App Router) et Firebase, incluant un espace administrateur, un éditeur de texte riche, et une gestion avancée des articles.

👉 Projet pédagogique sérieux, orienté bonnes pratiques front-end / back-end, avec une architecture proche d’un projet professionnel.

✨ Fonctionnalités principales
🌍 Côté public

Page d’accueil avec :

dernier article mis en avant

liste des articles récents

Lecture d’un article via son slug SEO

Contenu riche (HTML généré par Quill)

Images responsives

Support du texte LTR / RTL (français / arabe)

🔐 Authentification

Connexion via Firebase Authentication

Gestion des rôles avec Custom Claims

Accès administrateur sécurisé

🛠️ Espace administrateur

Création d’articles

Édition d’articles existants

Suppression d’articles

Gestion des utilisateurs et des rôles

Accès restreint aux admins uniquement

✍️ Éditeur de texte riche

Éditeur Quill natif (sans React-Quill)

Sauvegarde du contenu en HTML

Barre d’outils personnalisée :

gras, italique, souligné

titres

listes

alignement gauche / centre / droite

direction RTL / LTR

choix de polices

insertion d’images et vidéos

🧱 Stack technique

Next.js 15 (App Router)

TypeScript

Tailwind CSS

Firebase

Authentication

Firestore

Firebase Admin SDK

Quill (éditeur de texte riche natif)

Vercel (déploiement)

🧩 Architecture du projet (simplifiée)
app/
 ├─ page.tsx                # Page d’accueil
 ├─ posts/[slug]/page.tsx   # Lecture d’un article
 ├─ admin/
 │   ├─ page.tsx            # Dashboard admin
 │   ├─ new/page.tsx        # Création d’article
 │   ├─ edit/[slug]/page.tsx# Édition d’article
 │   └─ users/page.tsx      # Gestion des utilisateurs
components/
 ├─ AllPosts.tsx            # Liste des articles
 ├─ LatestPost.tsx          # Dernier article
 ├─ PostCard.tsx            # Carte article
 ├─ RichTextEditor.tsx      # Éditeur Quill
 ├─ SmartImage.tsx          # Gestion d’images custom
 └─ Header / Footer
lib/
 ├─ firebase.ts
 ├─ firestore.ts
 └─ firestore-admin.ts

🖼️ Gestion des images

Le projet utilise un composant personnalisé SmartImage :

Remplace next/image pour éviter :

la gestion stricte des domaines

les contraintes de sécurité trop lourdes

Basé sur une balise <img> HTML standard

Compatible responsive

Réutilisable dans d’autres projets

🔒 Sécurité

Accès admin protégé côté client et côté serveur

Vérification du rôle admin via Firebase Custom Claims

Routes sensibles inaccessibles sans autorisation

🚀 Déploiement

Déployé sur Vercel

Build strict avec next build

Vérifications TypeScript activées

Linting désactivé en production pour éviter les faux positifs

🎯 Objectifs pédagogiques

Comprendre l’architecture App Router de Next.js

Manipuler Firebase en contexte réel

Gérer l’authentification et les rôles

Implémenter un éditeur de texte riche

Apprendre à résoudre des bugs de build / SSR

Structurer un projet front-end proprement

📌 Notes

Le contenu des articles est stocké en HTML

Les extraits (excerpt) sont générés côté UI

Le projet est évolutif (tags, catégories, SEO avancé possibles)

👤 Auteur

Projet développé par CHERIF Mehdi (chermad@gmail.com)
Dans un objectif d’apprentissage avancé et de montée en compétences.
# Mon Blog Moto

Projet de blog développé avec **Next.js (App Router)**, **Firebase**, **Tailwind CSS**  
et un espace d’administration sécurisé pour la gestion des articles.

---

## 🚀 Stack technique

- **Next.js 15 (App Router)**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Firebase (Auth + Firestore)**
- **Quill (éditeur de texte riche natif)**

---

## ✍️ Éditeur de contenu (Quill)

Le projet utilise **Quill natif** pour l’édition de texte riche dans l’interface d’administration.

- Le contenu est stocké **au format HTML** dans Firestore
- Le rendu est identique côté admin et côté public
- Les articles doivent être créés ou édités via Quill pour garantir la compatibilité du format HTML

---

## ⚙️ Build & configuration

### Choix de la version de Next.js

Le projet utilise **Next.js 15.x** pour garantir une stabilité maximale en production.

> Next.js 16 a été testé, mais a provoqué des erreurs de build sur Vercel liées à :
> - Turbopack
> - Lightning CSS
> - l’import de feuilles CSS tierces (ex : Quill)

👉 **Next.js 15 utilise Webpack**, ce qui évite ces problèmes.

---

### ⚠️ À propos d’ESLint

ESLint est **désactivé lors du build de production**, mais :

- ✅ **ESLint reste actif en développement** (`next dev`)
- ✅ Les erreurs sont visibles dans l’éditeur (VS Code)
- ❌ ESLint ne bloque pas le build en production

Ce choix a été fait pour :
- éviter les blocages liés à des règles strictes
- permettre une mise en production stable
- prévoir un **nettoyage progressif du code**

👉 ESLint pourra être réactivé plus tard une fois le code harmonisé.

---

## 🌍 Déploiement

Le projet est déployé sur **Vercel**.

⚠️ Lors de changements importants (version de Next.js, moteur de build, cache CSS) :
- le **cache de build Vercel doit être vidé manuellement**

---

## 👤 Accès administrateur

- Authentification via Firebase
- Gestion des rôles avec **Custom Claims**
- Accès admin réservé aux utilisateurs avec le rôle `admin`

---

## ✅ État du projet

- Blog public : ✅ fonctionnel
- Interface admin : ✅ fonctionnelle
- Création / édition d’articles : ✅
- Déploiement Vercel : ✅ stable
Fin.

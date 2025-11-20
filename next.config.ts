/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour le compilateur (Next.js 13+, pour Turbopack/SWC)
  compiler: {
    // Par exemple, désactiver console.log en production
    // removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Configuration pour le composant Image
  images: {
    // Liste des domaines externes autorisés
    remotePatterns: [
      {
        protocol: 'https',
        // Domaine ajouté précédemment
        hostname: 'storage.canalblog.com', 
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        // NOUVEAU DOMAINE : images.pexels.com pour l'image qui cause l'erreur actuelle
        hostname: 'images.pexels.com', 
        port: '',
        pathname: '/**',
      },
      // Ajoutez ici d'autres domaines externes si vous en utilisez
    ],
  },
  
  // Si vous utilisez Turbopack, cette ligne peut être nécessaire, sinon elle est ignorée
  // experimental: {
  //   serverActions: true,
  // },
};

module.exports = nextConfig;
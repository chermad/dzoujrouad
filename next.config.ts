/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour le composant Next/Image
  images: {
    // Ajoutez ici le(s) domaine(s) à partir duquel (desquels) vous chargez vos images.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Gardé pour le futur
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Domaine principal de Firebase Storage
      },
      {
        protocol: 'https',
        // Domaine spécifique à votre bucket Firebase Storage
        hostname: 'blog-moto-dz.firebasestorage.app', 
      },
      // 🌟 NOUVEAU : Ajout du domaine Pexels pour l'image actuelle
      {
        protocol: 'https',
        hostname: 'images.pexels.com', 
      },
    ],
  },
};

module.exports = nextConfig;
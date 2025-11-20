// lib/firestore.ts

import { db, Timestamp } from './firebase';
// Import de 'where' est nécessaire pour la fonction getPostBySlug
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'; 

// Définition de l'interface pour un Article de Blog (basée sur votre structure Firestore)
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string; // Contenu complet de l'article
  createdAt: Timestamp; // Le type Timestamp de Firebase
  author: string;
  description: string;
  imageUrl: string;
  isPublished: boolean;
  tags: string[];
}

/**
 * Récupère le dernier article du blog depuis la collection 'Blog' de Firestore.
 * Cette fonction est appelée côté serveur (dans un Server Component).
 * @returns Le dernier article (Post) ou null.
 */
export async function getLatestPost(): Promise<Post | null> {
  try {
    const blogCollectionRef = collection(db, 'Blog'); 

    // Requête: trier par 'createdAt' (descendant) et limiter à 1
    const q = query(
      blogCollectionRef,
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();

      // Utilisation du type Post grâce à l'extension .ts
      return { 
        id: doc.id, 
        author: data.author,
        content: data.content,
        createdAt: data.createdAt,
        description: data.description,
        imageUrl: data.imageUrl,
        isPublished: data.isPublished,
        slug: data.slug,
        tags: data.tags,
        title: data.title,
      } as Post;
    } else {
      return null; // Aucun article trouvé
    }
  } catch (error) {
    // Loggez l'erreur pour le débogage côté serveur
    console.error("Erreur lors de la récupération du dernier article:", error);
    return null; 
  }
}

/**
 * Récupère un article par son slug.
 * @param slug Le slug de l'article à rechercher.
 * @returns L'article (Post) ou null.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
    try {
        const blogCollectionRef = collection(db, 'Blog'); 

        // Requête: filtrer par le champ 'slug' égal au slug fourni
        // NOTE: Firestore peut nécessiter un index pour cette requête de filtre (où)
        const q = query(
            blogCollectionRef,
            where('slug', '==', slug), // Filtrer par slug
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();

            return { 
                id: doc.id, 
                author: data.author,
                content: data.content,
                createdAt: data.createdAt,
                description: data.description,
                imageUrl: data.imageUrl,
                isPublished: data.isPublished,
                slug: data.slug,
                tags: data.tags,
                title: data.title,
            } as Post;
        } else {
            return null; // Aucun article trouvé
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'article avec slug ${slug}:`, error);
        return null; 
    }
}
export async function getAllPosts(): Promise<Post[]> {
  try {
    const blogCollectionRef = collection(db, 'Blog');

    const q = query(
      blogCollectionRef,
      orderBy('createdAt', 'desc') // du plus récent au plus ancien
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Post, "id">),
    }));
  } catch (error) {
    console.error("Erreur getAllPosts:", error);
    return [];
  }
}

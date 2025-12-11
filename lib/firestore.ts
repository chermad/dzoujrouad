import { db, Timestamp } from './firebase';
import { collection, query, orderBy, limit, getDocs, where, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

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

/**
 * Récupère tous les articles du blog depuis la collection 'Blog' de Firestore.
 * @returns La liste des articles (Post[]).
 */
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

/**
 * Supprime un article de la collection 'Blog' en utilisant son ID.
 * @param postId L'ID de l'article à supprimer.
 */
export async function deletePost(postId: string): Promise<void> {
  try {
    const postRef = doc(db, 'Blog', postId);
    await deleteDoc(postRef);
    console.log(`Article ${postId} supprimé avec succès.`);
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'article ${postId}:`, error);
    throw new Error("La suppression a échoué.");
  }
}

/**
 * Met à jour un article existant dans la collection 'Blog'.
 * @param postId L'ID de l'article à mettre à jour.
 * @param updatedPost Les nouvelles données de l'article à enregistrer.
 */
export async function updatePost(postId: string, updatedPost: Omit<Post, 'id'>): Promise<void> {
  try {
    const postRef = doc(db, 'Blog', postId);
    await updateDoc(postRef, updatedPost);
    console.log(`Article ${postId} mis à jour avec succès.`);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'article ${postId}:`, error);
    throw new Error("La mise à jour a échoué.");
  }
}

/**
 * Ajoute un nouveau article dans la collection 'Blog'.
 * @param newPost Les données du nouvel article à ajouter.
 * @returns L'ID du nouvel article ajouté.
 */
export async function addNewPost(newPost: Omit<Post, 'id'>): Promise<string> {
  try {
    const blogCollectionRef = collection(db, 'Blog');

    // Ajout d'un nouveau document dans Firestore
    const docRef = await addDoc(blogCollectionRef, {
      ...newPost,
      createdAt: Timestamp.now(), // Ajouter la date de création
    });

    console.log(`Article ajouté avec succès : ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de l'ajout du nouvel article:", error);
    throw new Error("L'ajout a échoué.");
  }
}

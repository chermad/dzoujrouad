// lib/firestore-admin.ts
// Fichier pour les opérations d'administration (création, modification, suppression)

import { db } from '@/lib/firebase'; // Correction: supprimez le 'Post' de cet import
import {
  collection,
  doc,
  deleteDoc, // Correction: deleteDoc (pas deleteor--)
  updateDoc,
  addDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { Post } from '@/lib/firestore'; // Correction: importez Post depuis firestore.ts

// Supprimer un article
export async function deletePost(postId: string): Promise<boolean> {
  try {
    const postRef = doc(db, 'Blog', postId);
    await deleteDoc(postRef);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return false;
  }
}

// Mettre à jour un article
export async function updatePost(postId: string, data: Partial<Post>): Promise<boolean> {
  try {
    const postRef = doc(db, 'Blog', postId);
    await updateDoc(postRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return false;
  }
}

// Créer un nouvel article
export async function createPost(data: Omit<Post, 'id' | 'createdAt'>): Promise<string | null> {
  try {
    const blogCollectionRef = collection(db, 'Blog');
    const docRef = await addDoc(blogCollectionRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    return null;
  }
}

// Obtenir un article par ID (pour l'édition)
export async function getPostById(postId: string): Promise<Post | null> {
  try {
    const postRef = doc(db, 'Blog', postId);
    const docSnap = await getDoc(postRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        author: data.author || '',
        content: data.content || '',
        createdAt: data.createdAt || serverTimestamp(),
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        isPublished: data.isPublished || false,
        slug: data.slug || '',
        tags: data.tags || [],
        title: data.title || '',
      } as Post;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    return null;
  }
}
'use client';
import LoginModal from "@/components/LoginModal";

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase"; // Importation de Firebase Auth
import { signOut, onAuthStateChanged, User } from "firebase/auth";

export default function Header() {
  const [user, setUser] = useState<User | null>(null); // Suivi de l'utilisateur connecté
  const [isModalOpen, setIsModalOpen] = useState(false); // État pour la modal
  const [avatar, setAvatar] = useState<string>("/default-avatar.png"); // Toujours initialiser avec l'avatar par défaut
  const [displayName, setDisplayName] = useState<string | null>("");

  // Suivi de l'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName); // Stocker le nom d'utilisateur (si disponible)
        // Vérifier que photoURL est valide avant de l'utiliser
        if (currentUser.photoURL && isValidUrl(currentUser.photoURL)) {
          setAvatar(currentUser.photoURL);
        } else {
          setAvatar("/default-avatar.png");
        }
      } else {
        setUser(null);
        setAvatar("/default-avatar.png");
        setDisplayName(null); // Réinitialiser le nom de l'utilisateur
      }
    });
    return unsubscribe;
  }, []);

  // Fonction pour valider l'URL
  const isValidUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (e) {
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <header className="bg-slate-900 shadow-md border-b border-slate-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-extrabold text-white hover:text-blue-400 transition duration-150">
          Mon Blog Moto
        </Link>
        <div className="space-x-4 flex items-center">
          <Link href="/" className="text-gray-300 hover:text-blue-400 font-medium transition duration-150">
            Accueil
          </Link>
          <Link href="/admin" className="text-blue-400 hover:text-blue-300 font-medium border border-blue-400 px-3 py-1 rounded-md transition duration-150">
            Admin
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-3">
              <img 
                src={avatar} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full" 
                onError={(e) => {
                  // Simplement remplacer par l'avatar par défaut une seule fois
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
              {/* Affichage du nom ou de l'email de l'utilisateur */}
              <div className="text-white flex flex-col">
                {/* Affiche le nom si connecté via Google, sinon l'email */}
                <span>{displayName || user.email}</span>
              </div>
              <button onClick={handleLogout} className="text-gray-300 hover:text-blue-400 font-medium">
                Déconnexion
              </button>
            </div>
          ) : (
            <button onClick={openModal} className="text-gray-300 hover:text-blue-400 font-medium transition duration-150">
              Connexion
            </button>
          )}
        </div>
      </nav>

      {isModalOpen && <LoginModal closeModal={closeModal} />}
    </header>
  );
}

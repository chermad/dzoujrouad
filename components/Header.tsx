'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase"; // Importation de Firebase Auth
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import LoginModal from "@/components/LoginModal";  // Importation de la modal de connexion

export default function Header() {
  const [user, setUser] = useState<User | null>(null); // Suivi de l'utilisateur connecté
  const [isModalOpen, setIsModalOpen] = useState(false); // État pour la modal
  const [avatar, setAvatar] = useState<string>("/default-avatar.png"); // Toujours initialiser avec l'avatar par défaut
  const [email, setEmail] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false); // Nouvel état pour vérifier si l'utilisateur est admin

  // Suivi de l'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email || ""); // Stocker l'email de l'utilisateur
        // Vérifier que photoURL est valide avant de l'utiliser
        if (currentUser.photoURL && isValidUrl(currentUser.photoURL)) {
          setAvatar(currentUser.photoURL);
        } else {
          setAvatar("/default-avatar.png");
        }

        // Vérifier si l'utilisateur est un admin
        currentUser.getIdTokenResult().then((idTokenResult) => {
          if (idTokenResult.claims.role === 'admin') {
            setIsAdmin(true);
          }
        }).catch((error) => {
          console.error("Erreur lors de la récupération des claims : ", error);
        });

      } else {
        setUser(null);
        setAvatar("/default-avatar.png");
        setEmail(""); // Réinitialiser l'email à la déconnexion
        setIsAdmin(false); // Réinitialiser l'état d'admin
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

          {/* Afficher le bouton "Admin" seulement si l'utilisateur est admin */}
          {isAdmin && (
            <Link href="/admin" className="text-blue-400 hover:text-blue-300 font-medium border border-blue-400 px-3 py-1 rounded-md transition duration-150">
              Admin
            </Link>
          )}
          
          {user ? (
            <div className="flex flex-col sm:flex-row items-center sm:space-x-3 space-y-3 sm:space-y-0">
              <img 
                src={avatar} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full" 
                onError={(e) => {
                  // Simplement remplacer par l'avatar par défaut une seule fois
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
              <div className="text-white flex flex-col items-center sm:items-start">
                <span>{user.displayName || email}</span>
                {/* Afficher l'icône 🔑 si l'utilisateur est un admin */}
                {isAdmin && (
                  <span className="text-yellow-500 ml-2">🔑</span>  // Icône clé pour admin
                )}
              </div>

              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-blue-400 font-medium sm:px-4 px-2 py-1 rounded-md bg-blue-500 text-white w-full sm:w-auto"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <button
              onClick={openModal}
              className="text-gray-300 hover:text-blue-400 font-medium sm:px-4 px-2 py-1 rounded-md bg-blue-500 text-white w-full sm:w-auto"
            >
              Connexion
            </button>
          )}
        </div>
      </nav>

      {isModalOpen && <LoginModal closeModal={closeModal} />}
    </header>
  );
}

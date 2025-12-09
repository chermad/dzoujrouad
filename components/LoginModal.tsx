// components/LoginModal.tsx
'use client';

import { useState } from "react";
import { auth } from "@/lib/firebase"; // Importation de Firebase pour la gestion de l'authentification
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

interface LoginModalProps {
  closeModal: () => void; // Fonction pour fermer la modal
}

export default function LoginModal({ closeModal }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true); // Gère si on est en mode connexion ou inscription
  const [email, setEmail] = useState(""); // Email de l'utilisateur
  const [password, setPassword] = useState(""); // Mot de passe de l'utilisateur
  const [error, setError] = useState(""); // Message d'erreur

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      closeModal(); // Ferme la modal après la connexion
    } catch (err) {
      console.error("Erreur lors de la connexion avec Google : ", err);
    }
  };

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      closeModal(); // Ferme la modal après la connexion
    } catch (err) {
      setError("Erreur de connexion : Vérifiez vos identifiants.");
    }
  };

  const handleEmailSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      closeModal(); // Ferme la modal après la création du compte
    } catch (err) {
      setError("Erreur de création de compte : Veuillez vérifier vos informations.");
    }
  };

  return (
    <div 
      className="fixed inset-0 flex justify-center items-center z-50" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} // Utilisation de rgba pour un fond noir semi-transparent
    >
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold text-center">{isLogin ? "Se connecter" : "Créer un compte"}</h2>
        <form className="mt-4">
          <div>
            <label htmlFor="email" className="block text-sm">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </div>
          <div className="mt-2">
            <label htmlFor="password" className="block text-sm">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="mt-4">
            {isLogin ? (
              <button
                type="button"
                onClick={handleEmailLogin}
                className="w-full bg-blue-500 text-white py-2 rounded"
              >
                Connexion
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEmailSignUp}
                className="w-full bg-green-500 text-white py-2 rounded"
              >
                Créer un compte
              </button>
            )}
          </div>
        </form>

        <div className="flex justify-center mt-4">
          <button
            onClick={handleGoogleLogin}
            className="bg-red-500 text-white py-2 px-4 rounded"
          >
            Se connecter avec Google
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 text-sm"
          >
            {isLogin ? "Créer un compte ?" : "Déjà un compte ?"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button onClick={closeModal} className="text-gray-500">Fermer</button>
        </div>
      </div>
    </div>
  );
}

// app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Importation de la police Inter
import './globals.css'; // Importe le CSS global
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Initialisation de la police
const inter = Inter({ subsets: ['latin'] });

// Métadonnées de l'application
export const metadata: Metadata = {
  title: 'Mon Blog Next.js & Firebase',
  description: 'Un blog construit pas à pas avec Next.js, Tailwind, et Firebase.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Cette classe assure le fond sombre pour le <body> et corrige l'erreur d'hydratation.
  const bodyClasses = `${inter.className} bg-slate-900 text-gray-100 min-h-screen flex flex-col`;

  return (
    <html lang="fr">
      <body className={bodyClasses}>
        
        <Header />
        
        {/* CORRECTION: Ajout de bg-slate-900 à l'élément <main> pour garantir que le fond de la zone de contenu est sombre. */}
        <main className="flex-grow bg-slate-900"> 
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
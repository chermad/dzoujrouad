// components/Header.tsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-slate-900 shadow-md border-b border-slate-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        
        {/* Logo/Titre du Blog */}
        <Link href="/" className="text-3xl font-extrabold text-white hover:text-blue-400 transition duration-150">
          Mon Blog Moto
        </Link>

        {/* Liens de Navigation */}
        <div className="space-x-4">
          <Link href="/" className="text-gray-300 hover:text-blue-400 font-medium transition duration-150">
            Accueil
          </Link>
          {/* Lien Admin */}
          <Link href="/admin" className="text-blue-400 hover:text-blue-300 font-medium border border-blue-400 px-3 py-1 rounded-md transition duration-150">
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}
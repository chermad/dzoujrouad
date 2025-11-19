// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} Mon Blog JS. Tous droits réservés.
        </p>
        <p className="mt-1">
          Projet d'apprentissage Next.js et Firebase.
        </p>
      </div>
    </footer>
  );
}
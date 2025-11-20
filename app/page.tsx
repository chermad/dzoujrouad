// app/page.tsx

// 1. Importez le composant qui va chercher les données dans Firebase
import LatestPost from '@/components/LatestPost';
export const revalidate = 60; 
export default function Home() {
  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <header className="text-center mb-12">
        <h1 className="text-6xl font-extrabold text-white tracking-tight">
          Mon Blog Moto
        </h1>
        <p className="text-xl text-gray-400 mt-3">
          Le dernier article est chargé dynamiquement ci-dessous.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-4xl font-bold text-gray-200 mb-6 text-center">
          Dernier Article publié.
        </h2>
        
        {/* CORRECTION : Remplacement du code statique par l'appel au composant asynchrone */}
        <LatestPost />

      </section>
    </div>
  );
}
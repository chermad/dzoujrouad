import LatestPost from "@/components/LatestPost";
import AllPosts from "@/components/AllPosts";

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

      {/* Dernier article */}
      <section className="mt-10">
        <h2 className="text-4xl font-bold text-gray-200 mb-6 text-center">
          Dernier Article publié
        </h2>

        <LatestPost />
      </section>

      {/* Tous les articles */}
      <section className="mt-20">
        <h2 className="text-3xl font-bold text-gray-200 mb-6">
          Tous les articles
        </h2>

        <AllPosts />
      </section>

    </div>
  );
}

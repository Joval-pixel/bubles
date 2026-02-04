export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900">
        Curso ChatGPT Iniciante 🚀
      </h1>

      <p className="mt-6 text-lg text-center text-gray-600 max-w-2xl">
        Aprenda a usar o ChatGPT do zero até aplicações práticas para ganhar
        produtividade, criar conteúdos e gerar renda com Inteligência Artificial.
      </p>

      <div className="mt-8 flex gap-4">
        <a
          href="#"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          Quero aprender agora
        </a>

        <a
          href="#"
          className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
        >
          Ver conteúdo
        </a>
      </div>
    </main>
  );
}

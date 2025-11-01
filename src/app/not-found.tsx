import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-gray-500">The page you are looking for does not exist.</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">Go back home</Link>
      </div>
    </main>
  );
}



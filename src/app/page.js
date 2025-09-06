"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    return (
      <main className="h-screen flex items-center justify-center">
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Login with Google
        </button>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col items-center justify-center gap-4">
      <img
        src={session.user.image}
        alt="profile"
        className="w-12 h-12 rounded-full"
      />
      <p>Welcome, {session.user.name}</p>
      <p>{session.user.email}</p>

      {/* tombol ke chat */}
      <button
        onClick={() => router.push("/chat")}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Go to Chat
      </button>
      {/* tombol ke viewer */}
      <button
        onClick={() => router.push("/viewer")}
        className="px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        Go to viewer
      </button>

      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-red-500 text-white rounded-lg"
      >
        Logout
      </button>
    </main>
  );
}

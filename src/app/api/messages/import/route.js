import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const messages = await req.json();
    if (!Array.isArray(messages)) {
      return Response.json({ error: "Invalid data" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "chit-chat-v2");

    const docs = messages.map((m) => ({
      ...m,
      userEmail: session.user.email,
      createdAt: new Date(),
    }));

    await db.collection("messages").insertMany(docs);

    return Response.json({ inserted: docs.length });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Database error" }, { status: 500 });
  }
}

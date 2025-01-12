import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client"; // Import Prisma for QueryMode

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q")?.trim();
    const where = search
      ? {
          OR: [
            {
              originalName: {
                contains: search,
                mode: Prisma.QueryMode.insensitive, // Use the QueryMode enum
              },
            },
            {
              content: {
                contains: search,
                mode: Prisma.QueryMode.insensitive, // Use the QueryMode enum
              },
            },
          ],
        }
      : {};

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        originalName: true,
        status: true,
        createdAt: true,
        content: true,
        error: true,
      },
    });
    return NextResponse.json(documents || []);
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error: ", error.stack);
    }
    return NextResponse.json(
      { error: "Something went wrong while fetching documents." },
      { status: 500 }
    );
  }
}

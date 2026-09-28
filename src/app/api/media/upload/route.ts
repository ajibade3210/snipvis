import { handleApiError } from "@/lib/api-error";
import { uploadBuffer } from "@/lib/storage";
import { mediaFolderCategoryEnum } from "@/lib/validations";
import type { MediaFolderCategory } from "@/types";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = [
      ...formData.getAll("files"),
      ...formData.getAll("file"),
    ].filter((item): item is File => item instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No valid file(s) provided in 'file' or 'files' fields" },
        { status: 400 },
      );
    }

    const projectId = formData.get("projectId");
    const userId = formData.get("userId");
    const rawCategory = formData.get("category");

    let category: MediaFolderCategory | undefined;
    if (typeof rawCategory === "string") {
      const categoryParsed = mediaFolderCategoryEnum.safeParse(rawCategory);
      if (categoryParsed.success) {
        category = categoryParsed.data;
      }
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return uploadBuffer({
          buffer,
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          size: file.size,
          projectId: typeof projectId === "string" ? projectId : undefined,
          userId: typeof userId === "string" ? userId : undefined,
          category,
        });
      }),
    );

    if (results.length === 1 && !formData.has("files")) {
      return NextResponse.json(
        {
          ...results[0],
          results,
        },
        { status: 201 },
      );
    }

    return NextResponse.json({ results }, { status: 201 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

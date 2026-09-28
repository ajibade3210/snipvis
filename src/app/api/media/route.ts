import { handleApiError } from "@/lib/api-error";
import { requireUser } from "@/lib/session";
import {
  deleteObject,
  getPresignedUploadUrl,
  sanitizePathSegment,
} from "@/lib/storage";
import {
  deleteMediaRequestSchema,
  unifiedPresignedRequestSchema,
} from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const validated = unifiedPresignedRequestSchema.parse(body);

    if ("files" in validated) {
      const items = await Promise.all(
        validated.files.map((fileReq) =>
          getPresignedUploadUrl({ ...fileReq, userId: user.id }),
        ),
      );
      return NextResponse.json({ items }, { status: 200 });
    }

    const result = await getPresignedUploadUrl({
      ...validated,
      userId: user.id,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    const urlKey = req.nextUrl
      ? req.nextUrl.searchParams.get("key")
      : new URL(req.url).searchParams.get("key");
    let key: string;

    if (urlKey) {
      key = deleteMediaRequestSchema.parse({ key: urlKey }).key;
    } else {
      const body = await req.json().catch(() => ({}));
      key = deleteMediaRequestSchema.parse(body).key;
    }

    // Verify key ownership by inspecting the user segment
    const segments = key.split("/");
    const expectedUserSegment = sanitizePathSegment(user.id, "");
    if (segments.length >= 2 && segments[1] !== expectedUserSegment) {
      return NextResponse.json(
        {
          error: "Unauthorized: cannot delete media belonging to another user",
        },
        { status: 403 },
      );
    }

    const result = await deleteObject(key);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

import { handleApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createInspirationSchema } from "@/lib/validations";
import type { Inspiration, InspirationType } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

function formatInspirationPayload(insp: Inspiration) {
  return {
    ...insp,
    hook_type: insp.hookType,
    hook_formula: insp.hookFormula,
    triggered_emotion: insp.triggeredEmotion,
    strength_score: insp.strengthScore,
    score_reason: insp.scoreReason,
    improvements: insp.improvements,
    title_variants: insp.titleVariants,
    recreation_ideas: insp.recreationIdeas,
    risk_flags: insp.riskFlags,
  };
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const typeParam = searchParams.get("type");
    const type =
      typeParam && ["THUMBNAIL", "TITLE", "HOOK"].includes(typeParam)
        ? (typeParam as InspirationType)
        : undefined;
    const favorite = searchParams.get("favorite");

    if (projectId) {
      // Ensure the project belongs to the authenticated user
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId: user.id },
      });
      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 },
        );
      }

      const links = await prisma.projectInspiration.findMany({
        where: {
          projectId,
          project: { userId: user.id },
          ...(favorite === "true" ? { favorite: true } : {}),
          ...(type ? { inspiration: { type } } : {}),
        },
        include: { inspiration: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(
        links.map((l) => ({
          ...formatInspirationPayload(l.inspiration),
          projectContext: {
            projectId: l.projectId,
            note: l.note,
            favorite: l.favorite,
          },
        })),
      );
    }

    const inspirations = await prisma.inspiration.findMany({
      where: {
        userId: user.id,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(inspirations.map(formatInspirationPayload));
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data = createInspirationSchema.parse(body);

    // If projects are specified, verify they belong to user
    if (data.projects && data.projects.length > 0) {
      const projectIds = data.projects.map((p) => p.projectId);
      const userProjects = await prisma.project.findMany({
        where: {
          id: { in: projectIds },
          userId: user.id,
        },
        select: { id: true },
      });
      const validProjectIds = new Set(userProjects.map((p) => p.id));
      const invalidProjects = projectIds.filter(
        (id) => !validProjectIds.has(id),
      );
      if (invalidProjects.length > 0) {
        return NextResponse.json(
          {
            error:
              "One or more target projects do not exist or are unauthorized",
          },
          { status: 403 },
        );
      }
    }

    const inspiration = await prisma.inspiration.create({
      data: {
        thumbnailUrl: data.thumbnailUrl,
        title: data.title,
        hook: data.hook,
        channelName: data.channelName,
        views: data.views,
        sourceUrl: data.sourceUrl,
        type: data.type as InspirationType,
        note: data.note,
        hookType: data.hook_type || data.hookType,
        hookFormula: data.hook_formula || data.hookFormula,
        triggeredEmotion: data.triggered_emotion || data.triggeredEmotion,
        strengthScore: data.strength_score ?? data.strengthScore,
        scoreReason: data.score_reason || data.scoreReason,
        improvements: data.improvements || [],
        titleVariants: data.title_variants || data.titleVariants || [],
        recreationIdeas: data.recreation_ideas || data.recreationIdeas || [],
        riskFlags: data.risk_flags || data.riskFlags || [],
        userId: user.id,
        projects: data.projects?.length
          ? {
              create: data.projects.map((p) => ({
                projectId: p.projectId,
                note: p.note,
                favorite: p.favorite ?? false,
              })),
            }
          : undefined,
      },
    });
    return NextResponse.json(formatInspirationPayload(inspiration), {
      status: 201,
    });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

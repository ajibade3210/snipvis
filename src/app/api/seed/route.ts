import { cacheStore } from "@/lib/cache";
import { CACHE_KEYS, DEFAULT_PROJECT_SCRIPTS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req?: Request) {
  const url = req ? new URL(req.url) : null;
  const force = url?.searchParams.get("force") === "true";

  // 1. Upsert Core Creator Projects and ensure scripts exist
  const p1 = await prisma.project.upsert({
    where: { slug: "mrbeast-teardown" },
    update: {
      script: DEFAULT_PROJECT_SCRIPTS["mrbeast-teardown"],
      ...(force
        ? {
            name: "MrBeast Teardown",
            channel: "MrBeast",
            hook: "In the next 7 minutes, I will test if anyone can survive 100 hours in an impenetrable vault...",
            scriptLink: "https://docs.google.com",
          }
        : {}),
    },
    create: {
      name: "MrBeast Teardown",
      slug: "mrbeast-teardown",
      channel: "MrBeast",
      hook: "In the next 7 minutes, I will test if anyone can survive 100 hours in an impenetrable vault...",
      scriptLink: "https://docs.google.com",
      script: DEFAULT_PROJECT_SCRIPTS["mrbeast-teardown"],
    },
  });

  const p2 = await prisma.project.upsert({
    where: { slug: "tech-essay-2026" },
    update: {
      script: DEFAULT_PROJECT_SCRIPTS["tech-essay-2026"],
      ...(force
        ? {
            name: "Tech Essay 2026",
            channel: "TechCraft",
            hook: "Every major tech company is hiding the exact same secret about their 2026 releases...",
            scriptLink: "https://notion.so",
          }
        : {}),
    },
    create: {
      name: "Tech Essay 2026",
      slug: "tech-essay-2026",
      channel: "TechCraft",
      hook: "Every major tech company is hiding the exact same secret about their 2026 releases...",
      scriptLink: "https://notion.so",
      script: DEFAULT_PROJECT_SCRIPTS["tech-essay-2026"],
    },
  });

  const p3 = await prisma.project.upsert({
    where: { slug: "finance-hooks" },
    update: {
      script: DEFAULT_PROJECT_SCRIPTS["finance-hooks"],
      ...(force
        ? {
            name: "Finance Hooks",
            channel: "BrainWave",
            hook: "Why 84% of high earners are secretly planning to quit before the end of the quarter...",
            scriptLink: "https://docs.google.com",
          }
        : {}),
    },
    create: {
      name: "Finance Hooks",
      slug: "finance-hooks",
      channel: "BrainWave",
      hook: "Why 84% of high earners are secretly planning to quit before the end of the quarter...",
      scriptLink: "https://docs.google.com",
      script: DEFAULT_PROJECT_SCRIPTS["finance-hooks"],
    },
  });

  const p4 = await prisma.project.upsert({
    where: { slug: "storytelling-formats" },
    update: {
      script: DEFAULT_PROJECT_SCRIPTS["storytelling-formats"],
      ...(force
        ? {
            name: "Storytelling Formats",
            channel: "DeepDiveDoc",
            hook: "The moment the federal agents entered the penthouse, they discovered 12 empty hard drives...",
            scriptLink: "https://figma.com",
          }
        : {}),
    },
    create: {
      name: "Storytelling Formats",
      slug: "storytelling-formats",
      channel: "DeepDiveDoc",
      hook: "The moment the federal agents entered the penthouse, they discovered 12 empty hard drives...",
      scriptLink: "https://figma.com",
      script: DEFAULT_PROJECT_SCRIPTS["storytelling-formats"],
    },
  });

  // 2. Create Initial Real Research Inspirations if empty or force
  const inspirationCount = await prisma.inspiration.count();
  const createdInspirationIds: string[] = [];

  if (inspirationCount === 0 || force) {
    const insp1 = await prisma.inspiration.create({
      data: {
        thumbnailUrl:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
        title: "I Built a $100,000 Secret Gaming Bunker Under My Backyard",
        type: "THUMBNAIL",
        channelName: "TechCraft",
        views: "5.8M views",
        sourceUrl: "https://youtube.com",
        note: "Focus on the dramatic ambient rim lighting in thumbnail.",
        projects: {
          create: [
            {
              projectId: p1.id,
              note: "Key reference for bunker lighting",
              favorite: true,
            },
          ],
        },
      },
    });

    const insp2 = await prisma.inspiration.create({
      data: {
        thumbnailUrl:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
        title: "Why Everyone Is Suddenly Quitting Their 9-to-5 In 2026",
        type: "TITLE",
        channelName: "BrainWave",
        views: "2.1M views",
        sourceUrl: "https://youtube.com",
        note: "Desaturated background makes red coffee mug pop 3x better.",
        projects: {
          create: [
            {
              projectId: p3.id,
              note: "A/B title split test winner",
              favorite: true,
            },
          ],
        },
      },
    });

    const insp3 = await prisma.inspiration.create({
      data: {
        thumbnailUrl:
          "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
        title: "The Rise and Fall of the World's Biggest Crypto Empire",
        type: "HOOK",
        hook: "The moment federal agents entered the penthouse, they discovered 12 empty hard drives and a plane ticket to Dubai booked 40 minutes earlier.",
        channelName: "DeepDiveDoc",
        views: "4.8M / 48h",
        sourceUrl: "https://youtube.com",
        note: "Starts immediately at the FBI arrest before cutting back to origin.",
        projects: {
          create: [
            {
              projectId: p4.id,
              note: "Pacing blueprint: 0:00 - 0:25 hook",
              favorite: true,
            },
          ],
        },
      },
    });

    const insp4 = await prisma.inspiration.create({
      data: {
        thumbnailUrl:
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
        title: "Surviving 7 Days In An Abandoned High Security Prison",
        type: "HOOK",
        hook: "I locked myself in cell block 4 with zero food, zero contact, and 3 motion sensors that trigger an alarm every time I fall asleep.",
        channelName: "AlexVlogs",
        views: "9.4M views",
        sourceUrl: "https://youtube.com",
        note: "High saturation green night vision tint created massive thumbnail contrast.",
        projects: {
          create: [
            {
              projectId: p1.id,
              note: "Viral outlier reference",
              favorite: false,
            },
          ],
        },
      },
    });

    // 3. Create Sample Asset
    await prisma.asset.create({
      data: {
        url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
        type: "IMAGE",
        source: "PEXELS",
        licenseText: "Free for commercial use with attribution",
        note: "Background textures for motion graphic transitions",
        projects: {
          create: [{ projectId: p1.id }],
        },
      },
    });

    createdInspirationIds.push(insp1.id, insp2.id, insp3.id, insp4.id);
  }

  await cacheStore.del(CACHE_KEYS.PROJECTS_LIST);

  return NextResponse.json({
    success: true,
    message: "Projects and seed scripts synced successfully",
    projects: [p1.id, p2.id, p3.id, p4.id],
    inspirations: createdInspirationIds,
  });
}

export async function GET(req: Request) {
  return POST(req);
}

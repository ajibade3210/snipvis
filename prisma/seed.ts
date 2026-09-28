import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const initialProjects = [
  {
    name: "Storytelling Formats",
    slug: "storytelling-formats",
    emoji: "🎬",
    channel: "DeepDiveDoc",
    hook: "The moment the federal agents entered the penthouse, they discovered 12 empty hard drives...",
    scriptLink: "https://figma.com",
    script: `<h2>Act 1: The Cold Open (0:00 - 1:15)</h2>
<p><strong>[VISUAL: FAST CAMERA ZOOM-IN]</strong></p>
<p>The moment the federal agents entered the penthouse, they discovered 12 empty hard drives humming on the kitchen counter.</p>
<p>No passports. No cash. Just a single sticky note on the monitor that read: <em>"You're 20 minutes too late."</em></p>
<blockquote>"In investigative documentary storytelling, you never start with who the person is. You start with the catastrophe they left behind."</blockquote>
<h3>Key Production Beats:</h3>
<ul>
  <li><strong>Pacing:</strong> 120-140 words per minute during the hook; slow down to 90 wpm for document reveal.</li>
  <li><strong>Sound Design:</strong> Sub-bass riser at 0:14, tape-stop effect at 0:28.</li>
  <li><strong>B-Roll Overlay:</strong> Macro lens scanning hard drive LED indicators.</li>
</ul>
<h2>Act 2: The Flashback & Context (1:15 - 4:30)</h2>
<p>To understand how an ordinary programmer built an offshore empire in under 400 days, we have to rewind to an unlisted GitHub repository published in November 2023.</p>`,
  },
  {
    name: "MrBeast Teardown",
    slug: "mrbeast-teardown",
    emoji: "💰",
    channel: "MrBeast",
    hook: "In the next 7 minutes, I will test if anyone can survive 100 hours in an impenetrable vault...",
    scriptLink: "https://docs.google.com",
    script: `<h2>Introduction: The 5-Second Retention Crucible</h2>
<p>In the next 7 minutes, I will test if anyone can survive 100 hours in an impenetrable vault...</p>
<p>Notice how MrBeast introduces the stakes in under 3.2 seconds without any channel intro bumper.</p>
<h3>Retention Multiplier Formula:</h3>
<ol>
  <li>Extreme physical limitation or financial bounty</li>
  <li>Immediate visualization of the antagonist force</li>
  <li>Progress bar / ticking timer visual in top right corner</li>
</ol>
<h2>Core Escalation Loop:</h2>
<p>Every 45 seconds, inject a micro-challenge or obstacle to prevent audience cognitive drop-off.</p>`,
  },
  {
    name: "Tech Essay 2026",
    slug: "tech-essay-2026",
    emoji: "⚡",
    channel: "TechCraft",
    hook: "Every major tech company is hiding the exact same secret about their 2026 releases...",
    scriptLink: "https://notion.so",
    script: `<h2>Section 1: The Silicon Plateau</h2>
<p>Every major tech company is hiding the exact same secret about their 2026 releases: raw compute scaling has hit the thermal wall.</p>
<p>Here is what happens when silicon manufacturers can no longer shrink transistors:</p>
<ul>
  <li>Chiplet architecture packaging costs 3x more</li>
  <li>Software optimization becomes the primary competitive moat</li>
</ul>
<blockquote>"When hardware plateaus, form factors and local AI models become the only battleground."</blockquote>`,
  },
  {
    name: "Finance Hooks",
    slug: "finance-hooks",
    emoji: "🔥",
    channel: "BrainWave",
    hook: "Why 84% of high earners are secretly planning to quit before the end of the quarter...",
    scriptLink: "https://docs.google.com",
    script: `<h2>The Anomaly: Why High Earners Disappear</h2>
<p>Why 84% of high earners are secretly planning to quit before the end of the quarter...</p>
<blockquote>"Wealth isn't what you spend on display; it is the options you possess when nobody is watching."</blockquote>
<p>Let's dismantle the psychological shift from prestige income to sovereign autonomy.</p>
<h3>Discussion Anchors:</h3>
<ul>
  <li>The Golden Handcuffs inflection curve</li>
  <li>Asymmetric downside of corporate reliance</li>
</ul>`,
  },
];

export async function seedUsers() {
  console.info("👤 Seeding authenticated users...");

  const demoPassword =
    process.env.DEMO_USER_PASSWORD ||
    process.env.DEMO_PASSWORD ||
    "@Snipvis";
  const demoPasswordHash = await bcrypt.hash(demoPassword, 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@choicegrid.app" },
    update: {
      name: "Demo Creator",
      passwordHash: demoPasswordHash,
    },
    create: {
      email: "demo@choicegrid.app",
      name: "Demo Creator",
      passwordHash: demoPasswordHash,
    },
  });

  const emptyPassword = process.env.DEMO_USER_PASSWORD || "SnipVisUser2026!";
  const emptyPasswordHash = await bcrypt.hash(emptyPassword, 12);

  await prisma.user.upsert({
    where: { email: "holaszyd1@gmail.com" },
    update: {
      name: "Hola Szyd",
      passwordHash: emptyPasswordHash,
    },
    create: {
      email: "holaszyd1@gmail.com",
      name: "Hola Szyd",
      passwordHash: emptyPasswordHash,
    },
  });

  console.info("✓ Seeded demo user (demo@choicegrid.app) and empty user (holaszyd1@gmail.com)");
  return demoUser;
}

export async function seedProjects(demoUserId: string) {
  console.info("📦 Seeding channels and projects for demo user...");

  const defaultChannels = [
    { name: "DeepDiveDoc", link: "https://youtube.com/@deepdivedoc" },
    { name: "MrBeast", link: "https://youtube.com/@mrbeast" },
    { name: "TechCraft", link: "https://youtube.com/@techcraft" },
    { name: "BrainWave", link: "https://youtube.com/@brainwave" },
  ];

  for (const ch of defaultChannels) {
    await prisma.channel.upsert({
      where: {
        userId_name: {
          userId: demoUserId,
          name: ch.name,
        },
      },
      update: { link: ch.link },
      create: {
        name: ch.name,
        link: ch.link,
        userId: demoUserId,
      },
    });
  }

  const channels = await prisma.channel.findMany({ where: { userId: demoUserId } });
  const channelMap = new Map(channels.map((c) => [c.name, c.id]));

  for (const proj of initialProjects) {
    const channelId = channelMap.get(proj.channel);
    await prisma.project.upsert({
      where: {
        userId_slug: {
          userId: demoUserId,
          slug: proj.slug,
        },
      },
      update: {
        name: proj.name,
        emoji: proj.emoji,
        channelId: channelId || null,
        hook: proj.hook,
        scriptLink: proj.scriptLink,
        script: proj.script,
      },
      create: {
        name: proj.name,
        slug: proj.slug,
        emoji: proj.emoji,
        channelId: channelId || null,
        hook: proj.hook,
        scriptLink: proj.scriptLink,
        script: proj.script,
        userId: demoUserId,
      },
    });
  }

  console.info(`✓ Seeded ${initialProjects.length} projects`);
}

export async function seedInspirations(demoUserId: string) {
  console.info("💡 Seeding inspirations and tagging for demo user...");

  const projects = await prisma.project.findMany({ where: { userId: demoUserId } });
  const projectMap = new Map(projects.map((p) => [p.slug, p.id]));

  const initialInspirations = [
    {
      thumbnailUrl:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      title: "I Built a $100,000 Secret Gaming Bunker Under My Backyard",
      type: "THUMBNAIL" as const,
      channelName: "TechCraft",
      views: "5.8M views",
      sourceUrl: "https://youtube.com/watch?v=mock1",
      note: "Extreme contrasting neon lighting against subterranean concrete.",
      projectSlug: "mrbeast-teardown",
    },
    {
      thumbnailUrl:
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80",
      title: "The 10-Minute Rule That Rewired My Focus Forever",
      type: "TITLE" as const,
      channelName: "DeepDiveDoc",
      views: "2.1M views",
      sourceUrl: "https://youtube.com/watch?v=mock2",
      note: "High intrigue, low friction promise format.",
      projectSlug: "storytelling-formats",
    },
    {
      thumbnailUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      title: "Why Silicon Valley is Abandoning Smartphones",
      type: "THUMBNAIL" as const,
      channelName: "BrainWave",
      views: "1.4M views",
      sourceUrl: "https://youtube.com/watch?v=mock3",
      note: "Negative curiosity angle drives unprecedented comment debate.",
      projectSlug: "tech-essay-2026",
    },
    {
      thumbnailUrl:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
      title: "The Great Wealth Transfer Nobody Is Preparing For",
      type: "HOOK" as const,
      channelName: "BrainWave",
      views: "890K views",
      sourceUrl: "https://youtube.com/watch?v=mock4",
      note: "Statistically framed urgency opening.",
      projectSlug: "finance-hooks",
    },
  ];

  for (const item of initialInspirations) {
    const existing = await prisma.inspiration.findFirst({
      where: {
        userId: demoUserId,
        title: item.title,
      },
    });

    const projectId = projectMap.get(item.projectSlug);

    if (!existing) {
      await prisma.inspiration.create({
        data: {
          thumbnailUrl: item.thumbnailUrl,
          title: item.title,
          type: item.type,
          channelName: item.channelName,
          views: item.views,
          sourceUrl: item.sourceUrl,
          note: item.note,
          userId: demoUserId,
          projects: projectId
            ? {
                create: {
                  projectId,
                  note: "Target production benchmark reference",
                  favorite: true,
                },
              }
            : undefined,
        },
      });
    }
  }

  console.info("✓ Seeded inspirations");
}

async function seedCompetitors(demoUserId: string) {
  console.info("🎯 Seeding competitor channels for demo user...");

  const demoCompetitors = [
    {
      channelName: "MrBeast",
      channelUrl: "https://youtube.com/@mrbeast",
      description:
        "Creator of large-scale challenge and philanthropy content. Benchmark for viral hook structures.",
      subscriberCountAtAdd: "280M",
      currentSubscriberCount: "280M",
      uploadFrequency: "Weekly",
      mostPopularVideoTitle: "I Spent 50 Hours Buried Alive",
      mostPopularVideoUrl: "https://youtube.com/watch?v=example1",
      personalNote:
        "Study his thumbnail contrast ratios — always 3-color max with a shocked face.",
    },
    {
      channelName: "Veritasium",
      channelUrl: "https://youtube.com/@veritasium",
      description:
        "Science & engineering deep-dives. Benchmark for contrarian title framing.",
      subscriberCountAtAdd: "17M",
      currentSubscriberCount: "17M",
      uploadFrequency: "Every 2 weeks",
      mostPopularVideoTitle: "The Bizarre Physics of Why Bicycles Don't Fall Over",
      mostPopularVideoUrl: "https://youtube.com/watch?v=example2",
      personalNote:
        "Retention hooks built around debunking assumptions — high watch time.",
    },
    {
      channelName: "TechCraft",
      channelUrl: "https://youtube.com/@techcraft",
      description:
        "Tech DIY builds and challenges. Strong on curiosity-gap titles with physical stakes.",
      subscriberCountAtAdd: "450K",
      currentSubscriberCount: "450K",
      uploadFrequency: "Twice weekly",
      mostPopularVideoTitle: "I Built a $100,000 Secret Gaming Bunker Under My Backyard",
      mostPopularVideoUrl: "https://youtube.com/watch?v=example3",
      personalNote: "12.4x outlier on this video. Rim lighting on thumbnail.",
    },
    {
      channelName: "AlexVlogs",
      channelUrl: "https://youtube.com/@alexvlogs",
      description: "Lifestyle and zeitgeist content targeting economic anxiety trends.",
      subscriberCountAtAdd: "2.1M",
      currentSubscriberCount: "2.1M",
      uploadFrequency: "3× weekly",
      mostPopularVideoTitle: "Why Everyone Is Suddenly Quitting Their 9-to-5 In 2026",
      mostPopularVideoUrl: "https://youtube.com/watch?v=example4",
      personalNote: "Red focal anchor in thumbnail is intentional. Study the urgency formula.",
    },
  ];

  for (const item of demoCompetitors) {
    await prisma.competitor.upsert({
      where: {
        userId_channelUrl: {
          userId: demoUserId,
          channelUrl: item.channelUrl,
        },
      },
      update: {
        currentSubscriberCount: item.currentSubscriberCount,
        uploadFrequency: item.uploadFrequency,
      },
      create: {
        ...item,
        userId: demoUserId,
      },
    });
  }

  console.info(`✓ Seeded ${demoCompetitors.length} competitor channels`);
}

async function main() {
  console.info("🌱 Seeding Snipvis database...\n");

  const demoUser = await seedUsers();
  await seedProjects(demoUser.id);
  await seedInspirations(demoUser.id);
  await seedCompetitors(demoUser.id);

  console.info("\n✅ All seeders complete");
}



main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

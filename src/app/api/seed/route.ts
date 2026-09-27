import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const projectCount = await prisma.project.count();

  if (projectCount > 0) {
    return NextResponse.json({
      message: "Database already seeded",
      projectCount,
    });
  }

  // 1. Create Core Creator Projects
  const p1 = await prisma.project.create({
    data: {
      name: "MrBeast Teardown",
      slug: "mrbeast-teardown",
      channel: "MrBeast",
      angle: "Extreme isolation stunts and curiosity-gap escalation.",
      hook: "In the next 7 minutes, I will test if anyone can survive 100 hours in an impenetrable vault...",
      scriptLink: "https://docs.google.com",
      notes:
        "Focus on rapid scene changes under 3 seconds and dynamic sound design.",
      script: `<h2>Introduction: The 5-Second Retention Crucible</h2>
<p>In the next 7 minutes, I will test if anyone can survive 100 hours in an impenetrable vault...</p>
<p>Notice how MrBeast introduces the stakes in under 3.2 seconds without any channel intro bumper.</p>
<h3>Retention Multiplier Formula:</h3>
<ol>
  <li>Extreme physical limitation or financial bounty</li>
  <li>Immediate visualization of the antagonist force</li>
  <li>Progress bar / ticking timer visual in top right corner</li>
</ol>`,
    },
  });

  const p2 = await prisma.project.create({
    data: {
      name: "Tech Essay 2026",
      slug: "tech-essay-2026",
      channel: "TechCraft",
      angle: "Why modern consumer hardware reached peak saturation.",
      hook: "Every major tech company is hiding the exact same secret about their 2026 releases...",
      scriptLink: "https://notion.so",
      notes:
        "Aesthetic B-roll needed: macro lens shots of silicon wafers and retro tech.",
      script: `<h2>Section 1: The Silicon Plateau</h2>
<p>Every major tech company is hiding the exact same secret about their 2026 releases: raw compute scaling has hit the thermal wall.</p>
<p>Here is what happens when silicon manufacturers can no longer shrink transistors:</p>
<ul>
  <li>Chiplet architecture packaging costs 3x more</li>
  <li>Software optimization becomes the primary competitive moat</li>
</ul>`,
    },
  });

  const p3 = await prisma.project.create({
    data: {
      name: "Finance Hooks",
      slug: "finance-hooks",
      channel: "BrainWave",
      angle: "Deconstructing wealth psychology and career transitions.",
      hook: "Why 84% of high earners are secretly planning to quit before the end of the quarter...",
      scriptLink: "https://docs.google.com",
      notes:
        "Contrarian framing: don't give advice, present statistical anomalies.",
      script: `<h2>The Anomaly: Why High Earners Disappear</h2>
<p>Why 84% of high earners are secretly planning to quit before the end of the quarter...</p>
<blockquote>"Wealth isn't what you spend on display; it is the options you possess when nobody is watching."</blockquote>
<p>Let's dismantle the psychological shift from prestige income to sovereign autonomy.</p>`,
    },
  });

  const p4 = await prisma.project.create({
    data: {
      name: "Storytelling Formats",
      slug: "storytelling-formats",
      channel: "DeepDiveDoc",
      angle: "Documentary pacing secrets and FBI arrest open loops.",
      hook: "The moment the federal agents entered the penthouse, they discovered 12 empty hard drives...",
      scriptLink: "https://figma.com",
      notes:
        "Start in media res directly at the climax before rewinding 18 months.",
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
</ul>`,
    },
  });

  // 2. Create Initial Real Research Inspirations
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

  // 3. Create Sample Assets
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

  return NextResponse.json({
    success: true,
    projects: [p1.id, p2.id, p3.id, p4.id],
    inspirations: [insp1.id, insp2.id, insp3.id, insp4.id],
  });
}

export async function GET() {
  return POST();
}

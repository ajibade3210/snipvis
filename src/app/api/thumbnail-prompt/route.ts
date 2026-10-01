import { AI_PROVIDER_CONFIG } from "@/constants/ai";
import { handleApiError } from "@/lib/api-error";
import { requireUser } from "@/lib/session";
import { generateThumbnailPromptSchema } from "@/lib/validations";
import type { ThumbnailPromptConcept } from "@/types/thumbnail-prompt";
import { type NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a world-class YouTube Packaging Director and Lead Art Director with a behavioral psychologist's understanding of why people click. You work in the tradition of top creators such as Veritasium, Ali Abdaal and MrBeast, and draw on the principles of Breakthrough Advertising, Influence and Hooked.
Your job: engineer 3 distinct, hyper-clickable thumbnail concepts, each with ready-to-use AI image generation prompts, for the video you are given.

### INPUT YOU WILL RECEIVE:
The user message contains:
- VIDEO TITLE
- VIDEO HOOK
- SUBJECT MODE: one of "reference-face", "generic-character" or "no-face"
- CHANNEL FORMULA: either a style formula distilled from a channel analysis, or "none provided"

### MANDATORY PACKAGING & COPYWRITING LAWS:

1. THE COMPLEMENTARY COPYWRITING RULE (NEVER REPEAT THE TITLE):
- The text overlay MUST NEVER repeat the topic or the words of the title.
- If the title is "The Great Wealth Transfer", the thumbnail MUST NOT say "Wealth Transfer" or "Wealth".
- Title and thumbnail complete each other: the title states the subject, the thumbnail adds a PUNCHLINE, TENSION or EMOTIONAL COUNTERPART that triggers an itch when read together with the title.
- Length: 2 to 4 words by default (up to 5 only if the channel formula's own pattern uses more). ALL CAPS unless the channel formula says otherwise.
- Every line must run on ONE named psychological mechanism, stated in "copyMechanism":
  * OPEN LOOP (curiosity gap): withhold the one fact that would resolve the tension the title creates.
  * BELIEF VIOLATION: contradict something the target viewer is sure is true, so scrolling past feels costly.
  * SELF-RECOGNITION: name a specific symptom, moment or habit the viewer lives with ("YOU", "YOUR"), so the video feels personally addressed.
  * LOSS FRAMING + SPECIFIC NUMBER: losses outweigh gains, and a concrete figure beats a vague claim.
  * IDENTITY / STATUS THREAT: make the viewer ask "which group am I in?"
  * BEFORE / AFTER CONTRAST: show two states; the gap between them is the promise.
  * RELIEF: name the pain the viewer wants gone, then signal its end.
- Examples (Title -> Copy | Trigger | Mechanism and why it forces the click):
  * "How I Built a $10M Business Alone" -> "HIRING WAS THE MISTAKE" | controversy | BELIEF VIOLATION. Every founder has been told to hire to scale. The line attacks that belief, so the viewer needs to see the proof before they can dismiss it.
  * "The Untold Truth About Coffee" -> "YOUR 3PM CRASH?" | curiosity | SELF-RECOGNITION + OPEN LOOP. The title promises a secret; the copy names a symptom the viewer felt today and implies coffee is involved, without saying how.
  * "Why 99% of Editors Fail" -> "YOU'RE PROBABLY THE 99%" | status anxiety | IDENTITY THREAT. It turns a statistic about strangers into a verdict on the viewer. Clicking is the only way to find out they are safe.
  * "The Housing Crash Nobody Sees" -> "YOUR HOUSE: -40%" | fear | LOSS FRAMING + SPECIFIC NUMBER. An ownership word plus a precise figure makes the loss personal and credible. Only use a figure the video can back up.
  * "I Learned Spanish in 90 Days" -> "DAY 1 -> DAY 90" | aspiration | BEFORE / AFTER. The viewer fills the gap with their own desired outcome.
  * "How to Stop Overthinking" -> "FINALLY. QUIET." | relief | RELIEF. It names the absence of the pain the viewer wants most; two short beats read like an exhale.
- COPY QUALITY TEST (rewrite any line that fails):
  * It opens a question the title does NOT answer.
  * It carries a personal stake: "you", "your", or something specific the viewer owns, fears or wants.
  * It is specific: a number, object, time or named moment beats adjectives.
  * It is NOT hype filler (INSANE, SHOCKING, WOW, OMG, YOU WON'T BELIEVE, GAME CHANGER), does not repeat the title, and does not claim anything the video cannot deliver.
- The examples above only demonstrate the mechanisms. NEVER reuse them; write fresh copy for the actual title and hook.

2. EMOTIONAL TRIGGERS & CONCEPT DIVERSITY:
- Build each concept around ONE primary emotional trigger: curiosity, fear, shock, aspiration, status, urgency, FOMO, relief or controversy.
- Name the exact visual or copy element that carries the trigger.
- The 3 concepts MUST differ meaningfully in trigger AND in layout or metaphor. Never deliver 3 variations of one idea.

3. CONCRETE VISUAL ANALOGY & METAPHOR (NO GENERIC AI CLICHES):
- NEVER generate generic stock/AI cliches: no floating holographic graphs, no random laser beams, no cyber sparks, no cluttered sci-fi junk.
- Ground the scene in a TANGIBLE, PHYSICAL OBJECT or METAPHOR:
  * Wealth/Money: An authentic titanium credit card cut clean in half on cold concrete; an hourglass where gold coins drain into grey ash; a vintage safe cracked open into darkness.
  * Productivity/Burnout: A concrete cinder block chained to a sleek laptop; an antique alarm clock frozen and leaking black ink.
  * Tech/AI/Code: A single red severed optical cable on a minimalist obsidian desk; a tiny silicon chip held in precision steel tweezers under a surgical spotlight.
  * Health/Science: A single fresh organic apple sliced to reveal a mechanical metal core; an unlabelled amber pill bottle stamped with a warning.
  * Mystery/Documentary: A classified manila document stamped "DENIED" under harsh directional desk light.

4. COLOR PALETTE & HARMONY (THE SQUINT TEST):
- Default: pair a deep, low-noise matte background (Matte Charcoal #1A1A1A, Studio Black #0D0D0D or Deep Slate #121820) with ONE intense high-luminance accent pop (Acid Lime #CEFF00, Hazard Yellow #FFE600 or Signal Crimson #FF3B30).
- Use extreme chiaroscuro directional lighting so the thumbnail pops on a 1.5-inch phone screen.
- If a channel formula is provided, ITS palette and contrast system override these defaults.

5. MILLER'S LAW (RULE OF 3) & MOBILE-FIRST COMPOSITION:
- Exactly 1 Anchor (human face or physical hero object) + 1 Context (tension/lighting) + 1 Accent (the bold text punchline).
- One focal point only. The design must stay legible at very small size.
- The bottom-right 25% of the frame MUST remain empty, dark negative space for the YouTube duration badge.

6. SUBJECT MODE RULES (follow the SUBJECT MODE given in the user message):
- "reference-face": the Anchor may be the person in the reference image. Refer to "the person in the reference image" and describe ONLY expression, pose, camera angle and lighting. NEVER describe facial features. Use the face only where it carries the emotional trigger; otherwise anchor on a hero object.
- "generic-character": the Anchor may be an invented character. Describe them fully: age range, clothing, expression, pose and gaze direction.
- "no-face": NO human faces. The Anchor MUST be an object or scene that carries the same emotional trigger a face would.

7. CHANNEL FORMULA RULES:
- If a CHANNEL FORMULA is provided, apply its layout, expression type, contrast system, copywriting rhythm and consistency elements to all 3 concepts.
- Adapt the design mechanism only. NEVER copy a source creator's face, likeness, logo or personal brand.
- Treat anything marked "unconfirmed" or "not visible" as soft guidance, not a rule.
- The formula overrides the default palette and layout, but NEVER the honesty, mobile-legibility or negative-space rules.
- If the channel formula is "none provided", rely on the defaults above.

8. HONESTY & SENSITIVE TOPICS:
- The thumbnail must honestly reflect the video. Create curiosity without misleading clickbait.
- In "honestyCheck", state in one line what the thumbnail promises and confirm the video can deliver it.
- If the topic touches health, finance, body image or other sensitive territory, explain the concern in "sensitiveTopicNote" and keep the concept tasteful: no fear- or shame-based imagery without a real payoff. Otherwise set "sensitiveTopicNote" to null.

9. PROMPTING CRAFT (MIDJOURNEY & FLUX):
- "prompt": one continuous paragraph usable in any AI image generator. Include the 16:9 aspect ratio, subject and pose, expression, gaze direction, camera framing, specific colors (with hex codes), lighting, background, and the exact overlay text with its font style, color and placement.
- "midjourneyPrompt": the same scene in Midjourney phrasing. It must ALWAYS end with "--ar 16:9 --v 6.1 --style raw".
- Specify tactile textures, real cameras and studio lighting (e.g. "Hasselblad H6D-100c, 85mm f/1.4 lens, tactile matte texture, directional rim lighting").
- Avoid generic buzzwords like "photorealistic", "8k" and "hyperdetailed". Use real photographic phrasing. Be specific and visual; never write vague directions like "make it eye-catching".
- "pitfallToAvoid": one line on the most likely way this concept could go wrong (clutter, off-brand tone, misleading the viewer).

### OUTPUT FORMAT:
Respond ONLY with a raw JSON object with exactly this shape and exactly 3 concepts (ids "concept-1", "concept-2", "concept-3"):
{
  "concepts": [
    {
      "id": string,
      "conceptName": string,
      "emotionalTrigger": string,
      "thumbnailCopy": string,
      "copyMechanism": string,
      "visualAnalogy": string,
      "colorScheme": string,
      "prompt": string,
      "midjourneyPrompt": string,
      "psychologicalAngle": string,
      "squintTestFeature": string,
      "ruleOfThreeBreakdown": {
        "anchor": string,
        "context": string,
        "accent": string
      },
      "honestyCheck": string,
      "pitfallToAvoid": string,
      "sensitiveTopicNote": string | null
    }
  ]
}
Do NOT wrap in markdown code blocks.`;

function cleanString(str: string): string {
  return str.replace(/[^\w\s-]/g, "").trim();
}

function getTopicAwareConcepts(
  topic: string,
  style = "cinematic",
  hook?: string,
): ThumbnailPromptConcept[] {
  const cleanTopic = cleanString(topic);
  const lower = cleanTopic.toLowerCase();

  // 1. High-Stakes / Danger / Trap / Survival / Subway / Thriller
  const isDangerOrSurvival =
    /\b(trapped|fatal|subway|train|plane|crash|danger|escape|survive|death|lost|hazard|fall|stuck|alone|prison|abyss|sink|fire)\b/i.test(
      lower,
    );

  if (isDangerOrSurvival) {
    const isSubwayOrTrain =
      /\b(subway|train|metro|transit|rail|tunnel)\b/i.test(lower);

    if (isSubwayOrTrain) {
      return [
        {
          id: "concept-1",
          conceptName: "The Electrified Third Rail",
          thumbnailCopy: "DON'T MOVE",
          visualAnalogy:
            "A terrified man frozen crouching millimeters away from a sparking electrified subway third rail in a dark subterranean tunnel, with train headlights looming in the distance.",
          colorScheme: "Tunnel Charcoal (#0D0D0D) & Hazard Amber (#FFB000)",
          prompt:
            "Cinematic wide-angle photograph, 24mm f/1.8 lens. Deep inside a dark, claustrophobic subway tunnel, a terrified man is frozen crouching millimeters away from a violently sparking electrified third rail. Dual piercing amber train headlights loom in the distant volumetric tunnel haze. Extreme chiaroscuro side lighting, intense sweat and grit, bold hazard-yellow sans-serif text 'DON'T MOVE' in top-left, bottom-right quadrant completely empty and dark --ar 16:9",
          psychologicalAngle: "Acute Survival Dilemma & Frozen Action",
          squintTestFeature:
            "Blinding train headlights and yellow sparks cutting through dark tunnel",
          ruleOfThreeBreakdown: {
            anchor: "Terrified man frozen inches from third rail",
            context: "Curving pitch-black subway tunnel with fog",
            accent: "Hazard-yellow 'DON'T MOVE' warning badge",
          },
        },
        {
          id: "concept-2",
          conceptName: "The Sealed Transit Door",
          thumbnailCopy: "NO ESCAPE",
          visualAnalogy:
            "A desperate bloody hand pressed against the scratched reinforced safety glass of locked subway doors, emergency red lights flashing through the stalled carriage.",
          colorScheme: "Studio Black (#0A0A0A) & Signal Crimson (#FF2D20)",
          prompt:
            "Cinematic macro photograph, 50mm f/1.4 lens. Inside a stalled subterranean transit car, a single desperate hand is pressed flat against the scratched safety glass of locked doors. Red emergency beacon lights cast intense crimson rim light across the frame. High micro-contrast, atmospheric subway dust, bold distressed white typography 'NO ESCAPE' in top-left, bottom-right quadrant completely dark and empty --ar 16:9",
          psychologicalAngle: "Claustrophobia & Imminent Countdown",
          squintTestFeature:
            "Vivid crimson emergency reflection against silhouette of hand on glass",
          ruleOfThreeBreakdown: {
            anchor: "Desperate hand on scratched reinforced glass",
            context: "Dark stalled train car bathed in red emergency strobes",
            accent: "Bold white 'NO ESCAPE' typography",
          },
        },
        {
          id: "concept-3",
          conceptName: "The Lethal Misstep",
          thumbnailCopy: "ONE STEP",
          visualAnalogy:
            "Low-angle shot of boots teetering on a narrow rusted subway beam above an abyss, electrical arcs crackling below.",
          colorScheme: "Dark Slate (#12161A) & Electric Cyan (#00E5FF)",
          prompt:
            "Dynamic low-angle tension photograph, 35mm lens. A man's boots teetering precariously on a narrow rusted steel beam over a pitch-black subway void. Electric blue sparks arc across the iron below, illuminating the edge with stark contrast. Dramatic raking light, extreme depth of field, bold acid-yellow text 'ONE STEP' in upper-left corner, clean dark negative space on bottom-right --ar 16:9",
          psychologicalAngle: "Extreme Physical Stakes & Visceral Tension",
          squintTestFeature:
            "Piercing electric blue arc illuminating the edge of the void",
          ruleOfThreeBreakdown: {
            anchor: "Boots hovering on the edge of the narrow beam",
            context: "Deep dark subway drop with industrial ironwork",
            accent: "High-contrast 'ONE STEP' curiosity anchor",
          },
        },
      ];
    }

    return [
      {
        id: "concept-1",
        conceptName: "The Point of No Return",
        thumbnailCopy: "DON'T MOVE",
        visualAnalogy:
          "A person frozen in high tension, one step away from catastrophic danger under harsh cinematic spotlighting.",
        colorScheme: "Deep Charcoal (#121212) & Signal Crimson (#FF3B30)",
        prompt: `Cinematic wide-angle shot, 28mm lens. Dramatic scene of high-stakes survival centered on ${cleanTopic}. A single figure frozen in place under an intense, directional key light. Deep textured shadows engulf the surrounding environment. Bold hazard-yellow sans-serif text 'DON'T MOVE' in top-left, bottom-right 25% kept completely dark and empty --ar 16:9`,
        psychologicalAngle: "Immediate Peril & Suspended Animation",
        squintTestFeature:
          "Harsh single-source key light spotlighting the central danger",
        ruleOfThreeBreakdown: {
          anchor: "Figure in immediate peril",
          context: "Dark high-stakes environment with volumetric shadows",
          accent: "Bold 'DON'T MOVE' typography",
        },
      },
      {
        id: "concept-2",
        conceptName: "The Ticking Threshold",
        thumbnailCopy: "TOO LATE?",
        visualAnalogy:
          "An emergency indicator or barrier showing the final seconds before disaster.",
        colorScheme: "Studio Black (#0B0B0B) & Hazard Amber (#FFAA00)",
        prompt: `Editorial tension photography, 50mm f/1.4 lens. High-stakes emergency atmosphere illustrating ${cleanTopic}. Intense warm amber warning lights reflecting off cold metallic surfaces. High micro-contrast, atmospheric smoke, bold signal-red text 'TOO LATE?' top-left, empty negative space on bottom-right --ar 16:9`,
        psychologicalAngle: "Loss Aversion & Time Scarcity",
        squintTestFeature: "Bright amber glow cutting through deep shadows",
        ruleOfThreeBreakdown: {
          anchor: "Critical threshold or hazard barrier",
          context: "Deep dark shadows and atmospheric haze",
          accent: "Vivid 'TOO LATE?' copy overlay",
        },
      },
      {
        id: "concept-3",
        conceptName: "The Final Choice",
        thumbnailCopy: "ONE WAY",
        visualAnalogy:
          "A stark fork or dilemma where one path leads to safety and the other to catastrophe.",
        colorScheme: "Midnight Navy (#0C1017) & Pure White (#FFFFFF)",
        prompt: `Cinematic high-contrast composition, 35mm lens. A single dramatic focal point depicting the central conflict of ${cleanTopic}. Deep chiaroscuro shadows, razor-sharp rim lighting, bold distressed text 'ONE WAY' top-left, clean empty bottom-right zone --ar 16:9`,
        psychologicalAngle: "Irreversible Dilemma & High Stakes",
        squintTestFeature:
          "Razor-sharp rim light silhouette against black backdrop",
        ruleOfThreeBreakdown: {
          anchor: "Focal dilemma point",
          context: "Moody environment with stark lighting contrast",
          accent: "Stark white 'ONE WAY' text badge",
        },
      },
    ];
  }

  // 2. Finance / Money / Economy
  const isFinance =
    /\b(money|wealth|tax|stock|crypto|invest|dollar|rich|poor|economy|market|salary|revenue|debt|bank|bill)\b/i.test(
      lower,
    );

  if (isFinance) {
    return [
      {
        id: "concept-1",
        conceptName: "The Irreversible Severance",
        thumbnailCopy: "TOO LATE?",
        visualAnalogy:
          "A luxury matte black titanium credit card snapped cleanly in half on raw dark concrete with a glowing red fracture line.",
        colorScheme: "Matte Charcoal (#141210) & Signal Crimson (#FF3B30)",
        prompt:
          "Editorial studio photograph, Hasselblad H6D-100c, 85mm f/1.4 lens. A luxury matte black titanium credit card snapped cleanly in half on cold dark textured concrete. A single subtle glowing red fracture line. High directional chiaroscuro side lighting, rich tactile textures, deep dark negative space on the right, bold distressed text reading 'TOO LATE?' in top-left, bottom-right quadrant completely empty --ar 16:9",
        psychologicalAngle: "Loss Aversion & Imminent Risk (Kahneman)",
        squintTestFeature:
          "Sharp bright fracture line cutting through deep charcoal slate",
        ruleOfThreeBreakdown: {
          anchor: "Snapped titanium card",
          context: "Cold dark concrete with harsh side shadow",
          accent: "Distressed crimson 'TOO LATE?' badge",
        },
      },
      {
        id: "concept-2",
        conceptName: "The Dissolving Asset",
        thumbnailCopy: "THE TRAP",
        visualAnalogy:
          "An authentic vintage brass hourglass where banknotes in the top chamber drain into fine grey ash in the bottom chamber.",
        colorScheme: "Studio Black (#0B0A09) & Hazard Yellow (#FFE600)",
        prompt:
          "Cinematic macro photography, 100mm macro lens, f/2.8. A vintage heavy brass hourglass centered on an obsidian reflective surface. Crisp miniature green banknotes in the top glass bulb filter through the neck and dissolve into fine volcanic grey ash in the lower bulb. Single top-down dramatic spotlight, pitch black background, bold hazard-yellow text 'THE TRAP' anchored top-left, bottom-right corner empty --ar 16:9",
        psychologicalAngle: "Curiosity Gap & Visual Anomaly",
        squintTestFeature:
          "Gleaming brass silhouette and stark illuminated hourglass neck",
        ruleOfThreeBreakdown: {
          anchor: "Illuminated brass hourglass",
          context: "Spotlight beam through deep obsidian darkness",
          accent: "Hazard-yellow 'THE TRAP' copy tag",
        },
      },
      {
        id: "concept-3",
        conceptName: "The Unsealed Vault",
        thumbnailCopy: "0.01% ONLY",
        visualAnalogy:
          "A massive monolithic steel bank vault door cracked open 2 inches, spilling a beam of warm golden light across an empty dark floor.",
        colorScheme: "Midnight Navy (#0A0E17) & Pure Gold (#FFD700)",
        prompt:
          "Cinematic wide-angle interior photograph, 35mm lens, f/2.0. A massive monolithic steel bank vault door cracked open 2 inches into an impenetrable dark corridor. An intense shaft of pure warm golden light spills across the cold polished dark floor. Lone dark silhouette outside the beam. Deep dark shadows occupy the entire right quadrant, bold text '0.01% ONLY' in top-left --ar 16:9",
        psychologicalAngle: "Information Gap & Exclusive Insider Access",
        squintTestFeature:
          "Blinding golden light shaft cutting through obsidian darkness",
        ruleOfThreeBreakdown: {
          anchor: "Blinding light beam from cracked vault",
          context: "Monolithic dark steel door and cold floor",
          accent: "Stark silhouette and golden illumination",
        },
      },
    ];
  }

  // 3. Tech / Software / AI
  const isTech =
    /\b(ai|code|coding|software|developer|python|javascript|algorithm|hardware|robot|cyber|model)\b/i.test(
      lower,
    );

  if (isTech) {
    return [
      {
        id: "concept-1",
        conceptName: "The Severed Circuit",
        thumbnailCopy: "IT'S OVER",
        visualAnalogy:
          "A clean matte black server module with a single red glowing severed optical cable dangling above it.",
        colorScheme: "Matte Carbon (#121212) & Signal Red (#FF2D20)",
        prompt:
          "Editorial tech studio photography, 50mm f/1.4 lens. A sleek matte black minimalist server cube centered on a dark walnut studio desk. A single thick fiber-optic cable cleanly severed, with its glowing crimson glass core casting a sharp light onto the dark chassis. Deep moody chiaroscuro lighting, zero clutter, bold sans-serif text 'IT'S OVER' in top-left, bottom-right quadrant in deep shadow --ar 16:9",
        psychologicalAngle: "Extreme Stakes & Negative Novelty",
        squintTestFeature:
          "Glowing crimson severed cable against deep dark chassis",
        ruleOfThreeBreakdown: {
          anchor: "Severed glowing red fiber cable",
          context: "Matte black server chassis and deep shadow",
          accent: "Stark white typography 'IT'S OVER'",
        },
      },
      {
        id: "concept-2",
        conceptName: "The Microscopic Anomaly",
        thumbnailCopy: "DO NOT RUN",
        visualAnalogy:
          "A pristine gold-plated microchip held delicately by precision steel tweezers under an intense cool surgical spotlight.",
        colorScheme: "Deep Slate (#0D1117) & Acid Cyan (#00F0FF)",
        prompt:
          "Extreme macro photography. Stainless steel jeweler's tweezers holding an intricate gold-plated silicon chip. An intense, cool surgical spotlight illuminates the etched golden micro-traces while the rest of the laboratory room falls into deep velvet black. Tactile metallic textures, shallow depth of field, bold acid-cyan text 'DO NOT RUN' top-left, bottom-right zone completely dark --ar 16:9",
        psychologicalAngle: "Curiosity Gap & Forbidden Knowledge",
        squintTestFeature:
          "Intense spotlight reflection on golden silicon wafer",
        ruleOfThreeBreakdown: {
          anchor: "Gleaming microchip in steel tweezers",
          context: "Surgical spotlight on deep black velvet",
          accent: "Acid-cyan text accent 'DO NOT RUN'",
        },
      },
      {
        id: "concept-3",
        conceptName: "The Deprecated System",
        thumbnailCopy: "DELETED",
        visualAnalogy:
          "A vintage monochrome CRT monitor in a pitch-black studio displaying a single glowing amber warning dialogue.",
        colorScheme: "Studio Charcoal (#100E0D) & Terminal Amber (#FF9500)",
        prompt:
          "Cinematic vintage-modern hybrid photograph, 35mm lens. A retro-futuristic dark grey CRT computer monitor in an empty pitch-black studio. On the curved glass screen, a single stark glowing amber warning dialogue illuminates the desk in warm light. High chiaroscuro, completely uncluttered composition, bold text 'DELETED' top-left, bottom-right corner empty --ar 16:9",
        psychologicalAngle: "Urgency & Systemic Breakdown",
        squintTestFeature: "Warm amber phosphor glow on curved dark screen",
        ruleOfThreeBreakdown: {
          anchor: "Glowing amber CRT display",
          context: "Dark empty studio with volumetric dust",
          accent: "Stark screen glow reflection on desk",
        },
      },
    ];
  }

  // 4. Universal / Story / Documentary / Custom Topic
  return [
    {
      id: "concept-1",
      conceptName: "The Solitary Climax",
      thumbnailCopy: "TOO LATE?",
      visualAnalogy: `A dramatic cinematic moment capturing the core physical stakes of ${cleanTopic}, isolated by intense directional lighting.`,
      colorScheme: "Studio Black (#0C0A09) & Signal Crimson (#FF3B30)",
      prompt: `Cinematic editorial photograph, 35mm lens, f/1.8. A dramatic, high-tension physical scene centered on "${cleanTopic}". A single central subject under intense directional chiaroscuro lighting, surrounded by moody deep shadows. Minimalist composition, rich texture and film grain, bold distressed sans-serif text 'TOO LATE?' in top-left, bottom-right 25% kept completely empty and dark --ar 16:9`,
      psychologicalAngle: "Curiosity Gap & Imminent Stakes",
      squintTestFeature:
        "High luminance hero subject against deep matte shadow",
      ruleOfThreeBreakdown: {
        anchor: `Hero subject representing ${cleanTopic}`,
        context: "Moody cinematic lighting and deep shadows",
        accent: "Bold crimson 'TOO LATE?' text tag",
      },
    },
    {
      id: "concept-2",
      conceptName: "The Hidden Mechanism",
      thumbnailCopy: "THE TRAP",
      visualAnalogy: `A close-up examination of the critical turning point in ${cleanTopic}, revealing what went wrong.`,
      colorScheme: "Matte Charcoal (#1A1715) & Hazard Yellow (#FFE600)",
      prompt: `Cinematic close-up photograph, 85mm f/1.4 lens. Intensely focused shot exploring "${cleanTopic}". Stark single-source raking light reveals tactile details and dramatic tension. Uncluttered background plunged into velvet darkness, bold hazard-yellow text 'THE TRAP' in top-left, clean empty negative space on bottom-right --ar 16:9`,
      psychologicalAngle: "Pattern Interruption & Forbidden Insight",
      squintTestFeature:
        "Stark yellow accent popping from low-noise dark field",
      ruleOfThreeBreakdown: {
        anchor: "Critical turning point object",
        context: "Raking directional key light on dark texture",
        accent: "Hazard-yellow 'THE TRAP' typography",
      },
    },
    {
      id: "concept-3",
      conceptName: "The Unresolved Threshold",
      thumbnailCopy: "DON'T LOOK",
      visualAnalogy: `A lone silhouette facing an overwhelming unknown situation directly related to ${cleanTopic}.`,
      colorScheme: "Midnight Slate (#0E1117) & High-Key White (#F8F8F8)",
      prompt: `Cinematic wide composition, 28mm lens. A lone dark human silhouette facing an immense, dramatic situation inspired by "${cleanTopic}". Volumetric mist and stark chiaroscuro lighting create overwhelming scale and tension. Bold distressed typography 'DON'T LOOK' in top-left, bottom-right quadrant completely dark and empty --ar 16:9`,
      psychologicalAngle: "Reactance & Deep Mystery",
      squintTestFeature: "Stark silhouette carved out by volumetric light",
      ruleOfThreeBreakdown: {
        anchor: "Stark lone silhouette",
        context: "Atmospheric volumetric light and shadow",
        accent: "Distressed white 'DON'T LOOK' headline",
      },
    },
  ];
}

export async function POST(req: NextRequest) {
  try {
    await requireUser();
    const rawBody = await req.json();
    const input = generateThumbnailPromptSchema.parse(rawBody);

    const {
      baseUrl,
      apiKey: staticApiKey,
      textModel,
      TIMEOUT_MS,
      TEMPERATURE,
      provider,
      extraHeaders,
    } = AI_PROVIDER_CONFIG;

    const apiKey =
      (provider === "openrouter"
        ? process.env.OPENROUTER_API_KEY
        : process.env.DEEPSEEK_API_KEY) || staticApiKey;

    if (!apiKey) {
      return NextResponse.json({
        concepts: getTopicAwareConcepts(input.topic, input.style, input.hook),
        providerUsed: "smart-heuristic-engine",
      });
    }

    const userMessage = `Generate 3 psychological YouTube thumbnail concepts and universal prompts for:
Topic/Title: "${input.topic}"
${input.hook ? `Opening Hook: "${input.hook}"` : ""}
${input.channelName ? `Channel Style: ${input.channelName}` : ""}
Visual Style: ${input.style || "cinematic"}

REMINDER:
- Ground the scenes SPECIFICALLY in the setting, characters, and dilemma of "${input.topic}". Do NOT generate generic unrelated tech or corporate metaphors.
- The thumbnailCopy MUST NEVER repeat words from the title/topic. It must be a 2-4 word punchline or counterpart (e.g. "DON'T MOVE", "NO ESCAPE", "ONE STEP").
- In each concept, generate ONE universal prompt in the "prompt" field ending with "--ar 16:9".`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: textModel,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
          temperature: TEMPERATURE,
          max_tokens: 1500,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error(
          `[ThumbnailPrompt API] Provider ${provider} returned ${response.status}:`,
          errorText,
        );
        return NextResponse.json({
          concepts: getTopicAwareConcepts(input.topic, input.style, input.hook),
          providerUsed: "smart-heuristic-engine",
        });
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content?.trim();

      if (!rawContent) {
        console.error("[ThumbnailPrompt API] Empty content from provider");
        return NextResponse.json({
          concepts: getTopicAwareConcepts(input.topic, input.style, input.hook),
          providerUsed: "smart-heuristic-engine",
        });
      }

      // Strip think tags, markdown fences, or leading/trailing commentary
      const cleanedJson = rawContent
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/, "")
        .replace(/```$/, "")
        .trim();

      // Find first { and last } to be resilient against LLM preamble
      const firstBrace = cleanedJson.indexOf("{");
      const lastBrace = cleanedJson.lastIndexOf("}");
      const jsonCandidate =
        firstBrace !== -1 && lastBrace !== -1
          ? cleanedJson.slice(firstBrace, lastBrace + 1)
          : cleanedJson;

      const parsed = JSON.parse(jsonCandidate);
      if (Array.isArray(parsed.concepts) && parsed.concepts.length > 0) {
        // Normalize concepts to guarantee clean prompt ending with --ar 16:9 and no midjourneyPrompt
        const normalized = parsed.concepts.map(
          (c: Partial<ThumbnailPromptConcept>, idx: number) => {
            const rawPrompt = c.prompt || "";
            const prompt = rawPrompt.includes("--ar 16:9")
              ? rawPrompt
              : `${rawPrompt} --ar 16:9`;

            return {
              id: c.id || `concept-${idx + 1}`,
              conceptName: c.conceptName || `Concept ${idx + 1}`,
              thumbnailCopy: c.thumbnailCopy || "WATCH NOW",
              visualAnalogy: c.visualAnalogy || "",
              colorScheme: c.colorScheme || "Studio Contrast",
              prompt,
              psychologicalAngle: c.psychologicalAngle || "Curiosity Gap",
              squintTestFeature:
                c.squintTestFeature || "High luminance contrast",
              ruleOfThreeBreakdown: c.ruleOfThreeBreakdown || {
                anchor: "Hero focal point",
                context: "Dramatic lighting",
                accent: "Punchy text overlay",
              },
            };
          },
        );

        return NextResponse.json({
          concepts: normalized,
          providerUsed: provider,
        });
      }

      return NextResponse.json({
        concepts: getTopicAwareConcepts(input.topic, input.style, input.hook),
        providerUsed: "smart-heuristic-engine",
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      console.error("[ThumbnailPrompt API] Fetch exception:", fetchErr);
      return NextResponse.json({
        concepts: getTopicAwareConcepts(input.topic, input.style, input.hook),
        providerUsed: "smart-heuristic-engine",
      });
    }
  } catch (err) {
    return handleApiError(err);
  }
}

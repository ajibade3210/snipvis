export const CACHE_KEYS = {
  PROJECTS_LIST: "projects:list",
} as const;

export const CACHE_TTL = {
  PROJECTS_LIST_SECONDS: 60,
} as const;

export const API_ROUTES = {
  PROJECTS: "/api/projects",
  INSPIRATIONS: "/api/inspirations",
  INSPIRATION_TAG: "/api/inspirations/tag",
  ASSETS: "/api/assets",
  YOUTUBE: "/api/youtube",
  SEED: "/api/seed",
  MEDIA: "/api/media",
  MEDIA_UPLOAD: "/api/media/upload",
} as const;

export const MEDIA_CONFIG = {
  PRESIGNED_EXPIRY_SECONDS: 900,
  MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024,
  MAX_DOCUMENT_SIZE_BYTES: 10 * 1024 * 1024,
  MAX_VIDEO_SIZE_BYTES: 50 * 1024 * 1024,
  MAX_AUDIO_SIZE_BYTES: 25 * 1024 * 1024,
  DEFAULT_MAX_SIZE_BYTES: 50 * 1024 * 1024,
  DEFAULT_PROJECT_ID: "general",
  DEFAULT_USER_ID: "creator",
  DEFAULT_CATEGORY: "others",
  MAX_BATCH_FILES: 20,
} as const;

export const STORAGE_KEYS = {
  THEME: "sv-theme",
  SIDEBAR_COLLAPSED: "sv-sidebar-collapsed",
} as const;

export const QUERY_KEYS = {
  PROJECTS: "projects",
  INSPIRATIONS: "inspirations",
  ASSETS: "assets",
} as const;

export const DEFAULT_PROJECT_SCRIPTS: Record<string, string> = {
  "storytelling-formats": `<h2>Act 1: The Cold Open (0:00 - 1:15)</h2>
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

  "mrbeast-teardown": `<h2>Introduction: The 5-Second Retention Crucible</h2>
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

  "tech-essay-2026": `<h2>Section 1: The Silicon Plateau</h2>
<p>Every major tech company is hiding the exact same secret about their 2026 releases: raw compute scaling has hit the thermal wall.</p>
<p>Here is what happens when silicon manufacturers can no longer shrink transistors:</p>
<ul>
  <li>Chiplet architecture packaging costs 3x more</li>
  <li>Software optimization becomes the primary competitive moat</li>
</ul>
<blockquote>"When hardware plateaus, form factors and local AI models become the only battleground."</blockquote>`,

  "finance-hooks": `<h2>The Anomaly: Why High Earners Disappear</h2>
<p>Why 84% of high earners are secretly planning to quit before the end of the quarter...</p>
<blockquote>"Wealth isn't what you spend on display; it is the options you possess when nobody is watching."</blockquote>
<p>Let's dismantle the psychological shift from prestige income to sovereign autonomy.</p>
<h3>Discussion Anchors:</h3>
<ul>
  <li>The Golden Handcuffs inflection curve</li>
  <li>Asymmetric downside of corporate reliance</li>
</ul>`,
};

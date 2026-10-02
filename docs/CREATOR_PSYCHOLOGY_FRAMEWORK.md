# Snipvis Creator Psychology & Viral Mechanics Playbook
*A Scientific Framework for YouTube Packaging, Cognitive Load, and Audience Retention*

---

## Executive Summary
Viral video performance is not random luck; it is governed by **human cognitive architecture**—specifically how the human brain processes visual stimuli in peripheral vision (0–0.2s), resolves curiosity gaps before clicking (0.2–1s), and audits dopamine payoff in the first 10 seconds of playback.

This playbook documents the **psychological laws**, **creator failure modes**, **practical countermeasures**, and **exact implementation locations** within **Snipvis OS**.

---

## 1. Visual Hierarchy & The Feed Scroll (0.0s – 0.5s)

### 1.1 The Squint Test: Weber-Fechner Law of Luminance Contrast
* **Scientific Principle:** *Weber-Fechner Law of Psychophysics & Peripheral Processing.* The brain senses differences proportionally rather than linearly. Over 70% of YouTube sessions occur on mobile devices where viewers scroll rapidly. The foveal (sharp) field of vision only covers ~2 degrees; everything else is scanned with low-resolution peripheral vision.
* **The Creator Failure Mode:** Thumbnails designed on 27-inch 4K desktop monitors with intricate lighting often fail on mobile. Without stark contrast, subtle shadows and gradients flatten into an undifferentiated grey smudge.
* **The Countermeasure:** Desaturating to grayscale and applying a Gaussian blur (`blur(4px)`). If the hero subject is not instantly identifiable without color or fine edges, the thumbnail fails.
* **Where It Lives in Snipvis:**
  - **Component:** `src/components/packaging-simulator-modal.tsx`
  - **Trigger:** `👁️ Squint Test` toolbar toggle in the Packaging Simulator.

---

### 1.2 The "Rule of 3" Cognitive Load Guard: Miller’s Law
* **Scientific Principle:** *Miller’s Law of Working Memory (Chunking).* In high-speed visual scanning environments, working memory can process a maximum of **3 distinct visual chunks** simultaneously before cognitive fatigue sets in.
* **The Creator Failure Mode:** "Kitchen-sink thumbnails"—a creator adds a face, two shocked emojis, red arrows, a company logo, background explosions, and a 6-word title text. The viewer’s brain categorizes this sensory overload as spam or low-effort clutter and instinctively scrolls away.
* **The Countermeasure:** A strict 3-Element Guard:
  1. **Element 1 (The Anchor):** The single hero subject (one face OR one focal object).
  2. **Element 2 (The Tension/Context):** The obstacle, contrast, or secondary subject.
  3. **Element 3 (The Accent):** Maximum 2–3 punchy words OR one directional graphic.
* **Where It Lives in Snipvis:**
  - **Component:** `src/components/packaging-simulator-modal.tsx`
  - **Trigger:** `🧠 Rule of 3` cognitive focal guide in the Packaging Simulator.

---

### 1.3 The Blocker Zone: Gestalt Visual Occlusion & Bounded Space
* **Scientific Principle:** *Gestalt Law of Closure and Visual Obstruction.* When an interface element cuts into a visual subject, the brain struggles to complete the silhouette and misinterprets or ignores the masked information.
* **The Creator Failure Mode:** YouTube stamps a solid black duration pill (`14:28` or `1:20:05`) over the bottom-right corner of every video card. Creators routinely place their punchline text, key facial expressions, or brand logos in this exact quadrant, ruining the joke or premise.
* **The Countermeasure:** A standardized **"No-Fly Zone"** overlay highlighting the bottom-right 20% of the canvas in red, ensuring critical visual assets are strictly positioned in the upper and left zones.
* **Where It Lives in Snipvis:**
  - **Component:** `src/components/packaging-simulator-modal.tsx`
  - **Trigger:** `⏱️ 14:28 Badge` and `🚨 Blocker Zone` toolbar toggles.

---

## 2. The Decision to Click (0.5s – 1.5s)

### 2.1 The Curiosity Gap: Loewenstein’s Information Gap Theory
* **Scientific Principle:** *George Loewenstein’s Information Gap Theory.* Curiosity is a form of cognitive deprivation. When a human recognizes a gap between what they know and what they *want* to know, it activates the same brain regions associated with physical cravings (dopaminergic reward anticipation). The click is the subconscious attempt to close the gap.
* **The Creator Failure Mode:**
  1. *Giving away the punchline:* E.g., *"I Built a $5,000 Vintage Studio using Apple II"* (zero curiosity; nothing to resolve).
  2. *Excessive vagueness:* E.g., *"You won't believe this"* (no reference anchor; brain classifies it as clickbait spam).
* **The Countermeasure:** Titling formulas that establish a recognizable anchor while deliberately withholding the resolution (e.g., *"I Bought Steve Jobs' Secret Prototype"*).
* **Where It Lives in Snipvis:**
  - **Component:** `src/components/packaging-simulator-modal.tsx`
  - **Trigger:** Real-time **Viral Tension Drivers** & 1-Click Formula Pivots under the Title Lab.

---

### 2.2 Negativity Bias & Loss Aversion: Kahneman & Tversky
* **Scientific Principle:** *Prospect Theory & Asymmetric Loss Aversion.* The evolutionary brain is hardwired to fear loss twice as intensely as it desires gain. Threat-detection mechanisms prioritize warnings over positive tips.
* **The Creator Failure Mode:** Framing packaging exclusively around positive advice (e.g. *"5 Great Productivity Tips"*), which produces low urgency.
* **The Countermeasure:** Reframing value around mistake prevention and hidden traps:
  - *"5 Mistakes Ruining Your Productivity"*
  - *"Why Nobody Is Preparing For This"*
  - *"Stop Doing This Before It's Too Late"*
* **Where It Lives in Snipvis:**
  - **Component:** `src/components/packaging-simulator-modal.tsx`
  - **Trigger:** Real-time Loss Aversion trigger detection in the Title Lab.

---

### 2.3 Mobile Truncation & Cognitive Fatigue
* **Scientific Principle:** *Hick-Hyman Law & Working Memory Limits.* The more cognitive friction required to parse a sentence, the lower the conversion rate. On smartphone displays, YouTube aggressively truncates titles past ~50 characters with `...`.
* **The Creator Failure Mode:** Burying the curiosity hook or primary subject at the end of a long 75-character sentence (e.g. *"Today I am going to finally reveal the secret to..."* $\rightarrow$ truncated before reaching the point).
* **The Countermeasure:** A visual character counter with real-time mobile safety zones:
  - 🟢 **Safe (< 50 chars):** 100% visible on mobile feeds.
  - 🟡 **Warning (50–70 chars):** Truncates with `...` on mobile.
  - 🔴 **Danger (> 70 chars):** Truncates across both desktop and mobile.
* **Where It Lives in Snipvis:**
  - **Constants:** `src/constants/packaging.ts` (`PACKAGING_LIMITS`)
  - **Component:** `src/components/packaging-simulator-modal.tsx`

---

## 3. Retention & The First 10 Seconds (0.0s – 10.0s)

### 3.1 The "Bait-and-Switch" Penalty: Dopamine Expectancy Violation
* **Scientific Principle:** *Dopamine Reward Prediction Error.* When a viewer clicks a video, their brain is primed with an acute expectation created by the thumbnail. If the first 5–10 seconds do not immediately validate that expectation, the brain experiences a dopamine crash, resulting in an immediate tab close. YouTube's recommendation engine interprets high 0–15s drop-off as misleading packaging and suppresses video reach.
* **The Creator Failure Mode:** Opening the video with a 15-second channel intro animation, saying *"Hey guys, welcome back to the channel, make sure to like and subscribe"*, or discussing unrelated preamble before addressing the thumbnail topic.
* **The Countermeasure:** A direct **"Hook-to-Packaging Alignment"** audit rule: *Your first spoken sentence MUST explicitly confirm the subject or question depicted on the thumbnail.*
* **Where It Lives in Snipvis:**
  - **Component:** `src/components/brief-view.tsx`
  - **Trigger:** Real-time hook validation reminder directly above the Opening Hook textarea.

---

### 3.2 Spoken Duration Decay: Words-Per-Minute (WPM) Pacing
* **Scientific Principle:** *Attention Span Decay Curve.* Audience drop-off is steepest during the first 15 seconds. If an opening hook takes more than 8–10 seconds to deliver its core hook line, viewer patience expires.
* **The Creator Failure Mode:** Writing a 60-word opening monologue that takes 25 seconds to deliver, losing 40% of the audience before the video truly begins.
* **The Countermeasure:** Real-time spoken duration calculation calibrated at a brisk ~145 words per minute (WPM). It automatically computes speech time and flags a warning if the hook exceeds 10–12 seconds.
* **Where It Lives in Snipvis:**
  - **Component:** `src/components/brief-view.tsx`
  - **Trigger:** Live Stopwatch & Word Counter attached to the Opening Hook editor.

---

## 4. Generative AI Asset Creation: Psychological Prompting

### 4.1 Engineering Prompts for Human Vision
* **Scientific Principle:** Generative image models produce aesthetic art by default, but aesthetics $\neq$ click-through rate. High-CTR thumbnails require extreme lighting contrast, minimal background noise, and negative space for platform overlays.
* **The Countermeasure:** The **AI Thumbnail Prompt Generator** forces AI image models to follow these scientific constraints:
  - Automatically commands a **high-contrast rim-lit subject** (Weber-Fechner Law).
  - Explicitly restricts elements to **1 Hero Anchor + 1 Context Tension** (Miller's Law).
  - Commands the **bottom-right corner to be empty negative space** (Gestalt Blocker Zone).
  - Enforces universal photographic and scene composition for direct use in any image generation tool.
* **Where It Lives in Snipvis:**
  - **Endpoint:** `src/app/api/thumbnail-prompt/route.ts`
  - **UI Modal:** `src/components/thumbnail-prompt-modal.tsx`
  - **Trigger:** `✨ AI Prompt` button in `src/components/thumbnail-gallery.tsx`.

---

## 5. Master Feature Mapping & Architecture

| Feature | Psychological Principle | Creator Decision Solved | Exact Code Location |
| :--- | :--- | :--- | :--- |
| **Squint Test (Blur + B&W)** | Weber-Fechner Law / Value Contrast | Does the focal point pop on a tiny phone screen? | `src/components/packaging-simulator-modal.tsx` |
| **3-Element Cognitive Guard** | Miller’s Law of Working Memory | Is the thumbnail too cluttered for rapid scanning? | `src/components/packaging-simulator-modal.tsx` |
| **Blocker Zone (`14:28`)** | Gestalt Visual Occlusion | Is key text covered by YouTube's time badge? | `src/components/packaging-simulator-modal.tsx` |
| **Curiosity Gap Scorer** | Loewenstein Information Gap Theory | Does the title tease the payoff without spoiling it? | `src/components/packaging-simulator-modal.tsx` |
| **Mobile Truncation Meter** | Hick-Hyman Law & Reading Limits | Will critical words get cut off with `...` on phones? | `src/constants/packaging.ts` & `src/components/packaging-simulator-modal.tsx` |
| **Hook Retention Stopwatch** | Attention Decay Curve (WPM Pacing) | Is the opening hook short enough (<10s) to hold retention? | `src/components/brief-view.tsx` |
| **AI Prompt Generator** | Psychological Multi-Model Prompting | How do I generate high-CTR artwork in image generation tools? | `src/app/api/thumbnail-prompt/route.ts` & `src/components/thumbnail-prompt-modal.tsx` |

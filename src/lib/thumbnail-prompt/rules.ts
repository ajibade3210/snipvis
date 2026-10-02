import type { ThumbnailPromptConcept } from "./schema";

const HYPE_PHRASES = [
  "insane",
  "shocking",
  "wow",
  "omg",
  "game changer",
  "you won't believe",
] as const;

const STOP_WORDS = new Set([
  "your",
  "this",
  "that",
  "with",
  "from",
  "what",
  "when",
  "have",
  "will",
  "about",
  "they",
  "their",
  "been",
  "were",
  "into",
  "only",
  "just",
  "does",
  "than",
  "then",
  "them",
  "here",
  "over",
  "more",
  "most",
  "very",
]);

function extractSignificantStems(text: string): Set<string> {
  const matches = text.toLowerCase().match(/[a-z]+/g) || [];
  const stems = new Set<string>();

  for (const rawToken of matches) {
    if (rawToken.length < 4 || STOP_WORDS.has(rawToken)) {
      continue;
    }
    const stem = rawToken.endsWith("s") ? rawToken.slice(0, -1) : rawToken;
    if (stem.length >= 4 && !STOP_WORDS.has(stem)) {
      stems.add(stem);
    }
  }

  return stems;
}

export function findRuleViolations(
  concepts: ThumbnailPromptConcept[],
  title: string,
): string[] {
  const violations: string[] = [];
  const titleStems = extractSignificantStems(title);

  const seenCopies = new Map<string, string>();
  const seenTriggers = new Map<string, string>();

  for (const concept of concepts) {
    const copy = concept.thumbnailCopy.trim();
    const words = copy.split(/\s+/).filter(Boolean);

    // 1. Word count check: 2 to 5 words
    if (words.length < 2 || words.length > 5) {
      violations.push(
        `Concept ${concept.id}: thumbnailCopy "${copy}" has ${words.length} words (must be between 2 and 5 words).`,
      );
    }

    // 2. Hype filler check
    const lowerCopy = copy.toLowerCase();
    for (const hype of HYPE_PHRASES) {
      const escapedHype = hype.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedHype}\\b`, "i");
      if (regex.test(lowerCopy)) {
        violations.push(
          `Concept ${concept.id}: thumbnailCopy "${copy}" contains prohibited hype filler "${hype}".`,
        );
      }
    }

    // 3. Repeat title check using significant stems
    const copyStems = extractSignificantStems(copy);
    for (const stem of copyStems) {
      if (titleStems.has(stem)) {
        violations.push(
          `Concept ${concept.id}: thumbnailCopy "${copy}" repeats title keyword stem "${stem}".`,
        );
      }
    }

    // Track uniqueness across concepts
    const normalizedCopy = lowerCopy;
    const existingCopyConceptId = seenCopies.get(normalizedCopy);
    if (existingCopyConceptId) {
      violations.push(
        `Concepts ${existingCopyConceptId} and ${concept.id} share duplicate thumbnailCopy "${copy}".`,
      );
    } else {
      seenCopies.set(normalizedCopy, concept.id);
    }

    const normalizedTrigger = concept.emotionalTrigger.trim().toLowerCase();
    const existingTriggerConceptId = seenTriggers.get(normalizedTrigger);
    if (existingTriggerConceptId) {
      violations.push(
        `Concepts ${existingTriggerConceptId} and ${concept.id} share duplicate emotionalTrigger "${concept.emotionalTrigger}" (copy: "${copy}").`,
      );
    } else {
      seenTriggers.set(normalizedTrigger, concept.id);
    }
  }

  return violations;
}

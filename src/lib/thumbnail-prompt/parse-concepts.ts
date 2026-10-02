import { findRuleViolations } from "./rules";
import { type ThumbnailPromptConcept, conceptsResponseSchema } from "./schema";

export type ParseConceptsResult =
  | { ok: true; concepts: ThumbnailPromptConcept[] }
  | { ok: false; problems: string[] };

export function parseConcepts(raw: string, title: string): ParseConceptsResult {
  if (!raw || typeof raw !== "string") {
    return { ok: false, problems: ["The response was not valid JSON."] };
  }

  // 1. Strip <think>...</think> tags (case-insensitive, multiline)
  const stripped = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // 2. Slice from the first { to the last }
  const firstBrace = stripped.indexOf("{");
  const lastBrace = stripped.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    return { ok: false, problems: ["The response was not valid JSON."] };
  }

  const jsonCandidate = stripped.slice(firstBrace, lastBrace + 1);

  // 3. JSON.parse
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonCandidate);
  } catch {
    return { ok: false, problems: ["The response was not valid JSON."] };
  }

  // 4. Validate with Zod schema
  const validation = conceptsResponseSchema.safeParse(parsed);
  if (!validation.success) {
    const problems = validation.error.issues.map((issue) => {
      const pathStr = issue.path.join(".");
      return pathStr ? `${pathStr}: ${issue.message}` : issue.message;
    });
    return { ok: false, problems };
  }

  const concepts = validation.data.concepts;

  // 5. Run rule checks
  const ruleViolations = findRuleViolations(concepts, title);
  if (ruleViolations.length > 0) {
    return { ok: false, problems: ruleViolations };
  }

  return { ok: true, concepts };
}

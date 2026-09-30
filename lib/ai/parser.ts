import { ZodSchema, ZodError } from 'zod';

export function extractJsonFromText(rawText: string): string {
  if (!rawText) return '{}';
  const trimmed = rawText.trim();

  // If already pure JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    return trimmed;
  }

  // Look for markdown json code fence
  const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonMatch && jsonMatch[1]) {
    return jsonMatch[1].trim();
  }

  // Look for first '{' and last '}'
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.substring(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export function safeJsonParse<T>(rawText: string, schema: ZodSchema<T>): { success: true; data: T } | { success: false; error: string } {
  try {
    const cleaned = extractJsonFromText(rawText);
    const parsed = JSON.parse(cleaned);
    const validated = schema.parse(parsed);
    return { success: true, data: validated };
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      const issueDetails = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      return { success: false, error: `Schema validation failed: ${issueDetails}` };
    }
    if (err instanceof Error) {
      return { success: false, error: `JSON parsing error: ${err.message}` };
    }
    return { success: false, error: 'Unknown parsing error occurred.' };
  }
}

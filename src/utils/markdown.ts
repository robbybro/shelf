/**
 * Escapes special markdown characters
 */
export function escapeMarkdown(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Formats a recipe title as markdown heading
 */
export function formatRecipeTitle(title: string, level: number = 2): string {
  const hashes = '#'.repeat(level);
  return `${hashes} ${title}`;
}

/**
 * Formats an ingredient as a markdown list item
 */
export function formatIngredient(text: string, confidence?: number): string {
  let formatted = `- ${text}`;

  if (confidence !== undefined && confidence < 0.8) {
    formatted += ` <!-- confidence: ${(confidence * 100).toFixed(0)}% -->`;
  }

  return formatted;
}

/**
 * Formats an instruction as a numbered list item
 */
export function formatInstruction(text: string, stepNumber: number, confidence?: number): string {
  let formatted = `${stepNumber}. ${text}`;

  if (confidence !== undefined && confidence < 0.8) {
    formatted += ` <!-- confidence: ${(confidence * 100).toFixed(0)}% -->`;
  }

  return formatted;
}

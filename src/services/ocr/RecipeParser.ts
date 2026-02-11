import { v4 as uuidv4 } from 'uuid';
import { OCRResult, Recipe, Ingredient, Instruction, Technique } from '../../types';

export class RecipeParser {
  /**
   * Attempts to parse a recipe from OCR results
   */
  static parseRecipe(ocrResults: OCRResult[], pageId: string): Recipe | null {
    const sortedBlocks = this.sortByVerticalPosition(ocrResults);

    const title = this.extractTitle(sortedBlocks);
    const pageNumber = this.extractPageNumber(ocrResults);
    const ingredients = this.extractIngredients(sortedBlocks);
    const instructions = this.extractInstructions(sortedBlocks);
    const techniques = this.extractTechniques(sortedBlocks);

    // Must have at least a title to be a valid recipe
    if (!title) return null;

    const recipe: Recipe = {
      id: uuidv4(),
      pageId,
      title: title.text,
      titleConfidence: title.confidence,
      pageNumber: pageNumber?.value,
      pageNumberConfidence: pageNumber?.confidence,
      ingredients,
      instructions,
      techniques,
      rawMarkdown: '',
    };

    return recipe;
  }

  /**
   * Extracts recipe title (usually at the top, < 50 chars)
   */
  private static extractTitle(blocks: OCRResult[]): { text: string; confidence: number } | null {
    // Look at first 5 blocks
    const topBlocks = blocks.slice(0, 5);

    // Find block that looks like a title:
    // - High confidence (> 0.7)
    // - Short length (< 50 chars)
    // - Not a page number
    // - Not "Ingredients" or "Instructions"
    const candidate = topBlocks.find(block =>
      block.confidence > 0.7 &&
      block.text.length < 50 &&
      !this.isPageNumber(block.text) &&
      !this.isSectionHeader(block.text)
    );

    if (!candidate) {
      // Fallback: use first block
      return topBlocks[0] ? {
        text: topBlocks[0].text,
        confidence: topBlocks[0].confidence
      } : null;
    }

    return {
      text: candidate.text,
      confidence: candidate.confidence
    };
  }

  /**
   * Extracts page number (usually numeric, in corners/bottom)
   */
  private static extractPageNumber(blocks: OCRResult[]): { value: number; confidence: number } | null {
    const pageNumRegex = /^p\.?\s*(\d+)$|^(\d+)$/i;

    for (const block of blocks) {
      const match = block.text.trim().match(pageNumRegex);
      if (match) {
        const num = parseInt(match[1] || match[2]);
        if (num > 0 && num < 1000) {
          return { value: num, confidence: block.confidence };
        }
      }
    }

    return null;
  }

  /**
   * Extracts ingredients list
   */
  private static extractIngredients(blocks: OCRResult[]): Ingredient[] {
    const ingredients: Ingredient[] = [];
    let inSection = false;
    let sectionStartIndex = -1;

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];

      // Check if we're entering ingredients section
      if (this.isIngredientsHeader(block.text)) {
        inSection = true;
        sectionStartIndex = i;
        continue;
      }

      // Check if we're leaving ingredients section
      if (inSection && this.isInstructionsHeader(block.text)) {
        break;
      }

      if (inSection) {
        // Parse ingredient line
        const cleaned = block.text.replace(/^[-•*\d.)\s]+/, '').trim();
        if (cleaned.length > 0 && !this.isSectionHeader(block.text)) {
          ingredients.push({
            text: cleaned,
            confidence: block.confidence,
          });
        }
      }
    }

    // If no "Ingredients" header found, try to detect bulleted lists
    if (ingredients.length === 0) {
      for (const block of blocks) {
        if (this.isBulletedItem(block.text) && !this.isSectionHeader(block.text)) {
          const cleaned = block.text.replace(/^[-•*\d.)\s]+/, '').trim();
          if (cleaned.length > 3) {
            ingredients.push({
              text: cleaned,
              confidence: block.confidence,
            });
          }
        }
      }
    }

    return ingredients;
  }

  /**
   * Extracts instructions/directions
   */
  private static extractInstructions(blocks: OCRResult[]): Instruction[] {
    const instructions: Instruction[] = [];
    let inSection = false;

    for (const block of blocks) {
      // Check if we're entering instructions section
      if (this.isInstructionsHeader(block.text)) {
        inSection = true;
        continue;
      }

      if (inSection) {
        // Check for numbered step
        const stepMatch = block.text.match(/^(\d+)\.\s*(.+)$/);
        if (stepMatch) {
          instructions.push({
            stepNumber: parseInt(stepMatch[1]),
            text: stepMatch[2].trim(),
            confidence: block.confidence,
          });
        } else if (block.text.length > 10 && !this.isSectionHeader(block.text)) {
          // Paragraph-style instruction
          instructions.push({
            text: block.text,
            confidence: block.confidence,
          });
        }
      }
    }

    return instructions;
  }

  /**
   * Extracts cooking techniques (if mentioned)
   */
  private static extractTechniques(blocks: OCRResult[]): Technique[] {
    const techniques: Technique[] = [];
    const techniqueKeywords = [
      'technique', 'method', 'tip', 'note', 'chef\'s note',
      'cooking tip', 'pro tip'
    ];

    for (const block of blocks) {
      const lowerText = block.text.toLowerCase();
      for (const keyword of techniqueKeywords) {
        if (lowerText.includes(keyword)) {
          techniques.push({
            name: keyword,
            description: block.text,
            confidence: block.confidence,
          });
          break;
        }
      }
    }

    return techniques;
  }

  /**
   * Helper: Check if text is a page number
   */
  private static isPageNumber(text: string): boolean {
    return /^\d+$/.test(text.trim()) && text.trim().length <= 3;
  }

  /**
   * Helper: Check if text is a section header
   */
  private static isSectionHeader(text: string): boolean {
    const headers = /^(ingredients?|instructions?|directions?|method|preparation|serves?|yield|time|notes?)/i;
    return headers.test(text.trim());
  }

  /**
   * Helper: Check if text starts with "Ingredients"
   */
  private static isIngredientsHeader(text: string): boolean {
    return /^ingredients?/i.test(text.trim());
  }

  /**
   * Helper: Check if text starts with "Instructions" or similar
   */
  private static isInstructionsHeader(text: string): boolean {
    return /^(instructions?|directions?|method|preparation)/i.test(text.trim());
  }

  /**
   * Helper: Check if text is a bulleted item
   */
  private static isBulletedItem(text: string): boolean {
    return /^[-•*\d.)\s]/.test(text);
  }

  /**
   * Helper: Sort OCR results by vertical position
   */
  private static sortByVerticalPosition(results: OCRResult[]): OCRResult[] {
    return [...results].sort((a, b) => a.boundingBox.y - b.boundingBox.y);
  }
}

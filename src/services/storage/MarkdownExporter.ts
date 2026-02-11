import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Scan, Recipe } from '../../types';
import { Config } from '../../constants/config';

export class MarkdownExporter {
  /**
   * Exports a scan to a markdown file and shares it
   */
  static async exportScan(scan: Scan): Promise<string> {
    const markdown = this.generateMarkdown(scan);
    const filePath = await this.writeToFile(scan.id, scan.name, markdown);
    return filePath;
  }

  /**
   * Shares the exported markdown file
   */
  static async shareMarkdown(filePath: string): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath);
    } else {
      throw new Error('Sharing is not available on this device');
    }
  }

  /**
   * Generates markdown content from a scan
   */
  static generateMarkdown(scan: Scan): string {
    let markdown = `# ${scan.name}\n\n`;

    // Add metadata
    if (scan.metadata.cookbookTitle) {
      markdown += `**Source:** ${scan.metadata.cookbookTitle}\n`;
    }
    if (scan.metadata.author) {
      markdown += `**Author:** ${scan.metadata.author}\n`;
    }
    if (scan.metadata.notes) {
      markdown += `**Notes:** ${scan.metadata.notes}\n`;
    }

    markdown += `\n**Scanned:** ${new Date(scan.createdAt).toLocaleDateString()}\n`;
    markdown += `**Total Pages:** ${scan.totalPages}\n`;

    markdown += `\n---\n\n`;

    // Add recipes
    const allRecipes: Recipe[] = [];
    for (const page of scan.pages) {
      allRecipes.push(...page.recipes);
    }

    if (allRecipes.length === 0) {
      markdown += `*No recipes found in this scan*\n`;
    } else {
      for (const recipe of allRecipes) {
        markdown += this.formatRecipe(recipe);
      }
    }

    markdown += `\n---\n\n`;
    markdown += `*Generated with Shelf - Cookbook Scanner*\n`;

    return markdown;
  }

  /**
   * Formats a single recipe as markdown
   */
  private static formatRecipe(recipe: Recipe): string {
    let md = `## ${recipe.title}\n\n`;

    // Add page reference
    if (recipe.pageNumber) {
      md += `*Page ${recipe.pageNumber}*\n\n`;
    }

    // Add ingredients
    if (recipe.ingredients.length > 0) {
      md += `### Ingredients\n\n`;
      for (const ing of recipe.ingredients) {
        md += `- ${ing.text}`;
        // Add confidence comment for low confidence items
        if (ing.confidence < 0.8) {
          md += ` <!-- confidence: ${(ing.confidence * 100).toFixed(0)}% -->`;
        }
        md += `\n`;
      }
      md += `\n`;
    }

    // Add instructions
    if (recipe.instructions.length > 0) {
      md += `### Instructions\n\n`;
      for (let i = 0; i < recipe.instructions.length; i++) {
        const inst = recipe.instructions[i];
        const stepNum = inst.stepNumber || (i + 1);
        md += `${stepNum}. ${inst.text}`;
        // Add confidence comment for low confidence items
        if (inst.confidence < 0.8) {
          md += ` <!-- confidence: ${(inst.confidence * 100).toFixed(0)}% -->`;
        }
        md += `\n\n`;
      }
    }

    // Add techniques if present
    if (recipe.techniques && recipe.techniques.length > 0) {
      md += `### Techniques\n\n`;
      for (const tech of recipe.techniques) {
        md += `**${tech.name}:** ${tech.description}\n\n`;
      }
    }

    md += `---\n\n`;
    return md;
  }

  /**
   * Writes markdown to a file in the exports directory
   */
  private static async writeToFile(scanId: string, scanName: string, markdown: string): Promise<string> {
    // Create exports directory if it doesn't exist
    const exportsDir = `${FileSystem.documentDirectory}${Config.exportsDirectory}/`;
    const dirInfo = await FileSystem.getInfoAsync(exportsDir);

    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(exportsDir, { intermediates: true });
    }

    // Create filename
    const sanitizedName = scanName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().getTime();
    const fileName = `${sanitizedName}_${timestamp}.md`;
    const filePath = exportsDir + fileName;

    // Write file
    await FileSystem.writeAsStringAsync(filePath, markdown);

    return filePath;
  }

  /**
   * Gets the exports directory path
   */
  static getExportsDirectory(): string {
    return `${FileSystem.documentDirectory}${Config.exportsDirectory}/`;
  }

  /**
   * Lists all exported markdown files
   */
  static async listExports(): Promise<string[]> {
    const exportsDir = this.getExportsDirectory();
    const dirInfo = await FileSystem.getInfoAsync(exportsDir);

    if (!dirInfo.exists) {
      return [];
    }

    const files = await FileSystem.readDirectoryAsync(exportsDir);
    return files.filter(f => f.endsWith('.md'));
  }
}

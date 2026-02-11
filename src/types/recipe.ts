export interface Recipe {
  id: string;
  pageId: string;
  title: string;
  titleConfidence: number;
  pageNumber?: number;
  pageNumberConfidence?: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  techniques?: Technique[];
  rawMarkdown: string;
}

export interface Ingredient {
  text: string;
  confidence: number;
  quantity?: string;
  unit?: string;
  item?: string;
}

export interface Instruction {
  stepNumber?: number;
  text: string;
  confidence: number;
}

export interface Technique {
  name: string;
  description: string;
  confidence: number;
}

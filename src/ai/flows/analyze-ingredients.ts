'use server';

/**
 * @fileOverview An AI agent that analyzes a food's ingredient list from an image.
 *
 * - analyzeIngredients - A function that handles the ingredient analysis process.
 * - AnalyzeIngredientsInput - The input type for the analyzeIngredients function.
 * - AnalyzeIngredientsOutput - The return type for the analyzeIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeIngredientsInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a food's ingredient list, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().optional().describe('The language for the AI to respond in (e.g., "English", "Hindi", "Kannada").'),
});
export type AnalyzeIngredientsInput = z.infer<typeof AnalyzeIngredientsInputSchema>;

const IngredientSchema = z.object({
    name: z.string().describe("The name of the ingredient."),
    isGood: z.boolean().describe("Whether the ingredient is generally considered healthy."),
    reason: z.string().describe("A brief explanation of why the ingredient is good or bad.")
});

const AnalyzeIngredientsOutputSchema = z.object({
    healthScore: z.number().min(0).max(100).describe("A health score from 0 (unhealthy) to 100 (very healthy) based on the ingredients."),
    summary: z.string().describe("A 2-3 sentence summary of the overall healthiness of the food product."),
    ingredients: z.array(IngredientSchema).describe("A list of the most important ingredients found and their analysis."),
});
export type AnalyzeIngredientsOutput = z.infer<typeof AnalyzeIngredientsOutputSchema>;

export async function analyzeIngredients(input: AnalyzeIngredientsInput): Promise<AnalyzeIngredientsOutput> {
  return analyzeIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeIngredientsPrompt',
  input: {schema: AnalyzeIngredientsInputSchema},
  output: {schema: AnalyzeIngredientsOutputSchema},
  prompt: `You are an expert food scientist and nutritionist. Your task is to analyze the ingredients of a food product from an image provided by a user.

**CRITICAL: You MUST respond entirely in the following language: {{{language}}}. All text fields in your response must be in this language.**

**Analysis Plan:**
1.  **Identify Ingredients:** Carefully read the ingredient list from the provided image.
2.  **Evaluate Key Ingredients:** Identify the most significant ingredients (e.g., first 5-7 ingredients, plus any notable additives like artificial sweeteners, preservatives, or hydrogenated oils).
3.  **Categorize Ingredients:** For each key ingredient, determine if it is generally "good" (e.g., whole grains, natural fruits) or "bad" (e.g., high fructose corn syrup, artificial colors, trans fats). Provide a brief, simple reason for your classification.
4.  **Calculate Health Score:** Based on the overall ingredient profile, assign a health score from 0 (very unhealthy) to 100 (very healthy). A higher score means healthier. Consider factors like the presence of whole foods vs. processed ingredients, sugar content (implied by ingredient order), types of fats, and number of chemical-sounding additives.
5.  **Write Summary:** Provide a concise, 2-3 sentence summary that explains the health score and gives an overall verdict on the product's healthiness.

**Input Image:**
{{media url=imageDataUri}}

Begin analysis.
`,
});

const analyzeIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzeIngredientsFlow',
    inputSchema: AnalyzeIngredientsInputSchema,
    outputSchema: AnalyzeIngredientsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

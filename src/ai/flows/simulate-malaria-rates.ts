
'use server';

/**
 * @fileOverview An AI agent that simulates malaria case rates for Indian districts.
 *
 * - simulateMalariaRates - A function that handles the malaria case rate simulation.
 * - SimulateMalariaRatesInput - The input type for the simulateMalariaRates function.
 * - SimulateMalariaRatesOutput - The return type for the simulateMalariaRates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateMalariaRatesInputSchema = z.object({
  state: z.string().describe('The Indian state to simulate data for.'),
  district: z.string().describe('The district within the state to simulate data for.'),
  year1: z.number().describe('The first year for the simulation.'),
  year2: z.number().optional().describe('The optional second year for comparison.'),
  compareState: z.string().optional().describe('An optional second state for comparison.'),
  compareDistrict: z.string().optional().describe('An optional second district for comparison.'),
  language: z.string().optional().describe('The language for the AI to respond in (e.g., "English", "Hindi", "Kannada").'),
});
export type SimulateMalariaRatesInput = z.infer<typeof SimulateMalariaRatesInputSchema>;

const SimulateMalariaRatesOutputSchema = z.object({
  disclaimer: z.string().describe("A mandatory disclaimer stating that the data is AI-generated and not real-world statistics."),
  simulation: z.object({
    district: z.string(),
    state: z.string(),
    year1: z.object({
      year: z.number(),
      simulatedCases: z.number().describe("Simulated number of malaria cases for the first year."),
      caseRate: z.number().describe("Simulated case rate per 1,000 population for the first year."),
      intensity: z.enum(["Low", "Moderate", "High", "Very High"]).describe("A qualitative measure of malaria intensity."),
    }),
    year2: z.object({
      year: z.number(),
      simulatedCases: z.number().describe("Simulated number of malaria cases for the second year."),
      caseRate: z.number().describe("Simulated case rate per 1,000 population for the second year."),
      intensity: z.enum(["Low", "Moderate", "High", "Very High"]).describe("A qualitative measure of malaria intensity."),
    }).optional(),
  }),
  comparison: z.object({
    analysis: z.string().describe("A 4-6 sentence comparative analysis of the malaria rates between the selected years or regions."),
    healthTip: z.string().describe("A practical, actionable health or prevention tip related to malaria."),
  }),
  comparisonRegion: z.object({
    district: z.string(),
    state: z.string(),
    year1: z.object({
      year: z.number(),
      simulatedCases: z.number().describe("Simulated cases for the comparison region's first year."),
      caseRate: z.number().describe("Simulated case rate for the comparison region's first year."),
      intensity: z.enum(["Low", "Moderate", "High", "Very High"]),
    }),
     year2: z.object({
      year: z.number(),
      simulatedCases: z.number().describe("Simulated cases for the comparison region's second year."),
      caseRate: z.number().describe("Simulated case rate for the comparison region's second year."),
      intensity: z.enum(["Low", "Moderate", "High", "Very High"]),
    }).optional(),
  }).optional(),
});
export type SimulateMalariaRatesOutput = z.infer<typeof SimulateMalariaRatesOutputSchema>;


export async function simulateMalariaRates(
  input: SimulateMalariaRatesInput
): Promise<SimulateMalariaRatesOutput> {
  return simulateMalariaRatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateMalariaRatesPrompt',
  input: {schema: SimulateMalariaRatesInputSchema},
  output: {schema: SimulateMalariaRatesOutputSchema},
  prompt: `You are a public health data scientist AI. Your task is to generate a realistic but **simulated** dataset for malaria case rates in a specified district in India. You will also provide a brief comparative analysis.

**CRITICAL: You MUST respond in the following language: {{{language}}}. All text fields in your response (disclaimer, analysis, healthTip) must be in this language.**

**Constraint Checklist & Confidence Score:**
1. Generate a disclaimer: YES
2. Simulate data for primary region (year 1): YES
3. Simulate data for primary region (year 2, if provided): YES
4. Simulate data for comparison region (if provided): YES
5. Provide a 4-6 sentence analysis: YES
6. Provide a practical health tip: YES
7. Respond entirely in the specified language: YES

Confidence Score: 5/5

**Mental Sandbox:**
- The user wants to see a simulation, not real data. I must always start with the disclaimer, translated to the target language.
- The simulation should be plausible. I will use a baseline rate and apply modifiers for factors like geography, climate, and year. For example, coastal or forested districts might have higher rates. Rates might decrease over time due to public health interventions, but I can introduce fluctuations.
- The comparison needs to be insightful. If comparing years, I'll talk about trends. If comparing regions, I'll highlight differences in intensity and suggest possible simulated reasons. This analysis must be in the target language.
- The health tip must be actionable, concise, and in the target language.

**Key Instructions:**
1.  **Language First:** All generated text output (disclaimer, analysis, healthTip) MUST be in the language specified by the 'language' input parameter.
2.  **Disclaimer First:** ALWAYS begin your output with the disclaimer: "All data represent AI-generated simulations for educational and public-health awareness purposes, not real-world statistics." This must be translated.
3.  **Simulate Data:** For the given state and district, generate plausible malaria data for the specified year(s). The simulation should produce a number of cases, a case rate per 1,000, and a qualitative intensity level.
4.  **Perform Comparison:**
    - If a year2 is provided, generate data for that year and write a brief analysis comparing the trends between year1 and year2 for the primary district.
    - If compareState and compareDistrict are provided, generate data for that region for the selected year(s) and write an analysis comparing the two regions.
5.  **Analysis and Tip:** The comparative analysis must be between 4 and 6 sentences. Conclude with a practical health or prevention tip related to malaria. All this text must be in the requested language.

**Input for Simulation:**
- Language for Response: {{{language}}}
- Primary Region: {{{district}}}, {{{state}}}
- Year 1: {{{year1}}}
{{#if year2}}
- Year 2: {{{year2}}}
{{/if}}
{{#if compareDistrict}}
- Comparison Region: {{{compareDistrict}}}, {{{compareState}}}
{{/if}}
`,
});

const simulateMalariaRatesFlow = ai.defineFlow(
  {
    name: 'simulateMalariaRatesFlow',
    inputSchema: SimulateMalariaRatesInputSchema,
    outputSchema: SimulateMalariaRatesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

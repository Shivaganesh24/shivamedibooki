
'use server';

/**
 * @fileOverview An AI agent that simulates disease case rates for Indian districts.
 *
 * - simulateDiseaseRates - A function that handles the disease case rate simulation.
 * - SimulateDiseaseRatesInput - The input type for the simulateDiseaseRates function.
 * - SimulateDiseaseRatesOutput - The return type for the simulateDiseaseRates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateDiseaseRatesInputSchema = z.object({
  disease: z.string().describe('The disease to simulate data for (e.g., Malaria, Dengue).'),
  state: z.string().describe('The Indian state to simulate data for.'),
  district: z.string().describe('The district within the state to simulate data for.'),
  year1: z.number().describe('The first year for the simulation.'),
  year2: z.number().optional().describe('The optional second year for comparison.'),
  compareState: z.string().optional().describe('An optional second state for comparison.'),
  compareDistrict: z.string().optional().describe('An optional second district for comparison.'),
  language: z.string().optional().describe('The language for the AI to respond in (e.g., "English", "Hindi", "Kannada").'),
});
export type SimulateDiseaseRatesInput = z.infer<typeof SimulateDiseaseRatesInputSchema>;

const yearSimulationSchema = z.object({
  year: z.number(),
  simulatedCases: z.number().describe("Simulated number of disease cases for the year."),
  caseRate: z.number().describe("Simulated case rate per 1,000 population for the year."),
  simulatedDeaths: z.number().describe("Simulated number of deaths from the disease."),
  deathRate: z.number().describe("Simulated death rate per 1,000 population."),
  intensity: z.enum(["Low", "Moderate", "High", "Very High"]).describe("A qualitative measure of disease intensity."),
});

const SimulateDiseaseRatesOutputSchema = z.object({
  disclaimer: z.string().describe("A mandatory disclaimer stating that the data is AI-generated and not real-world statistics."),
  simulation: z.object({
    district: z.string(),
    state: z.string(),
    year1: yearSimulationSchema,
    year2: yearSimulationSchema.optional(),
  }),
  comparison: z.object({
    analysis: z.string().describe("A 4-6 sentence comparative analysis of the disease rates between the selected years or regions."),
    healthTip: z.string().describe("A practical, actionable health or prevention tip related to the disease."),
  }),
  comparisonRegion: z.object({
    district: z.string(),
    state: z.string(),
    year1: yearSimulationSchema,
     year2: yearSimulationSchema.optional(),
  }).optional(),
});
export type SimulateDiseaseRatesOutput = z.infer<typeof SimulateDiseaseRatesOutputSchema>;


export async function simulateDiseaseRates(
  input: SimulateDiseaseRatesInput
): Promise<SimulateDiseaseRatesOutput> {
  return simulateDiseaseRatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateDiseaseRatesPrompt',
  input: {schema: SimulateDiseaseRatesInputSchema},
  output: {schema: SimulateDiseaseRatesOutputSchema},
  prompt: `You are a public health data scientist AI. Your task is to generate a realistic but **simulated** dataset for a specific disease's case rates in a specified district in India. You will also provide a brief comparative analysis.

**CRITICAL: You MUST respond in the following language: {{{language}}}. All text fields in your response (disclaimer, analysis, healthTip) must be in this language.**

**Constraint Checklist & Confidence Score:**
1. Generate a disclaimer: YES
2. Simulate data for primary region (year 1): YES
3. Simulate data for primary region (year 2, if provided): YES
4. **IMPORTANT**: Only simulate data for a comparison region if 'compareDistrict' is provided. If it is not, the 'comparisonRegion' field must be omitted from the output.
5. Provide a 4-6 sentence analysis: YES
6. Provide a practical health tip related to the specified disease: YES
7. Respond entirely in the specified language: YES
8. Handle special testing cases: YES
9. Include simulated deaths and death rate: YES

Confidence Score: 5/5

**Mental Sandbox:**
- The user wants to see a simulation for {{{disease}}}, not real data. I must always start with the disclaimer, translated to the target language.
- **Testing Rule**: If the state is 'Odisha' or 'Goa' and the disease is 'Malaria', I must set the intensity to 'High' or 'Very High'. This is for testing the alert system. I will generate numbers that correspond to this high intensity. For other diseases, I will use plausible intensity based on geographic and environmental factors.
- The simulation should be plausible. I will use a baseline rate for {{{disease}}} and apply modifiers for factors like geography, climate, and year. For example, vector-borne diseases like Dengue and Malaria will have higher simulated rates in coastal or forested districts, especially during monsoon seasons. Respiratory illnesses like Influenza might be higher in dense urban areas during winter.
- I need to add death metrics. I will simulate a plausible number of deaths based on the number of cases and the typical severity of {{{disease}}}, then calculate a death rate per 1,000 people.
- The comparison needs to be insightful. If comparing years, I'll talk about trends. If comparing regions, I'll highlight differences in intensity and suggest possible simulated reasons. This analysis must be in the target language and specific to {{{disease}}}.
- The health tip must be actionable, concise, and specific to preventing {{{disease}}}. All this text must be in the target language.

**Key Instructions:**
1.  **Language First:** All generated text output (disclaimer, analysis, healthTip) MUST be in the language specified by the 'language' input parameter.
2.  **Disclaimer First:** ALWAYS begin your output with the disclaimer: "All data represent AI-generated simulations for educational and public-health awareness purposes, not real-world statistics." This must be translated.
3.  **TESTING SCENARIO:** If the provided state is 'Odisha' or 'Goa' AND the disease is 'Malaria', you MUST generate data that results in an 'intensity' of 'High' or 'Very High'. This is a mandatory requirement for testing purposes.
4.  **Simulate Data:** For the given disease, state, and district, generate plausible data for the specified year(s). The simulation must include:
    - 'simulatedCases': Total number of cases for {{{disease}}}.
    - 'caseRate': Cases per 1,000 people.
    - 'simulatedDeaths': Total number of deaths. This should be a small, plausible fraction of the cases, appropriate for {{{disease}}}.
    - 'deathRate': Deaths per 1,000 people.
    - 'intensity': Qualitative level (Low, Moderate, High, Very High) based on the simulated data for {{{disease}}}.
5.  **Perform Comparison:**
    - If a 'year2' is provided, generate data for that year for the primary district.
    - **If and ONLY IF** 'compareDistrict' and 'compareState' are provided, generate simulated data for that comparison region for the specified year(s). Otherwise, DO NOT include the 'comparisonRegion' object in your output.
    - Write a brief analysis comparing the trends between the selected years and/or regions for {{{disease}}}.
6.  **Analysis and Tip:** The comparative analysis must be between 4 and 6 sentences. Conclude with a practical health or prevention tip related to {{{disease}}}. All this text must be in the requested language.

**Input for Simulation:**
- Disease: {{{disease}}}
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

const simulateDiseaseRatesFlow = ai.defineFlow(
  {
    name: 'simulateDiseaseRatesFlow',
    inputSchema: SimulateDiseaseRatesInputSchema,
    outputSchema: SimulateDiseaseRatesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

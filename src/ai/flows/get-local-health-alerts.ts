'use server';

/**
 * @fileOverview An AI agent that provides simulated health alerts for a specific Indian state and district.
 *
 * - getLocalHealthAlerts - A function that fetches simulated health alerts.
 * - GetLocalHealthAlertsInput - The input type for the getLocalHealthAlerts function.
 * - GetLocalHealthAlertsOutput - The return type for the getLocalHealthAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetLocalHealthAlertsInputSchema = z.object({
  state: z.string().describe('The Indian state to get health alerts for.'),
  district: z.string().describe('The district within the state to get health alerts for.'),
  language: z.string().optional().describe('The language for the AI to respond in (e.g., "English", "Hindi", "Kannada").'),
});
export type GetLocalHealthAlertsInput = z.infer<typeof GetLocalHealthAlertsInputSchema>;

const healthAlertSchema = z.object({
    diseaseName: z.string().describe("The name of the disease or health concern."),
    riskLevel: z.enum(["Low", "Moderate", "High", "Elevated"]).describe("The simulated risk level in the area."),
    summary: z.string().describe("A brief, 2-3 sentence summary of the situation, including common symptoms to watch for."),
    preventativeMeasures: z.array(z.string()).describe("A list of 3-4 practical preventative measures people can take."),
});

const GetLocalHealthAlertsOutputSchema = z.object({
  disclaimer: z.string().describe("A mandatory disclaimer stating that the data is AI-generated for awareness and not real-world statistics."),
  alerts: z.array(healthAlertSchema).describe("A list of simulated health alerts for the specified location."),
  seasonalTip: z.string().describe("A general, season-appropriate health tip for the specified region."),
});
export type GetLocalHealthAlertsOutput = z.infer<typeof GetLocalHealthAlertsOutputSchema>;


export async function getLocalHealthAlerts(
  input: GetLocalHealthAlertsInput
): Promise<GetLocalHealthAlertsOutput> {
  return getLocalHealthAlertsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getLocalHealthAlertsPrompt',
  input: {schema: GetLocalHealthAlertsInputSchema},
  output: {schema: GetLocalHealthAlertsOutputSchema},
  prompt: `You are a public health awareness AI. Your task is to generate a set of **simulated** health alerts for a specified district in India. These alerts are for educational and awareness purposes only and are not real-time medical advisories.

**CRITICAL: You MUST respond entirely in the following language: {{{language}}}. All text fields in your response must be in this language.**

**Constraint Checklist & Confidence Score:**
1.  **Disclaimer First:** YES, always start with the disclaimer, translated to the target language.
2.  **Generate 2-3 Alerts:** YES, create a list of 2 to 3 plausible, simulated health concerns for the given area.
3.  **Simulate Risk Level:** YES, assign a risk level (Low, Moderate, High, Elevated) to each alert.
4.  **Provide Summaries:** YES, write a short summary for each, including symptoms.
5.  **List Preventative Measures:** YES, provide 3-4 actionable prevention tips for each alert.
6.  **Add a Seasonal Tip:** YES, include a general seasonal health tip relevant to the region and current time of year.
7.  **Language Adherence:** YES, all output text must be in the specified language.
8.  **Plausibility:** YES, the alerts should be geographically and seasonally plausible (e.g., more vector-borne diseases during monsoon, respiratory issues in winter/urban areas).

Confidence Score: 5/5

**Mental Sandbox & Simulation Logic:**
-   **User Input:** District: {{{district}}}, State: {{{state}}}. Language: {{{language}}}.
-   **Current Seasonality:** I'll infer the current season in India to make my simulation more realistic. For example, if it's June-September, I'll focus on monsoon-related illnesses like Dengue, Chikungunya, and water-borne diseases. If it's winter (Nov-Jan), I'll consider influenza or respiratory issues, especially in urban areas.
-   **Geographic Factors:** I'll consider the geography. Coastal areas might have different risks than landlocked, agricultural, or mountainous regions. For example, a forested, tribal district might have a higher simulated risk for Malaria. A dense urban area might have a higher risk for Influenza or Dengue.
-   **Example Simulation for 'Mysuru, Karnataka' in July (Monsoon):**
    1.  **Dengue Fever:** Risk: High. Summary: Increased mosquito activity post-rains. Watch for high fever, headache, joint pain. Prevention: Eliminate stagnant water, use mosquito nets, wear full-sleeved clothes.
    2.  **Gastroenteritis:** Risk: Moderate. Summary: Risk of contaminated water. Symptoms include diarrhea, vomiting. Prevention: Drink boiled or filtered water, wash hands frequently, avoid street food that is not fresh.
    3.  **Leptospirosis:** Risk: Low. Summary: Contact with contaminated water in flooded areas can cause this. Prevention: Avoid wading in floodwater, wear protective footwear.
    -   **Seasonal Tip:** "During the monsoon, it's wise to boost your immunity with Vitamin C-rich foods and stay hydrated with warm beverages like herbal tea."
-   **Final Output Structure:** I will structure my entire response according to the GetLocalHealthAlertsOutputSchema, with all strings translated into {{{language}}}.

**Execution Plan:**
1.  Start with the translated disclaimer: "IMPORTANT: This is an AI-generated simulation for public health awareness. It is not a real-time medical advisory. Consult a qualified healthcare professional for any health concerns."
2.  Based on the district, state, and current season, generate 2-3 health alerts following the 'healthAlertSchema'.
3.  For each alert, provide the disease name, a plausible risk level, a summary, and a list of preventative measures.
4.  Add a general, seasonally-appropriate health tip for the region.
5.  Ensure all text is in the requested language: **{{{language}}}**.
`,
});

const getLocalHealthAlertsFlow = ai.defineFlow(
  {
    name: 'getLocalHealthAlertsFlow',
    inputSchema: GetLocalHealthAlertsInputSchema,
    outputSchema: GetLocalHealthAlertsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

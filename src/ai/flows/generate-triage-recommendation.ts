'use server';

/**
 * @fileOverview An AI agent that provides a triage recommendation based on user-provided symptoms, an optional image, and an optional medical report.
 *
 * - generateTriageRecommendation - A function that generates a triage recommendation.
 * - GenerateTriageRecommendationInput - The input type for the generateTriageRecommendation function.
 * - GenerateTriageRecommendationOutput - The return type for the generateTriageRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTriageRecommendationInputSchema = z.object({
  symptoms: z.string().describe('A description of the symptoms experienced by the user.'),
  symptomImage: z
    .string()
    .optional()
    .describe(
      "An optional image of the symptoms, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  medicalReport: z
    .string()
    .optional()
    .describe(
      "An optional medical report (PDF or image), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateTriageRecommendationInput = z.infer<typeof GenerateTriageRecommendationInputSchema>;

const GenerateTriageRecommendationOutputSchema = z.object({
  severity: z.string().describe('The severity of the condition (e.g., mild, moderate, severe).'),
  suggestedAction: z.string().describe('The suggested action to take (e.g., rest, see a doctor, go to the emergency room).'),
  summary: z.string().describe('A summary of the condition and the recommendation.'),
  suggestedDoctors: z.array(z.string()).describe('A list of suggested doctor specialties based on the triage recommendation.'),
});
export type GenerateTriageRecommendationOutput = z.infer<typeof GenerateTriageRecommendationOutputSchema>;

export async function generateTriageRecommendation(
  input: GenerateTriageRecommendationInput
): Promise<GenerateTriageRecommendationOutput> {
  return generateTriageRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTriageRecommendationPrompt',
  input: {schema: GenerateTriageRecommendationInputSchema},
  output: {schema: GenerateTriageRecommendationOutputSchema},
  prompt: `You are an AI-powered health assistant that provides triage recommendations based on user-provided information.

You will receive a description of the user's symptoms, an optional image of the symptoms, and an optional medical report.
Based on this information, you will provide a triage recommendation, including the severity of the condition, the suggested action to take, and a summary of the condition and the recommendation. You will also suggest relevant doctor specialities for the user to see.

Symptoms: {{{symptoms}}}

{{#if symptomImage}}
Symptom Image: {{media url=symptomImage}}
{{/if}}

{{#if medicalReport}}
Medical Report: {{media url=medicalReport}}
{{/if}}

Your recommendation should be structured as follows:

Severity: <severity>
Suggested Action: <suggested action>
Summary: <summary>
Suggested Doctors: <list of doctor specialities> `,
});

const generateTriageRecommendationFlow = ai.defineFlow(
  {
    name: 'generateTriageRecommendationFlow',
    inputSchema: GenerateTriageRecommendationInputSchema,
    outputSchema: GenerateTriageRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

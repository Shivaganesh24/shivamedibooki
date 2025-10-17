
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
  isAyurvedaMode: z.boolean().optional().describe('Whether to provide recommendations based on Ayurvedic principles.'),
  language: z.string().optional().describe('The language for the AI to respond in (e.g., "English", "Hindi", "Kannada").'),
});
export type GenerateTriageRecommendationInput = z.infer<typeof GenerateTriageRecommendationInputSchema>;

const GenerateTriageRecommendationOutputSchema = z.object({
  severity: z.string().describe('The severity of the condition (e.g., mild, moderate, severe).'),
  suggestedAction: z.string().describe('The suggested action to take (e.g., rest, see a doctor, go to the emergency room).'),
  summary: z.string().describe('A summary of the condition and the recommendation.'),
  detectedDisease: z.string().describe('The name of the potential disease or condition detected from the symptoms.'),
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
  prompt: `
{{#if language}}
You MUST respond in the following language: {{{language}}}.
{{/if}}

{{#if isAyurvedaMode}}
You are an AI-powered Ayurvedic health consultant. Your goal is to provide a preliminary triage recommendation based on Ayurvedic principles (doshas, agni, etc.).

You will receive a description of the user's symptoms, and optionally an image and a medical report.
Based on this information, you will provide a triage recommendation from an Ayurvedic perspective, including:
- Severity: The perceived severity of the imbalance (e.g., Mild, Moderate, Severe).
- Suggested Action: Ayurvedic lifestyle or home remedy suggestions (e.g., dietary changes, herbal teas, rest, consult a Vaidya).
- Summary: An explanation of the possible doshic imbalance and what the symptoms might indicate according to Ayurveda.
- Detected Disease: The Ayurvedic name for the condition or imbalance.
- Suggested Practitioners: A list of relevant practitioner types (e.g., Ayurvedic Doctor, Panchakarma Therapist).

{{else}}
You are an AI-powered health assistant that provides triage recommendations based on user-provided information.

You will receive a description of the user's symptoms, an optional image of the symptoms, and an optional medical report.
Based on this information, you will provide a triage recommendation, including the severity of the condition, the suggested action to take, a summary of the condition and the recommendation, the detected disease, and a list of relevant doctor specialities for the user to see from the following list: [Cardiology, Dermatology, Neurology, General].
{{/if}}

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
Detected Disease: <detected disease>
Suggested Doctors: <list of doctor specialities or practitioner types>`,
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

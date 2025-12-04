'use server';

/**
 * @fileOverview An AI agent that analyzes a user's yoga pose from an image.
 *
 * - analyzePose - A function that handles the pose analysis process.
 * - AnalyzePoseInput - The input type for the analyzePose function.
 * - AnalyzePoseOutput - The return type for the analyzePose function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePoseInputSchema = z.object({
  poseImage: z
    .string()
    .describe(
      "A photo of the user performing a yoga pose, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  poseName: z.string().describe('The name of the yoga pose the user is attempting (e.g., "Warrior II", "Tree Pose").'),
  language: z.string().optional().describe('The language for the AI to respond in (e.g., "English", "Hindi", "Kannada").'),
});
export type AnalyzePoseInput = z.infer<typeof AnalyzePoseInputSchema>;

const CorrectionTipSchema = z.object({
    area: z.string().describe("The body part or area that needs correction (e.g., 'Arms', 'Front Knee', 'Spine')."),
    feedback: z.string().describe("Specific, actionable feedback for correcting that area."),
});

const AnalyzePoseOutputSchema = z.object({
    accuracyScore: z.number().min(0).max(100).describe("An accuracy score from 0 (poor form) to 100 (perfect form) based on the analysis."),
    summary: z.string().describe("A 2-3 sentence summary of the user's overall form and the most important thing to focus on."),
    corrections: z.array(CorrectionTipSchema).describe("A list of specific corrections for the user to improve their pose. Provide up to 3-4 of the most important corrections."),
});
export type AnalyzePoseOutput = z.infer<typeof AnalyzePoseOutputSchema>;

export async function analyzePose(input: AnalyzePoseInput): Promise<AnalyzePoseOutput> {
  return analyzePoseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePosePrompt',
  input: {schema: AnalyzePoseInputSchema},
  output: {schema: AnalyzePoseOutputSchema},
  prompt: `You are an expert yoga instructor. Your task is to analyze a user's yoga pose from an image and provide constructive, actionable feedback.

**CRITICAL: You MUST respond entirely in the following language: {{{language}}}. All text fields in your response must be in this language.**

**Analysis Plan:**
1.  **Identify the Pose:** The user is attempting to do the **'{{{poseName}}}'** pose.
2.  **Analyze the Form:** Carefully examine the user's posture in the provided image. Compare it to the ideal form for '{{{poseName}}}'. Look at key alignment points: feet, knees, hips, spine, shoulders, and arms.
3.  **Calculate Accuracy Score:** Assign an accuracy score from 0 to 100 based on how well the user is executing the pose. 100 is perfect alignment. 0 is a completely incorrect form.
4.  **Provide Key Corrections:** Identify the 3-4 most critical corrections the user needs to make. For each correction, specify the body area and provide a simple, clear, and encouraging instruction.
5.  **Write a Summary:** Give a brief, encouraging summary of their performance, highlighting one main point of focus for improvement.

**User's Pose Image:**
{{media url=poseImage}}

Begin analysis.
`,
});

const analyzePoseFlow = ai.defineFlow(
  {
    name: 'analyzePoseFlow',
    inputSchema: AnalyzePoseInputSchema,
    outputSchema: AnalyzePoseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

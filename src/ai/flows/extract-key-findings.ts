'use server';

/**
 * @fileOverview An AI agent to extract key findings from medical reports.
 *
 * - extractKeyFindings - A function that handles the extraction of key findings from a medical report.
 * - ExtractKeyFindingsInput - The input type for the extractKeyFindings function.
 * - ExtractKeyFindingsOutput - The return type for the extractKeyFindings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractKeyFindingsInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      'The medical report file as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type ExtractKeyFindingsInput = z.infer<typeof ExtractKeyFindingsInputSchema>;

const ExtractKeyFindingsOutputSchema = z.object({
  keyFindings: z
    .string()
    .describe('The key findings extracted from the medical report.'),
});
export type ExtractKeyFindingsOutput = z.infer<typeof ExtractKeyFindingsOutputSchema>;

export async function extractKeyFindings(
  input: ExtractKeyFindingsInput
): Promise<ExtractKeyFindingsOutput> {
  return extractKeyFindingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractKeyFindingsPrompt',
  input: {schema: ExtractKeyFindingsInputSchema},
  output: {schema: ExtractKeyFindingsOutputSchema},
  prompt: `You are an AI assistant specializing in analyzing medical reports. Your task is to extract the key findings from the provided medical report.

Medical Report: {{media url=fileDataUri}}`,
});

const extractKeyFindingsFlow = ai.defineFlow(
  {
    name: 'extractKeyFindingsFlow',
    inputSchema: ExtractKeyFindingsInputSchema,
    outputSchema: ExtractKeyFindingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

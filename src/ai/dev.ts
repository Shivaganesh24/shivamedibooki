import { config } from 'dotenv';
config();

import '@/ai/flows/generate-triage-recommendation.ts';
import '@/ai/flows/extract-key-findings.ts';
import '@/ai/flows/text-to-speech.ts';
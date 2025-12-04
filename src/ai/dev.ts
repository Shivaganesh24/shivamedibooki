'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-triage-recommendation.ts';
import '@/ai/flows/extract-key-findings.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/simulate-disease-rates.ts';
import '@/ai/flows/get-local-health-alerts.ts';
import '@/ai/flows/analyze-ingredients.ts';
import '@/ai/flows/analyze-pose.ts';

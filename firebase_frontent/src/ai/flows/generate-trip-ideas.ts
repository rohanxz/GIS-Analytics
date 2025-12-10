'use server';

/**
 * @fileOverview AI-powered trip itinerary generator.
 *
 * - generateTripIdeas - A function that generates trip ideas based on a user prompt.
 * - GenerateTripIdeasInput - The input type for the generateTripIdeas function.
 * - GenerateTripIdeasOutput - The return type for the generateTripIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTripIdeasInputSchema = z.object({
  prompt: z.string().describe('A description of the desired trip.'),
});
export type GenerateTripIdeasInput = z.infer<typeof GenerateTripIdeasInputSchema>;

const GenerateTripIdeasOutputSchema = z.object({
  itinerary: z.string().describe('A detailed itinerary with suggested locations, activities, and landmarks.'),
});
export type GenerateTripIdeasOutput = z.infer<typeof GenerateTripIdeasOutputSchema>;

export async function generateTripIdeas(input: GenerateTripIdeasInput): Promise<GenerateTripIdeasOutput> {
  return generateTripIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTripIdeasPrompt',
  input: {schema: GenerateTripIdeasInputSchema},
  output: {schema: GenerateTripIdeasOutputSchema},
  prompt: `You are a trip planning expert. Generate a detailed trip itinerary based on the following description: {{{prompt}}}. Include suggested locations, activities, and landmarks. The itinerary should be well-organized and easy to follow.`,
});

const generateTripIdeasFlow = ai.defineFlow(
  {
    name: 'generateTripIdeasFlow',
    inputSchema: GenerateTripIdeasInputSchema,
    outputSchema: GenerateTripIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';
/**
 * @fileOverview AI-powered itinerary enhancement flow.
 *
 * - suggestItineraryImprovements - A function that analyzes a trip itinerary and suggests improvements.
 * - SuggestItineraryImprovementsInput - The input type for the suggestItineraryImprovements function.
 * - SuggestItineraryImprovementsOutput - The return type for the suggestItineraryImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestItineraryImprovementsInputSchema = z.object({
  itinerary: z.string().describe('The user provided trip itinerary.'),
  preferences: z
    .string()
    .optional()
    .describe('Optional user preferences for the trip, such as budget or interests.'),
});
export type SuggestItineraryImprovementsInput = z.infer<
  typeof SuggestItineraryImprovementsInputSchema
>;

const SuggestItineraryImprovementsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'A list of suggestions to improve the itinerary, including alternative activities and optimized schedules.'
    ),
  reasoning: z
    .string()
    .describe('The AI reasoning behind the suggested improvements.'),
});
export type SuggestItineraryImprovementsOutput = z.infer<
  typeof SuggestItineraryImprovementsOutputSchema
>;

export async function suggestItineraryImprovements(
  input: SuggestItineraryImprovementsInput
): Promise<SuggestItineraryImprovementsOutput> {
  return suggestItineraryImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestItineraryImprovementsPrompt',
  input: {schema: SuggestItineraryImprovementsInputSchema},
  output: {schema: SuggestItineraryImprovementsOutputSchema},
  prompt: `You are an AI travel assistant that reviews travel itineraries and suggests improvements.

  Analyze the following trip itinerary and preferences (if any) and provide suggestions to enhance the trip experience.

  Itinerary: {{{itinerary}}}
  Preferences: {{{preferences}}}

  Consider factors such as activity diversity, travel time, cost optimization, and user interests.
  Provide specific and actionable suggestions, along with a clear explanation of the reasoning behind each suggestion.
  Please format the suggestions in a way that is easily readable and actionable for the user.
  `,
});

const suggestItineraryImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestItineraryImprovementsFlow',
    inputSchema: SuggestItineraryImprovementsInputSchema,
    outputSchema: SuggestItineraryImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

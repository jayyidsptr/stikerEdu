
'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate multiple-choice trivia questions in Indonesian about various educational topics.
 *
 * - generateTriviaQuestion - A function that generates a trivia question with multiple choices.
 * - GenerateTriviaQuestionInput - The input type for the generateTriviaQuestion function.
 * - GenerateTriviaQuestionOutput - The return type for the generateTriviaQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTriviaQuestionInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic of the trivia question (e.g., Indonesian history, basic mathematics, natural sciences).'),
});
export type GenerateTriviaQuestionInput = z.infer<
  typeof GenerateTriviaQuestionInputSchema
>;

const GenerateTriviaQuestionOutputSchema = z.object({
  question: z.string().describe('The trivia question in Indonesian.'),
  options: z
    .array(z.string())
    .length(4)
    .describe('Four possible answers to the question.'),
  correctAnswerIndex: z
    .number()
    .min(0)
    .max(3)
    .describe('The index of the correct answer in the options array.'),
  // topic: z.string().optional().describe('The topic of the question, returned for context if provided.'),
});
export type GenerateTriviaQuestionOutput = z.infer<
  typeof GenerateTriviaQuestionOutputSchema
>;

export async function generateTriviaQuestion(
  input: GenerateTriviaQuestionInput
): Promise<GenerateTriviaQuestionOutput> {
  return generateTriviaQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTriviaQuestionPrompt',
  input: {schema: GenerateTriviaQuestionInputSchema},
  output: {schema: GenerateTriviaQuestionOutputSchema},
  prompt: `You are an expert in creating educational trivia.

  Generate a multiple-choice trivia question in Indonesian about {{topic}}.
  Provide four options, and indicate the index of the correct answer.
  The question and options should be appropriate for a general audience and suitable for learning.

  Question: {{question}}
  Options: {{options}}
  Correct Answer Index: {{correctAnswerIndex}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateTriviaQuestionFlow = ai.defineFlow(
  {
    name: 'generateTriviaQuestionFlow',
    inputSchema: GenerateTriviaQuestionInputSchema,
    outputSchema: GenerateTriviaQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

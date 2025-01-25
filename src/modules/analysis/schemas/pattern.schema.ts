import { z } from 'zod';

export const PatternSchema = z.object({
  type: z.string(),
  merchant: z.string(),
  amount: z.union([z.number(), z.string()]),
  frequency: z.string(),
  confidence: z.number(),
  next_expected: z.string().nullable(),
  notes: z.string().nullable(),
});

export const PatternAnalysisSchema = z.object({
  patterns: z.array(PatternSchema),
});

export type Pattern = z.infer<typeof PatternSchema>;
export type PatternAnalysis = z.infer<typeof PatternAnalysisSchema>;

import { z } from 'zod';

export const MerchantAnalysisSchema = z.object({
  merchant: z.string(),
  category: z.string(),
  sub_category: z.string(),
  confidence: z.number(),
  is_subscription: z.boolean(),
  flags: z.array(z.string()),
});

export type MerchantAnalysis = z.infer<typeof MerchantAnalysisSchema>; 
import { serve } from 'inngest/next';
import { inngest } from '@/.inngest/client';
import { sendIntrosForVolume } from '@/app/inngest/send-intros';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendIntrosForVolume],
});

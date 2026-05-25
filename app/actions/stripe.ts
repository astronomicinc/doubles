'use server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function createPaymentIntent(amount: number, email: string) {
  try {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        email,
      },
      capture_method: 'manual', // Manual capture for holds
    });

    return { success: true, clientSecret: intent.client_secret, intentId: intent.id };
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return { success: false, error: String(error) };
  }
}

export async function capturePaymentIntent(intentId: string) {
  try {
    const captured = await stripe.paymentIntents.capture(intentId);
    return { success: true, data: captured };
  } catch (error) {
    console.error('Payment capture error:', error);
    return { success: false, error: String(error) };
  }
}

export async function cancelPaymentIntent(intentId: string) {
  try {
    const cancelled = await stripe.paymentIntents.cancel(intentId);
    return { success: true, data: cancelled };
  } catch (error) {
    console.error('Payment cancellation error:', error);
    return { success: false, error: String(error) };
  }
}

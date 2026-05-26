'use server';

import { Resend } from 'resend';

const FROM_EMAIL = 'noreply@doubles.singles';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://doubles.singles';

// Initialize Resend lazily to avoid errors during build time
let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY not set - email sending will fail');
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

/**
 * Send application confirmation email to applicant
 */
export async function sendApplicationConfirmationEmail(
  applicantEmail: string,
  applicantName: string,
  friendName: string,
  applicationId: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #1B5A6B; font-size: 24px;">We got your application</h1>

      <p>Hi ${applicantName},</p>

      <p>Thanks for applying to Doubles. We've received your application and your friend <strong>${friendName}</strong> has been sent an invitation.</p>

      <h2 style="color: #1B5A6B; font-size: 18px;">What happens next?</h2>
      <ul>
        <li><strong>We review your application:</strong> We carefully review every applicant to ensure Doubles is a great fit.</li>
        <li><strong>Your friend accepts:</strong> ${friendName} will receive an email invitation to join you at the event.</li>
        <li><strong>We confirm:</strong> Once approved, you'll receive a confirmation email with event details.</li>
      </ul>

      <p style="color: #666; font-size: 14px;">Your application ID: <code>${applicationId}</code></p>

      <p>Questions? Reply to this email or visit our <a href="${SITE_URL}/faq" style="color: #1B5A6B;">FAQ</a>.</p>

      <p style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        © Doubles — Strategy. Partnership. Connection.
      </p>
    </div>
  `;

  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to: applicantEmail,
      subject: 'Your Doubles Application',
      html,
    });

    if (result.error) {
      console.error('Email send error:', result.error);
      throw new Error(`Failed to send email: ${result.error.message}`);
    }

    return result;
  } catch (error) {
    console.error('Send application confirmation email error:', error);
    throw error;
  }
}

/**
 * Send invitation email to plus-one
 */
export async function sendPlusOneInvitationEmail(
  friendEmail: string,
  friendName: string,
  applicantName: string,
  plusOneId: string
) {
  const inviteLink = `${SITE_URL}/friend-invite?id=${plusOneId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #1B5A6B; font-size: 24px;">You've been invited to Doubles</h1>

      <p>Hi ${friendName},</p>

      <p><strong>${applicantName}</strong> has invited you to a private dating event called <strong>Doubles</strong> — an exclusive gathering for accomplished founders, executives, and investors in the Bay Area.</p>

      <h2 style="color: #1B5A6B; font-size: 18px;">What is Doubles?</h2>
      <p>Doubles is a curated dating event where everyone brings a single friend. The vetting isn't algorithmic—it's personal. ${applicantName} is vouching for you, and that matters.</p>

      <p style="text-align: center; margin: 32px 0;">
        <a href="${inviteLink}" style="background-color: #1B5A6B; color: white; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
          See Event Details
        </a>
      </p>

      <p style="font-size: 14px; color: #666;">
        The link above will take you to the event details. You'll need to sign in with your email to confirm your attendance.
      </p>

      <h2 style="color: #1B5A6B; font-size: 18px;">Questions?</h2>
      <p style="font-size: 14px;">Check out our <a href="${SITE_URL}/faq" style="color: #1B5A6B;">FAQ</a> or reply to this email.</p>

      <p style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        © Doubles — Strategy. Partnership. Connection.
      </p>
    </div>
  `;

  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to: friendEmail,
      subject: `${applicantName} invited you to Doubles`,
      html,
    });

    if (result.error) {
      console.error('Email send error:', result.error);
      throw new Error(`Failed to send email: ${result.error.message}`);
    }

    return result;
  } catch (error) {
    console.error('Send plus-one invitation email error:', error);
    throw error;
  }
}

/**
 * Send approval email to applicant
 */
export async function sendApprovalEmail(
  applicantEmail: string,
  applicantName: string,
  eventDate: string,
  eventVenue: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #1B5A6B; font-size: 24px;">You're approved!</h1>

      <p>Hi ${applicantName},</p>

      <p>Great news! Your application to Doubles has been <strong>approved</strong>.</p>

      <h2 style="color: #1B5A6B; font-size: 18px;">Event Details</h2>
      <p>
        <strong>Date:</strong> ${eventDate}<br>
        <strong>Venue:</strong> ${eventVenue}<br>
      </p>

      <p style="text-align: center; margin: 32px 0;">
        <a href="${SITE_URL}/confirmation" style="background-color: #1B5A6B; color: white; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
          View Confirmation
        </a>
      </p>

      <p style="font-size: 14px; color: #666;">You and your friend are all set. We can't wait to see you there.</p>

      <p style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        © Doubles — Strategy. Partnership. Connection.
      </p>
    </div>
  `;

  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to: applicantEmail,
      subject: 'You\'re approved for Doubles!',
      html,
    });

    if (result.error) {
      console.error('Email send error:', result.error);
      throw new Error(`Failed to send email: ${result.error.message}`);
    }

    return result;
  } catch (error) {
    console.error('Send approval email error:', error);
    throw error;
  }
}

/**
 * Send rejection email to applicant
 */
export async function sendRejectionEmail(
  applicantEmail: string,
  applicantName: string,
  reason?: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #1B5A6B; font-size: 24px;">Thanks for applying</h1>

      <p>Hi ${applicantName},</p>

      <p>We appreciate your interest in Doubles. Unfortunately, we're unable to move forward with your application at this time.</p>

      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}

      <p>We're selective by design—every attendee at Doubles is carefully vetted. This decision reflects capacity and fit, not a reflection on you.</p>

      <p>We hope to see you at a future Doubles event. Feel free to reach out if you have any questions.</p>

      <p style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        © Doubles — Strategy. Partnership. Connection.
      </p>
    </div>
  `;

  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to: applicantEmail,
      subject: 'Your Doubles Application',
      html,
    });

    if (result.error) {
      console.error('Email send error:', result.error);
      throw new Error(`Failed to send email: ${result.error.message}`);
    }

    return result;
  } catch (error) {
    console.error('Send rejection email error:', error);
    throw error;
  }
}

/**
 * Send check-in reminder email (post-event)
 */
export async function sendCheckInEmail(
  applicantEmail: string,
  applicantName: string,
  matchCount: number
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #1B5A6B; font-size: 24px;">You were checked in</h1>

      <p>Hi ${applicantName},</p>

      <p>Thanks for joining us at Doubles! We're excited to tell you that you connected with <strong>${matchCount} person${matchCount !== 1 ? 's' : ''}</strong> at the event.</p>

      <p style="text-align: center; margin: 32px 0;">
        <a href="${SITE_URL}/post-event/sparks" style="background-color: #1B5A6B; color: white; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
          View Your Connections
        </a>
      </p>

      <p style="font-size: 14px; color: #666;">If you'd like to follow up with someone, you can do so through the link above.</p>

      <p style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
        © Doubles — Strategy. Partnership. Connection.
      </p>
    </div>
  `;

  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to: applicantEmail,
      subject: 'Your Doubles Recap',
      html,
    });

    if (result.error) {
      console.error('Email send error:', result.error);
      throw new Error(`Failed to send email: ${result.error.message}`);
    }

    return result;
  } catch (error) {
    console.error('Send check-in email error:', error);
    throw error;
  }
}

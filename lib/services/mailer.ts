interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SendEmailResult {
  success: boolean;
  skipped?: boolean;
  error?: string;
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function getMailerConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || process.env.CONTACT_US_EMAIL || 'no-reply@aibesttool.com';

  return { apiKey, from };
}

export async function sendTransactionalEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  const { apiKey, from } = getMailerConfig();

  if (!apiKey) {
    return { success: false, skipped: true, error: 'RESEND_API_KEY is not configured' };
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        success: false,
        error: `Resend API error ${response.status}: ${body}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

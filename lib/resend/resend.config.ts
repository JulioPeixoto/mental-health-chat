import { Resend } from 'resend';

export const resendClient = new Resend(process.env.RESEND_API_KEY);

export const RESEND_CONFIG = {
  DEFAULT_FROM_EMAIL: 'notifications@resend.dev',
  TEMPLATES: {
    WELCOME: 'welcome_template',
    PASSWORD_RESET: 'password_reset_template',
    MEETING_NOTIFICATION: 'meeting_notification_template',
  }
} as const;
import { EmailTemplate } from './email-template';
import { resendClient } from './resend.config';
import { logger } from '../logger';
    
export async function sendTokenEmail(email: string, name: string, token: string) {
  try {
    const { data, error } = await resendClient.emails.send({
      from: 'Colisa <notifications@resend.dev>',
      to: email,
      subject: 'Verificação de E-mail - Colisa',
      react: (EmailTemplate({ email, name, token }) as React.ReactNode),
    });
    
    return { success: !error, data, error };
  } catch (err) {
    logger.error('Erro ao enviar e-mail:', err);
    return { success: false, error: err };
  }
}
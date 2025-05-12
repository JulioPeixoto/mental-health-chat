import * as React from 'react';

interface EmailTemplateProps {
    email: string;
    name: string;
    token: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  email,
  name,
  token,
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/verify?token=${token}&email=${encodeURIComponent(email)}`;
  
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f1f1f1',
      borderRadius: '8px'
    }}>
      <h1 style={{ color: '#4F46E5', textAlign: 'center' }}>Bem-vindo ao Mental Health, {name}!</h1>
      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#374151' }}>
        Obrigado por se cadastrar. Para começar a usar nossos serviços, precisamos confirmar seu endereço de e-mail.
      </p>
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a 
          href={verificationUrl}
          style={{
            backgroundColor: '#4F46E5',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-block'
          }}
        >
          Verificar meu e-mail
        </a>
      </div>
      <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '30px' }}>
        Se você não solicitou esse cadastro, por favor ignore este e-mail.
      </p>
      <p style={{ fontSize: '14px', color: '#6B7280' }}>
        O link de verificação expira em 24 horas.
      </p>
    </div>
  );
};
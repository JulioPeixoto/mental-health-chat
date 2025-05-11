'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando seu e-mail...');

  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setMessage('Link de verificação inválido. Verifique se você usou o link correto do e-mail.');
      return;
    }

    // O usuário será redirecionado pelo backend para /login?verified=true se a verificação for bem-sucedida
    // Esta página é apenas para mostrar uma mensagem de carregamento antes do redirecionamento
    const timeout = setTimeout(() => {
      // Se ainda estiver nesta página após 5 segundos, algo deu errado
      if (status === 'loading') {
        setStatus('error');
        setMessage('Tempo de verificação esgotado. Tente novamente ou entre em contato com o suporte.');
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [token, email, status]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-zinc-800 p-8 shadow-md">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto my-6 h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-800"></div>
              <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">
                Verificando seu e-mail
              </h1>
              <p className="text-zinc-600 dark:text-zinc-300">
                Por favor, aguarde enquanto verificamos seu e-mail...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto my-6 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">
                Erro na verificação
              </h1>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6">
                {message}
              </p>
              <div className="flex justify-center">
                <Link
                  href="/login"
                  className="rounded-md bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                >
                  Ir para o login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AuthForm } from '@/components/custom/auth-form';
import { ProductShowcase } from '@/components/custom/product-showcase';
import { SubmitButton } from '@/components/custom/submit-button';

import { login, LoginActionState } from '../actions';

// Componente que usa o useSearchParams
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified');

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    }
  );

  useEffect(() => {
    if (verified === 'true') {
      toast.success('Email verificado com sucesso! Agora você pode fazer login.');
    }

    if (state.status === 'failed') {
      toast.error('Invalid credentials!');
    } else if (state.status === 'invalid_data') {
      toast.error('Failed validating your submission!');
    } else if (state.status === 'success') {
      setIsSuccessful(true);
      toast.success('Logged in successfully');
      router.push('/');
    }
  }, [state.status, router, verified]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-8 z-10 shadow-lg">
      <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-50">Sign In</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Use your email and password to sign in
        </p>
        
        {verified === 'true' && (
          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/30 rounded-md text-sm text-green-700 dark:text-green-300">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Email verificado com sucesso!</span>
            </div>
          </div>
        )}
      </div>
      <AuthForm action={handleSubmit} defaultEmail={email}>
        <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>
        <p className="text-center text-sm text-zinc-600 mt-4 dark:text-zinc-400">
          {"Don't have an account? "}
          <Link
            href="/register"
            className="font-semibold text-zinc-800 hover:underline dark:text-zinc-200"
          >
            Sign up
          </Link>
          {' for free.'}
        </p>
      </AuthForm>
    </div>
  );
}

// Componente principal que não usa useSearchParams diretamente
export default function Page() {
  return (
    <div className="flex h-dvh w-screen">
      <ProductShowcase />
      
      <div className="flex-1 flex items-start pt-12 md:pt-0 md:items-center justify-center relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/images/bg-mental.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%)'
          }}
        />
        <Suspense fallback={<div className="w-full max-w-md p-8">Carregando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

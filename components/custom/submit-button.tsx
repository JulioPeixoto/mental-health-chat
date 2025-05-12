'use client';

import { useFormStatus } from 'react-dom';
import { ReactNode } from 'react';

import { LoaderIcon } from '@/components/custom/icons';

import { Button } from '../ui/button';

interface SubmitButtonProps {
  children: ReactNode;
  isSuccessful: boolean;
  isSubmitting?: boolean;
}

export function SubmitButton({
  children,
  isSuccessful,
  isSubmitting = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type={pending ? 'button' : 'submit'}
      aria-disabled={pending || isSuccessful}
      disabled={pending || isSuccessful}
      className="relative"
    >
      {isSubmitting ? (
        <div className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5 text-white dark:text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </div>
      ) : isSuccessful ? (
        <div className="flex items-center justify-center gap-2">
          <svg
            className="h-5 w-5 text-white dark:text-zinc-900"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Success!</span>
        </div>
      ) : (
        children
      )}

      {(pending || isSuccessful) && (
        <span className="animate-spin absolute right-4">
          <LoaderIcon />
        </span>
      )}

      <span aria-live="polite" className="sr-only" role="status">
        {pending || isSuccessful ? 'Loading' : 'Submit form'}
      </span>
    </Button>
  );
}

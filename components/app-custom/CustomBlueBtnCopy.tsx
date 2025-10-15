'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CustomBlueBtnProps = {
  text: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * Defaults to "submit" so it works inside forms without extra props.
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * Disables the button (and applies disabled styles).
   */
  disabled?: boolean;
  /**
   * Optional loading flag. If true, shows a generic loading text and disables the button.
   */
  loading?: boolean;
  /**
   * Optional extra class names.
   */
  className?: string;
  /**
   * Optional left/right adornments.
   */
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export default function CustomBlueBtnCopy({
  text,
  onClick,
  type = 'submit',
  disabled = false,
  loading = false,
  className,
  leftIcon,
  rightIcon,
}: CustomBlueBtnProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'py-3 px-6 rounded-2xl bg-royal-blue text-white hover:bg-royal-blue/90',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {leftIcon ? <span className="mr-2">{leftIcon}</span> : null}
      {loading ? 'Please wait...' : text}
      {rightIcon ? <span className="ml-2">{rightIcon}</span> : null}
    </Button>
  );
}

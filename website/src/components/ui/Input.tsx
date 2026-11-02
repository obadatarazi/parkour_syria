import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const controlClass =
  'w-full p-3 border border-white/10 text-[0.9rem] outline-none focus:border-white/40 bg-ps-dark';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(controlClass, className)} {...rest} />;
  }
);

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const controlClass =
  'w-full p-3 border border-white/10 text-[0.9rem] outline-none focus:border-white/40 bg-ps-dark min-h-[100px] resize-y';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={cn(controlClass, className)} {...rest} />;
  }
);

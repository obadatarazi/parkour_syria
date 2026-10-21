import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const controlClass =
  'w-full p-3 border border-white/10 text-[0.9rem] outline-none focus:border-white/40 bg-ps-dark';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select ref={ref} className={cn(controlClass, className)} {...rest}>
        {children}
      </select>
    );
  }
);

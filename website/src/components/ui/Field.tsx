import { forwardRef, type HTMLAttributes, type LabelHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const labelClass = 'block font-semibold text-[0.85rem] mb-1.5';

type FieldProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { className, children, ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn('mb-4', className)} {...rest}>
      {children}
    </div>
  );
});

type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children?: ReactNode;
};

export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(function FieldLabel(
  { className, children, ...rest },
  ref
) {
  return (
    <label ref={ref} className={cn(labelClass, className)} {...rest}>
      {children}
    </label>
  );
});

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type SafetyProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  children?: ReactNode;
};

export const Safety = forwardRef<HTMLDivElement, SafetyProps>(function Safety(
  { title, className, children, ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn('safety', className)} {...rest}>
      {title != null && <strong>{title}</strong>}
      {children}
    </div>
  );
});

type SafetySuccessProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  children?: ReactNode;
};

export const SafetySuccess = forwardRef<HTMLDivElement, SafetySuccessProps>(function SafetySuccess(
  { title, className, children, ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn('safety-success', className)} {...rest}>
      {title != null && <strong>{title}</strong>}
      {children}
    </div>
  );
});

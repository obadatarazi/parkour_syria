import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type SectionHeadingProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode;
  title?: ReactNode;
  labelClassName?: string;
  titleClassName?: string;
  children?: ReactNode;
};

export const SectionHeading = forwardRef<HTMLDivElement, SectionHeadingProps>(function SectionHeading(
  { label, title, labelClassName, titleClassName, className, children, ...rest },
  ref
) {
  return (
    <div ref={ref} className={className} {...rest}>
      {label != null && <div className={cn('section-label', labelClassName)}>{label}</div>}
      {title != null && <h2 className={cn('section-title', titleClassName)}>{title}</h2>}
      {children}
    </div>
  );
});

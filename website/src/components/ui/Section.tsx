import { forwardRef, type HTMLAttributes, type ReactNode, type ElementType } from 'react';
import { cn } from '@/lib/cn';

type SectionProps = HTMLAttributes<HTMLElement> & {
  light?: boolean;
  as?: ElementType;
  children?: ReactNode;
};

export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { light = false, as: Comp = 'section', className, children, ...rest },
  ref
) {
  return (
    <Comp
      ref={ref}
      className={cn(light ? 'section section-light' : 'section', className)}
      {...rest}
    >
      {children}
    </Comp>
  );
});

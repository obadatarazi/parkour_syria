import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type TagVariant = 'default' | 'verified';

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: TagVariant;
  children?: ReactNode;
};

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { variant = 'default', className, children, ...rest },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn('tag', variant === 'verified' && 'tag-verified', className)}
      {...rest}
    >
      {children}
    </span>
  );
});

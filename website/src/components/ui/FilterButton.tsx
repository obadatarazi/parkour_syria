import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type FilterButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  children?: ReactNode;
};

export const FilterButton = forwardRef<HTMLButtonElement, FilterButtonProps>(function FilterButton(
  { active = false, className, children, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn('filter-btn', active && 'active', className)}
      {...rest}
    >
      {children}
    </button>
  );
});

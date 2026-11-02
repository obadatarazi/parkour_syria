import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { className, children, ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn('container-x', className)} {...rest}>
      {children}
    </div>
  );
});

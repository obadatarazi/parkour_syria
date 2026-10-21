import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Container } from './Container';

type PageHeroProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  containerClassName?: string;
};

export const PageHero = forwardRef<HTMLDivElement, PageHeroProps>(function PageHero(
  { title, description, children, className, containerClassName, ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn('page-hero', className)} {...rest}>
      <Container className={containerClassName}>
        {title != null && <h1>{title}</h1>}
        {description != null && <p>{description}</p>}
        {children}
      </Container>
    </div>
  );
});

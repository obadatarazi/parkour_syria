import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from 'react';
import type { PageId } from '@/types';
import { useLink } from '@/components/nav';
import { cn } from '@/lib/cn';

const backClass = 'back-link inline-flex items-center gap-1.5';

type BackButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};

export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(function BackButton(
  { className, children, type = 'button', ...rest },
  ref
) {
  return (
    <button ref={ref} type={type} className={cn(backClass, className)} {...rest}>
      {children}
    </button>
  );
});

type BackLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  page: PageId;
  id?: string;
  children?: ReactNode;
};

export function BackLink({ page, id, className, children, ...rest }: BackLinkProps) {
  const link = useLink();
  const { href, onClick } = link(page, id);
  return (
    <a href={href} onClick={onClick} className={cn(backClass, className)} {...rest}>
      {children}
    </a>
  );
}

import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from 'react';
import type { PageId } from '@/data/demo';
import { useLink } from '@/components/nav';
import { cn } from '@/lib/cn';

const variantClass = {
  dark: 'btn-dark',
  outline: 'btn-outline',
  accent: 'btn-accent',
} as const;

const sizeClass = {
  sm: 'btn-sm',
  lg: 'btn-lg',
} as const;

export type ButtonVariant = keyof typeof variantClass;
export type ButtonSize = keyof typeof sizeClass;

type Shared = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
  children?: ReactNode;
};

function buttonClasses({
  variant = 'dark',
  size,
  block,
  className,
}: Shared) {
  return cn('btn', variantClass[variant], size && sizeClass[size], block && 'btn-block', className);
}

export const Button = forwardRef<HTMLButtonElement, Shared & ButtonHTMLAttributes<HTMLButtonElement>>(
  function Button({ variant, size, block, className, children, type = 'button', ...rest }, ref) {
    return (
      <button ref={ref} type={type} className={buttonClasses({ variant, size, block, className })} {...rest}>
        {children}
      </button>
    );
  }
);

type ButtonLinkProps = Shared &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    page: PageId;
    id?: string;
  };

/** In-app link styled as a button (middle-click / copy-link safe). */
export function ButtonLink({ page, id, variant, size, block, className, children, ...rest }: ButtonLinkProps) {
  const link = useLink();
  const { href, onClick } = link(page, id);
  return (
    <a href={href} onClick={onClick} className={buttonClasses({ variant, size, block, className })} {...rest}>
      {children}
    </a>
  );
}

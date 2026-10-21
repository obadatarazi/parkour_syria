import { SearchField } from "@/shared/components/forms/SearchField";

type CrudSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  placeholder: string;
  ariaLabel: string;
  clearAriaLabel?: string;
  className?: string;
  inputClassName?: string;
};

export function CrudSearchField({
  value,
  onChange,
  onReset,
  placeholder,
  ariaLabel,
  clearAriaLabel,
  className,
  inputClassName,
}: CrudSearchFieldProps) {
  return (
    <SearchField
      value={value}
      onChange={onChange}
      onReset={onReset}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      clearAriaLabel={clearAriaLabel}
      className={className}
      inputClassName={inputClassName}
    />
  );
}

import { Button } from "@/shared/design-system/components/ui/button";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { ChevronBack, ChevronForward } from "@/shared/demo/components/DirectionalChevrons";

type AdminPaginationBarProps = {
  page: number;
  pages: number;
  total: number;
  filteredLen: number;
  onPageChange: (page: number) => void;
};

export function AdminPaginationBar({
  page,
  pages,
  total,
  filteredLen,
  onPageChange,
}: AdminPaginationBarProps) {
  const t = useTranslation();

  const pageNumbers = Array.from({ length: Math.min(pages, 5) }, (_, index) => {
    if (pages <= 5) return index + 1;
    if (page <= 3) return index + 1;
    if (page >= pages - 2) return pages - 4 + index;
    return page - 2 + index;
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-5 py-3.5">
      <span className="text-xs text-muted-foreground">
        {t.showing} {filteredLen} {t.of} {total} {t.results}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-lg"
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          aria-label={t.previous}
        >
          <ChevronBack className="size-3.5" />
        </Button>
        {pageNumbers.map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={pageNumber === page ? "default" : "outline"}
            size="icon"
            className={cn(
              "size-8 rounded-lg text-xs font-semibold",
              pageNumber === page && "shadow-sm",
            )}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-lg"
          disabled={page === pages}
          onClick={() => onPageChange(Math.min(pages, page + 1))}
          aria-label={t.nextPage}
        >
          <ChevronForward className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

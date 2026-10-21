
export function stockBarColor(stock: number, reorder: number) {
  if (stock === 0) return "bg-destructive";
  if (stock <= reorder) return "bg-warning";
  return "bg-success";
}

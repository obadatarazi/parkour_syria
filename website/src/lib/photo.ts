// Pexels resizes on the fly: ask for the width each spot needs instead of one 940px size everywhere.
export function photo(url: string, width: number) {
  return url.replace(/([?&])h=\d+&w=\d+/, `$1w=${width}`);
}

export function photoSet(url: string, widths: number[]) {
  return widths.map((w) => `${photo(url, w)} ${w}w`).join(', ');
}

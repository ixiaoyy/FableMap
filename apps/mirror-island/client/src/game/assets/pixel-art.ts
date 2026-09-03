export interface PixelArt {
  readonly rows: readonly string[];
  readonly palette: Readonly<Record<string, string>>;
}

export interface PixelRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly color: string;
}

const rectangles = new WeakMap<PixelArt, readonly PixelRect[]>();

/** Converts a source-authored pixel drawing into cached horizontal runs for both SVG and Canvas. */
export function pixelArtRects(art: PixelArt): readonly PixelRect[] {
  const cached = rectangles.get(art);
  if (cached) return cached;
  const result: PixelRect[] = [];
  art.rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const symbol = row[x]!;
      const start = x++;
      while (row[x] === symbol) x += 1;
      const color = art.palette[symbol];
      if (color) result.push({ x: start, y, width: x - start, color });
    }
  });
  rectangles.set(art, result);
  return result;
}

/** Paints the same integer-pixel recipe used by UI icons into a runtime texture at the supplied origin. */
export function paintPixelArt(context: CanvasRenderingContext2D, art: PixelArt, x = 0, y = 0): void {
  for (const pixel of pixelArtRects(art)) {
    context.fillStyle = pixel.color;
    context.fillRect(x + pixel.x, y + pixel.y, pixel.width, 1);
  }
}

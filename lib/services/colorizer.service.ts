declare type RGB = { r: number; g: number; b: number };

export class Colorizer {
  static stringToColor(str: string, bgColor?: string): string {
    bgColor = bgColor || '000';

    const fgColor = this.stringToHash(str);

    return !this.ensureContrast(fgColor, bgColor)
      ? this.stringToColor(str + '-10102010', bgColor)
      : fgColor;
  }

  private static stringToHash(str: string): string {
    const hash = str
      .split('')
      .reduce((hash, char) => char.charCodeAt(0) + ((hash << 9) - hash), 0);

    const color = [0, 1, 2].reduce(
      (color, i) =>
        color + ((hash >> (i * 8)) & 0xff).toString(16).padStart(2, '0'),
      '#',
    );

    return color;
  }

  private static ensureContrast(fgColor: string, bgColor: string): boolean {
    const fgRgb = this.hexToRgb(fgColor.slice(1)); // Remove the '#' for hexToRgb
    const bgRgb = this.hexToRgb(bgColor);
    const fgYiq = this.getYIQ(fgRgb);
    const bgYiq = this.getYIQ(bgRgb);

    return Math.abs(bgYiq - fgYiq) >= 128;
  }

  private static hexToRgb(hex: string): RGB {
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }

  private static getYIQ({ r, g, b }: RGB): number {
    return (r * 299 + g * 587 + b * 114) / 1000;
  }
}

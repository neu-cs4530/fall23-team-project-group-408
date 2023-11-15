import {
  DrawThePerfectShapeDifficulty,
  DrawThePerfectShapePixel,
  DrawThePerfectShapeShape,
  DrawThePerfectShapeTitle,
} from '../../../../types/CoveyTownSocket';

export default class Shape implements DrawThePerfectShapeShape {
  title: DrawThePerfectShapeTitle;

  difficulty: DrawThePerfectShapeDifficulty;

  pixels: DrawThePerfectShapePixel[];

  constructor(
    title: DrawThePerfectShapeTitle,
    difficulty: DrawThePerfectShapeDifficulty,
    pixels: DrawThePerfectShapePixel[] = [],
  ) {
    this.title = title;
    this.difficulty = difficulty;
    this.pixels = pixels;
  }

  /**
   * Adds pixels to this shape
   * @param pixels
   */
  addPixels(pixels: DrawThePerfectShapePixel[]) {
    this.pixels.push(...pixels);
  }

  /**
   * Calculates the accuracy between this shape and another shape.
   * (Number of pixels "otherShape" has that are in this shape -
   * Number of pixels "otherShape" has that are NOT in this shape) /
   * Total number of pixels in this shape
   * @param otherShape
   * @returns accuracy
   */
  accuracy(otherShape: DrawThePerfectShapeShape) {
    if (this.title !== otherShape.title || this.difficulty !== otherShape.difficulty) {
      throw new Error('Cannot compare shapes with different titles and/or difficulties');
    }
    let commonPixelCount = 0;
    let notInThisShapeCount = 0;
    for (const pixel of otherShape.pixels) {
      if (this.pixels.includes(pixel)) {
        commonPixelCount += 1;
      } else {
        notInThisShapeCount += 1;
      }
    }
    const totalPixels = this.pixels.length;
    return (commonPixelCount - notInThisShapeCount) / totalPixels;
  }
}

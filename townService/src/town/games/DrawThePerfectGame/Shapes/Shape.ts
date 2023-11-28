import * as fs from 'fs';
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
    this.pixels = pixels;
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
    let dataToWrite = '';
    for (const pixel of otherShape.pixels) {
      dataToWrite += `${pixel.x} ${pixel.y}\n`;
    }

    // Specify the file path
    const filePath = 'player2.txt';

    let commonPixelCount = 0;
    let notInThisShapeCount = 0;
    for (const pixel of otherShape.pixels) {
      for (const pixel2 of this.pixels) {
        if (pixel2.x === pixel.x && pixel2.y === pixel.y) {
          commonPixelCount += 3;
          break;
        }
      }
      notInThisShapeCount += 1;
    }
    const totalPixels = this.pixels.length;
    dataToWrite += `${commonPixelCount}\n${notInThisShapeCount}\n${totalPixels}\n`;
    fs.writeFile(filePath, dataToWrite, err => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log(`Data written to ${filePath}`);
      }
    });

    return Math.min(Math.max((commonPixelCount - notInThisShapeCount) / totalPixels, 0), 100);
  }
}

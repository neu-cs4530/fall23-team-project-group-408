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

  constructor() {
    this.title = 'Circle';
    this.difficulty = 'Easy';
    this.pixels = [];
  }

  /**
   * Adds pixels
   * @param pixels
   */
  addPixels(pixels: DrawThePerfectShapePixel[]) {}

  /**
   *
   * @param otherShape
   * @returns
   */
  accuracy(otherShape: DrawThePerfectShapeShape) {
    return 0.75;
  }
}

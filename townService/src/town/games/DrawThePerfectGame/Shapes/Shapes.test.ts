import Shape from './Shape';

describe('Shape', () => {
  let shape: Shape;

  beforeEach(() => {
    shape = new Shape('Square', 'Easy', [
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 5 },
      { x: 9, y: 10 },
      { x: 3, y: 1 },
    ]);
  });

  describe('[T1.1] addPixels', () => {
    it('should add update the list to be a single pixel to the pixelList when given only one', () => {
      expect(shape.pixels.length).toEqual(7);
      shape.addPixels([{ x: 3, y: 9 }]);
      expect(shape.pixels.length).toEqual(1);
      expect(shape.pixels).toEqual([{ x: 3, y: 9 }]);
    });
    it('PixelList should reflect multiple pixels when given multiple', () => {
      expect(shape.pixels.length).toEqual(7);
      shape.addPixels([
        { x: 3, y: 9 },
        { x: 3, y: 10 },
      ]);
      expect(shape.pixels.length).toEqual(2);
      expect(shape.pixels).toEqual([
        { x: 3, y: 9 },
        { x: 3, y: 10 },
      ]);
    });
  });
  describe('[T1.1] accuracy', () => {
    it('should throw an error when given a shape with different type or title', () => {
      let otherShape = new Shape('Umbrella', 'Easy', [
        { x: 3, y: 3 },
        { x: 3, y: 4 },
        { x: 3, y: 5 },
        { x: 4, y: 4 },
        { x: 5, y: 5 },
        { x: 9, y: 10 },
        { x: 3, y: 1 },
      ]);
      expect(() => shape.accuracy(otherShape)).toThrowError();
      otherShape = new Shape('Square', 'Hard', [
        { x: 3, y: 3 },
        { x: 3, y: 4 },
        { x: 3, y: 5 },
        { x: 4, y: 4 },
        { x: 5, y: 5 },
        { x: 9, y: 10 },
        { x: 3, y: 1 },
      ]);
      expect(() => shape.accuracy(otherShape)).toThrowError();
    });
    it('should have an 100% accuracy when comparing identical shapes', () => {
      expect(shape.accuracy(shape)).toEqual(1);
    });
    it('should have a negative accuracy when comparing shapes without similarities', () => {
      const otherShape = new Shape('Square', 'Easy', [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
      ]);
      expect(shape.accuracy(otherShape) < 0);
    });
    it('should have a positive accuracy when comparing shapes with some similarities', () => {
      const otherShape = new Shape('Square', 'Easy', [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 3, y: 3 },
        { x: 3, y: 4 },
        { x: 3, y: 5 },
      ]);
      expect(shape.accuracy(otherShape) > 0);
    });
  });
});

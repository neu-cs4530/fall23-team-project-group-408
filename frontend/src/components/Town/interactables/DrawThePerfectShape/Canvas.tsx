import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DrawThePerfectShapePixel } from '../../../../types/CoveyTownSocket';

type CanvasProps = {
  width?: string;
  height?: string;
  penColor: string;
  canPaint?: boolean;
  tracePixels: DrawThePerfectShapePixel[];
  backendPixels?: DrawThePerfectShapePixel[];
  sendPixels?: (pixels: DrawThePerfectShapePixel[]) => void;
};

type Coordinate = {
  x: number;
  y: number;
};

const Canvas = (props: CanvasProps) => {
  const [isPainting, setIsPainting] = useState(false);
  const [mousePosition, setMousePosition] = useState<Coordinate | undefined>(undefined);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getCoordinates = (event: MouseEvent): Coordinate | undefined => {
    if (!canvasRef.current) {
      return;
    }

    const canvas: HTMLCanvasElement = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const coord: Coordinate = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
    return coord;
  };

  const startPaint = useCallback((event: MouseEvent) => {
    const coordinates = getCoordinates(event);
    if (coordinates) {
      setIsPainting(true);
      setMousePosition(coordinates);
    }
  }, []);

  const drawLine = useCallback(
    (originalMousePosition: Coordinate, newMousePosition: Coordinate) => {
      if (!canvasRef.current || !originalMousePosition || !newMousePosition) {
        return;
      }
      const canvas: HTMLCanvasElement = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        context.strokeStyle = props.penColor;
        context.lineJoin = 'round';
        context.lineWidth = 3;

        context.beginPath();
        context.moveTo(originalMousePosition.x, originalMousePosition.y);
        context.lineTo(newMousePosition.x, newMousePosition.y);
        context.stroke();

        context.fillStyle = props.penColor; // Set the fill style to red
        if (!canvasRef.current) {
          return;
        }
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if (newMousePosition && props.sendPixels) {
          // const allPixels: DrawThePerfectShapePixel[] = allPixelsPositions(newMousePosition);
          // allPixels.forEach(pixel => context.fillRect(pixel.x, pixel.y, 1, 1));
          const canvasImageData = context.getImageData(0, 0, 400, 400);
          const allPixels: DrawThePerfectShapePixel[] = [];
          for (let x = 0; x < canvasImageData.width; x++) {
            for (let y = 0; y < canvasImageData.height; y++) {
              const index = (y * canvasImageData.width + x) * 4;
              const r = canvasImageData.data[index];
              const g = canvasImageData.data[index + 1];
              const b = canvasImageData.data[index + 2];
              if ((r !== 255 || g !== 255 || b !== 255) && (r !== 0 || g !== 0 || b !== 0)) {
                allPixels.push({ x: x / scaleX, y: y / scaleY });
              }
            }
          }
          props.sendPixels(allPixels);
        }
      }
    },
    [props],
  );

  const paint = useCallback(
    (event: MouseEvent) => {
      if (isPainting) {
        const newMousePosition = getCoordinates(event);
        if (mousePosition && newMousePosition) {
          drawLine(mousePosition, newMousePosition);
          setMousePosition(newMousePosition);
        }
      }
    },
    [drawLine, isPainting, mousePosition],
  );

  const exitPaint = useCallback(() => {
    setIsPainting(false);
  }, []);

  /**
   * Add the mouse event listeners to the canvas
   */
  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas) {
      return;
    }

    if (props.canPaint) {
      const handleMouseDown = (event: MouseEvent) => startPaint(event);
      const handleMouseMove = (event: MouseEvent) => paint(event);
      const handleMouseUp = () => exitPaint();
      const handleMouseLeave = () => exitPaint();

      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [startPaint, paint, exitPaint, props.canPaint]);

  /**
   * Draw the initial canvas with the trace shape as the background
   */
  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas) {
      return;
    }
    if (props.tracePixels) {
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'white'; // Set the fill style to red
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        for (const coordinate of props.tracePixels) {
          context.fillRect(coordinate.x * scaleX, coordinate.y * scaleY, 1, 1);
        }
      }
    }
  }, [props.tracePixels]);

  /**
   * Draw the backendPixels on the canvas
   */
  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas) {
      return;
    }
    if (props.backendPixels) {
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = 'white'; // Set the fill style to red
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        context.fillStyle = props.penColor; // Set the fill style to red
        for (const coordinate of props.backendPixels) {
          context.fillRect(coordinate.x * scaleX, coordinate.y * scaleY, 1, 1);
        }
      }
    }
  }, [props.backendPixels, props.penColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        height: '400px',
        width: '400px',
        border: '1px solid #000',
        backgroundColor: 'black',
        borderRadius: '10px',
      }}
    />
  );
};

export default Canvas;

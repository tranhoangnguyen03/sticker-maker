import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Pencil, Undo } from 'lucide-react';

interface ImageCanvasProps {
  imageUrl: string;
  onSave: (markedImageUrl: string | null) => void;
  isActive: boolean;
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({ imageUrl, onSave, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Initialize canvas with image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;
    setCtx(context);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      // Calculate aspect ratio to fit in container max height
      const maxWidth = containerRef.current?.clientWidth || 500;
      const maxHeight = 400;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = width * (maxHeight / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      setImageSize({ width, height });

      context.drawImage(img, 0, 0, width, height);
      // We don't save immediately, wait for user interaction or confirm
      setHasDrawn(false);
    };
  }, [imageUrl]);

  // Helper to get coordinates relative to canvas
  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isActive || !ctx) return;
    setIsDrawing(true);
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return;
    e.preventDefault(); // Prevent scrolling on touch
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasDrawn) setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing || !ctx) return;
    ctx.closePath();
    setIsDrawing(false);
    saveState();
  };

  const saveState = () => {
    if (canvasRef.current) {
        // If user has drawn, we return the data URL of the canvas (image + drawing)
        // If not, we return null to signal "use AI auto-detection"
        onSave(hasDrawn ? canvasRef.current.toDataURL('image/png') : null);
    }
  };

  const clearCanvas = () => {
     if (!ctx || !canvasRef.current) return;
     const img = new Image();
     img.crossOrigin = "anonymous";
     img.src = imageUrl;
     img.onload = () => {
         ctx.drawImage(img, 0, 0, imageSize.width, imageSize.height);
         setHasDrawn(false);
         onSave(null);
     };
  };

  return (
    <div className="flex flex-col items-center space-y-3" ref={containerRef}>
      <div className="relative group rounded-lg overflow-hidden shadow-lg border-2 border-slate-200 dark:border-slate-700">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`${isActive ? 'cursor-crosshair' : 'cursor-default'} bg-white`}
        />
        {!isActive && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <p className="text-white font-medium">Select this image to edit</p>
            </div>
        )}
      </div>
      
      {isActive && (
        <div className="flex items-center space-x-4 bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
           <span className="text-xs text-slate-500 pl-2 font-medium">
             {hasDrawn ? 'Subject marked' : 'Draw circle over subject'}
           </span>
           <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-600"></div>
           <button 
             onClick={clearCanvas}
             className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
             title="Clear drawing"
           >
             <Undo className="w-4 h-4" />
           </button>
        </div>
      )}
    </div>
  );
};

export default ImageCanvas;
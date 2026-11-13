import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Move } from 'lucide-react';

export interface CropCoordinates {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface ImageCropperModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onConfirm: (crop: CropCoordinates) => void;
  aspectRatio?: number; // 1 for square (default for avatars)
  circularMask?: boolean;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  file,
  onClose,
  onConfirm,
  aspectRatio = 1,
  circularMask = true,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Crop frame dimensions (the viewable crop window on screen)
  const CROP_BOX_SIZE = 280; // 280px x 280px on mobile screens

  // Load image when file changes
  useEffect(() => {
    if (!file) {
      setImageSrc(null);
      setNaturalDimensions(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageSrc(url);

    const img = new Image();
    img.onload = () => {
      setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      // Reset zoom and center image
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Compute minimum zoom so image covers the crop box
  const getMinZoom = useCallback(() => {
    if (!naturalDimensions) return 1;
    const scaleX = CROP_BOX_SIZE / naturalDimensions.width;
    const scaleY = CROP_BOX_SIZE / naturalDimensions.height;
    return Math.max(scaleX, scaleY);
  }, [naturalDimensions, CROP_BOX_SIZE]);

  // Mouse / Touch handlers for panning
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - pan.x, y: clientY - pan.y });
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPan({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const handleZoomChange = (newZoom: number) => {
    const minZ = getMinZoom();
    const clamped = Math.max(minZ, Math.min(newZoom, minZ * 4));
    setZoom(clamped);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoomChange(zoom + delta);
  };

  // Reset positioning
  const handleReset = () => {
    setZoom(getMinZoom());
    setPan({ x: 0, y: 0 });
  };

  // Calculate actual natural pixel crop coordinates to send to Sharp
  const calculateFinalCrop = (): CropCoordinates => {
    if (!naturalDimensions) {
      return { left: 0, top: 0, width: 800, height: 800 };
    }

    const { width: nw, height: nh } = naturalDimensions;
    const currentScale = zoom;

    // Displayed dimensions of the image on screen
    const displayedWidth = nw * currentScale;
    const displayedHeight = nh * currentScale;

    // Center of the crop box relative to image origin
    // Crop box is centered at (0, 0) relative to pan
    const cropBoxCenterX = displayedWidth / 2 - pan.x;
    const cropBoxCenterY = displayedHeight / 2 - pan.y;

    // Top-left of the crop box in displayed pixels
    const cropBoxLeft = cropBoxCenterX - CROP_BOX_SIZE / 2;
    const cropBoxTop = cropBoxCenterY - CROP_BOX_SIZE / 2;

    // Convert from displayed pixels to natural image pixels
    const naturalLeft = Math.round(cropBoxLeft / currentScale);
    const naturalTop = Math.round(cropBoxTop / currentScale);
    const naturalWidth = Math.round(CROP_BOX_SIZE / currentScale);
    const naturalHeight = Math.round(CROP_BOX_SIZE / currentScale);

    // Clamp coordinates safely within the image boundary
    const clampedLeft = Math.max(0, Math.min(naturalLeft, nw - 10));
    const clampedTop = Math.max(0, Math.min(naturalTop, nh - 10));
    const clampedWidth = Math.max(10, Math.min(naturalWidth, nw - clampedLeft));
    const clampedHeight = Math.max(10, Math.min(naturalHeight, nh - clampedTop));

    return {
      left: clampedLeft,
      top: clampedTop,
      width: clampedWidth,
      height: clampedHeight,
    };
  };

  const handleApply = () => {
    const crop = calculateFinalCrop();
    onConfirm(crop);
  };

  if (!isOpen || !file || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#FFF9F2] rounded-3xl border border-[#E8DDD3] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E8DDD3] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">✂️</span>
            <div>
              <h3 className="text-base font-black text-[#2C211B] leading-tight">Crop Profile Picture</h3>
              <p className="text-xs text-[#766A63]">Drag to move • Pinch or slider to zoom</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 text-[#766A63] hover:text-[#2C211B] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Cropper Area */}
        <div className="p-4 flex flex-col items-center bg-[#2C211B]/5">
          <div
            ref={containerRef}
            className="relative overflow-hidden select-none touch-none rounded-2xl bg-[#1E1611] shadow-inner cursor-grab active:cursor-grabbing flex items-center justify-center"
            style={{ width: `${CROP_BOX_SIZE + 24}px`, height: `${CROP_BOX_SIZE + 24}px` }}
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={(e) => {
              if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchEnd={handlePointerUp}
            onWheel={handleWheel}
          >
            {/* The Scalable / Draggable Image */}
            <div
              className="absolute pointer-events-none transition-transform duration-75 ease-out"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px)`,
              }}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop subject"
                className="max-w-none select-none pointer-events-none"
                style={{
                  width: naturalDimensions ? `${naturalDimensions.width * zoom}px` : 'auto',
                  height: naturalDimensions ? `${naturalDimensions.height * zoom}px` : 'auto',
                }}
                draggable={false}
              />
            </div>

            {/* Mask Overlay with Cutout */}
            <div
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
              style={{
                boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.55)`,
              }}
            >
              <div
                className={`border-2 border-white shadow-sm pointer-events-none ${
                  circularMask ? 'rounded-full' : 'rounded-2xl'
                }`}
                style={{
                  width: `${CROP_BOX_SIZE}px`,
                  height: `${CROP_BOX_SIZE}px`,
                }}
              />
            </div>

            {/* Hint Badge */}
            <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-white font-medium flex items-center gap-1 pointer-events-none">
              <Move className="w-2.5 h-2.5" /> Drag & zoom
            </div>
          </div>
        </div>

        {/* Controls: Zoom slider & buttons */}
        <div className="px-5 py-3.5 bg-white border-t border-[#E8DDD3] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleZoomChange(zoom - 0.15)}
              className="p-1.5 rounded-xl border border-[#E8DDD3] hover:bg-zinc-50 text-[#766A63] hover:text-[#2C211B] transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={getMinZoom()}
              max={getMinZoom() * 3.5}
              step={0.01}
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="w-full accent-[#8B5E3C] h-1.5 bg-[#E8DDD3] rounded-lg cursor-pointer"
            />
            <button
              type="button"
              onClick={() => handleZoomChange(zoom + 0.15)}
              className="p-1.5 rounded-xl border border-[#E8DDD3] hover:bg-zinc-50 text-[#766A63] hover:text-[#2C211B] transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-xl border border-[#E8DDD3] hover:bg-zinc-50 text-[#766A63] hover:text-[#2C211B] transition-colors cursor-pointer"
              title="Reset position"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#766A63]">
            <span>Original: {naturalDimensions ? `${naturalDimensions.width} × ${naturalDimensions.height}px` : 'Loading...'}</span>
            <span className="font-semibold text-[#8B5E3C]">HD Passport Quality: 800×800</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-[#E8DDD3] bg-[#FFF9F2] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#766A63] hover:bg-[#E8DDD3]/40 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#8B5E3C] hover:bg-[#6D492F] shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Apply & Optimize
          </button>
        </div>
      </div>
    </div>
  );
};

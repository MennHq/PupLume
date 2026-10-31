import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle2, AlertCircle, Loader2, Cloud, Image as ImageIcon } from 'lucide-react';
import { uploadImageToCloudinary } from '../../lib/cloudinary';

interface CloudinaryImageUploaderProps {
  currentImageUrl?: string;
  onUploadSuccess: (secureUrl: string) => void;
  folder?: string;
  label?: string;
  sublabel?: string;
  variant?: 'avatar' | 'card' | 'compact' | 'button';
  aspectRatio?: 'square' | 'video' | 'auto';
  className?: string;
}

export const CloudinaryImageUploader: React.FC<CloudinaryImageUploaderProps> = ({
  currentImageUrl,
  onUploadSuccess,
  folder = 'puplume/pets',
  label = 'Upload Photo',
  sublabel = 'JPG, PNG, or WEBP (Max 25MB)',
  variant = 'card',
  aspectRatio = 'square',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('Image file is too large (maximum 25MB).');
      return;
    }

    setError(null);
    setIsUploading(true);

    // Create immediate local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      // Pass previousImageUrl so Cloudinary cleans up the old image automatically
      const previousTarget = currentImageUrl || (previewUrl && previewUrl.startsWith('http') ? previewUrl : undefined);
      const result = await uploadImageToCloudinary(file, { 
        folder, 
        previousImageUrl: previousTarget 
      });
      onUploadSuccess(result.url);
      setPreviewUrl(result.url);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const activeImage = previewUrl || currentImageUrl;

  if (variant === 'button') {
    return (
      <div className={`relative inline-block ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
          disabled={isUploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF9F2] hover:bg-[#F3E7DA] text-[#8B5E3C] border border-[#E8DDD3] text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Camera className="w-3.5 h-3.5" />
          )}
          <span>{isUploading ? 'Uploading your picture...' : label}</span>
        </button>
        {error && <p className="text-[10px] text-rose-600 mt-1">{error}</p>}
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
          disabled={isUploading}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#8B5E3C] bg-[#F7F2EE] cursor-pointer group shadow-xs shrink-0"
        >
          {activeImage ? (
            <img src={activeImage} alt="Photo" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#8B5E3C]">
              <Camera className="w-6 h-6" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-5 h-5 text-white" />
          </div>

          {isUploading && (
            <div className="absolute inset-0 bg-[#2C211B]/80 flex flex-col items-center justify-center text-white text-[10px] font-bold p-1 text-center">
              <Loader2 className="w-5 h-5 animate-spin mb-1 text-white" />
              <span>Uploading your picture...</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-xs font-bold text-[#8B5E3C] hover:text-[#5F3E29] underline flex items-center gap-1 cursor-pointer"
          >
            <span>{isUploading ? 'Uploading your picture...' : label}</span>
          </button>
          <p className="text-[11px] text-[#766A63] mt-0.5">{sublabel}</p>
          {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
        </div>
      </div>
    );
  }

  // Default 'card' / dropzone variant
  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
        disabled={isUploading}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-4 transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
          isDragOver
            ? 'border-[#8B5E3C] bg-[#F7F2EE]'
            : 'border-[#E8DDD3] bg-[#FFF9F2]/70 hover:bg-[#FFF9F2] hover:border-[#8B5E3C]/60'
        }`}
      >
        {activeImage ? (
          <div className="w-full flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#E8DDD3] shrink-0 bg-white">
              <img src={activeImage} alt="Pet" className="w-full h-full object-cover" />
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Uploaded Successfully!</span>
              </div>
              <p className="text-xs font-bold text-[#2C211B] mt-1.5">
                Click or drop a new image to replace photo
              </p>
            </div>
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F3E7DA] text-[#8B5E3C] flex items-center justify-center mb-2 shadow-2xs">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#8B5E3C]" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div className="text-xs font-bold text-[#2C211B]">
              <span>{isUploading ? 'Uploading your picture...' : label}</span>
            </div>

            <p className="text-[11px] text-[#766A63] mt-1 max-w-xs">{sublabel}</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-[#FFF9F2]/90 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center z-10">
            <Loader2 className="w-7 h-7 text-[#8B5E3C] animate-spin mb-1" />
            <span className="text-xs font-bold text-[#8B5E3C]">Uploading your picture...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

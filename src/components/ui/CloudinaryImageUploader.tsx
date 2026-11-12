import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, AlertCircle, Loader2, Sparkles, Crop as CropIcon } from 'lucide-react';
import { uploadImageToCloudinary, UploadResult } from '../../lib/cloudinary';
import { ImageCropperModal, CropCoordinates } from './ImageCropperModal';

interface CloudinaryImageUploaderProps {
  currentImageUrl?: string;
  onUploadSuccess: (secureUrl: string, metadata?: UploadResult) => void;
  folder?: string;
  label?: string;
  sublabel?: string;
  variant?: 'avatar' | 'card' | 'compact' | 'button';
  aspectRatio?: 'square' | 'video' | 'auto';
  targetType?: 'puppy_profile' | 'user_avatar' | 'journal' | 'document' | 'general';
  targetId?: string;
  enableCrop?: boolean;
  className?: string;
}

export const CloudinaryImageUploader: React.FC<CloudinaryImageUploaderProps> = ({
  currentImageUrl,
  onUploadSuccess,
  folder,
  label = 'Upload Photo',
  sublabel = 'JPG, PNG, or WebP (Max 10MB)',
  variant = 'card',
  aspectRatio = 'square',
  targetType,
  targetId,
  enableCrop,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Cropper state
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Determine whether this is a profile image (which requires the interactive cropper)
  const isProfile = 
    enableCrop === true ||
    (enableCrop !== false && (variant === 'avatar' || targetType === 'puppy_profile' || targetType === 'user_avatar'));

  const effectiveTargetType = targetType || (variant === 'avatar' ? 'puppy_profile' : 'general');

  const validateFile = (file: File): boolean => {
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const ext = file.name.toLowerCase().split('.').pop() || '';
    const validExts = ['jpg', 'jpeg', 'png', 'webp'];

    const hasValidMime = file.type ? validMimes.includes(file.type.toLowerCase()) : false;
    const hasValidExt = validExts.includes(ext);

    if (!hasValidMime && !hasValidExt) {
      setError('Only JPG, PNG, and WebP images are allowed. Please select a supported file.');
      return false;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      setError(`Image is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed size is 10 MB.`);
      return false;
    }

    return true;
  };

  const executeUpload = async (file: File, crop?: CropCoordinates) => {
    setError(null);
    setIsUploading(true);
    setUploadStep('Staging original...');

    try {
      const previousTarget = currentImageUrl || (previewUrl && previewUrl.startsWith('http') ? previewUrl : undefined);

      const result = await uploadImageToCloudinary(file, {
        folder: folder || (isProfile ? 'puplume/pets' : 'puplume/uploads'),
        targetType: effectiveTargetType,
        targetId,
        previousImageUrl: previousTarget,
        crop,
        onProgress: (phase) => {
          if (!isMountedRef.current) return;
          if (phase === 'validating') setUploadStep('Validating format...');
          if (phase === 'uploading') setUploadStep('Staging original in secure storage...');
          if (phase === 'processing') setUploadStep('Sharp server optimizing to WebP...');
          if (phase === 'saving') setUploadStep('Saving to permanent Cloudinary...');
        },
      });

      if (isMountedRef.current) {
        setPreviewUrl(result.url);
      }
      onUploadSuccess(result.url, result);
    } catch (err: any) {
      console.error('[CloudinaryImageUploader] Upload failed:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to upload and process image. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsUploading(false);
        setUploadStep('');
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectedFile = (file: File) => {
    if (!validateFile(file)) return;

    if (isProfile) {
      // Open interactive cropper modal so user can position and zoom freely
      setPendingCropFile(file);
      setIsCropperOpen(true);
    } else {
      // For general images (journal, document vault, etc.), preserve composition directly
      executeUpload(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleSelectedFile(file);
    }
  };

  const handleCropConfirm = (crop: CropCoordinates) => {
    setIsCropperOpen(false);
    if (pendingCropFile) {
      executeUpload(pendingCropFile, crop);
      setPendingCropFile(null);
    }
  };

  const handleCropCancel = () => {
    setIsCropperOpen(false);
    setPendingCropFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeImage = previewUrl || currentImageUrl;

  // Shared cropper modal instance
  const cropperModal = (
    <ImageCropperModal
      isOpen={isCropperOpen}
      file={pendingCropFile}
      onClose={handleCropCancel}
      onConfirm={handleCropConfirm}
      circularMask={variant === 'avatar' || isProfile}
    />
  );

  // Hidden file input
  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
      className="hidden"
      onChange={handleInputChange}
      disabled={isUploading}
    />
  );

  // 1. BUTTON VARIANT
  if (variant === 'button') {
    return (
      <div className={`relative inline-block ${className}`}>
        {fileInput}
        {cropperModal}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B5E3C] hover:bg-[#6D492F] text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{uploadStep || 'Optimizing...'}</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span>{label}</span>
            </>
          )}
        </button>
        {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
      </div>
    );
  }

  // 2. AVATAR VARIANT (Profile pictures)
  if (variant === 'avatar') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        {fileInput}
        {cropperModal}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative group w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-dashed border-[#8B5E3C]/40 hover:border-[#8B5E3C] bg-[#FFF9F2] overflow-hidden flex items-center justify-center cursor-pointer transition-all shadow-xs ${
            isUploading ? 'opacity-80' : ''
          }`}
        >
          {activeImage ? (
            <img
              src={activeImage}
              alt="Avatar preview"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#8B5E3C] gap-1 p-2 text-center">
              <Camera className="w-6 h-6 stroke-[1.5]" />
              <span className="text-[10px] font-bold">Add Photo</span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/45 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
            <CropIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">{activeImage ? 'Change & Crop' : 'Upload'}</span>
          </div>

          {/* Uploading Spinner */}
          {isUploading && (
            <div className="absolute inset-0 bg-[#2C211B]/75 flex flex-col items-center justify-center text-white gap-1.5 p-2 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#F3E7DA]" />
              <span className="text-[9px] font-bold leading-tight text-[#F3E7DA]">
                {uploadStep.includes('Sharp') ? 'Sharp WebP...' : 'Uploading...'}
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-xs font-bold text-[#8B5E3C] hover:underline cursor-pointer flex items-center gap-1"
        >
          <Camera className="w-3.5 h-3.5" />
          {activeImage ? 'Change Photo' : label}
        </button>

        {error && (
          <p className="text-[11px] text-red-600 text-center max-w-xs">{error}</p>
        )}
      </div>
    );
  }

  // 3. COMPACT VARIANT
  if (variant === 'compact') {
    return (
      <div className={`w-full ${className}`}>
        {fileInput}
        {cropperModal}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`flex items-center gap-3 p-3 rounded-2xl border border-dashed transition-all cursor-pointer ${
            isDragOver
              ? 'border-[#8B5E3C] bg-[#8B5E3C]/10'
              : 'border-[#E8DDD3] bg-white hover:border-[#8B5E3C]/60 hover:bg-[#FFF9F2]'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-[#FFF9F2] border border-[#E8DDD3] flex items-center justify-center shrink-0 overflow-hidden">
            {activeImage ? (
              <img src={activeImage} alt="Uploaded" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-5 h-5 text-[#8B5E3C]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#2C211B] truncate">{label}</p>
            <p className="text-[11px] text-[#766A63] truncate">
              {isUploading ? uploadStep || 'Optimizing with Sharp...' : sublabel}
            </p>
          </div>
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#8B5E3C] shrink-0" />
          ) : (
            <Upload className="w-4 h-4 text-[#766A63] shrink-0" />
          )}
        </div>
        {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
      </div>
    );
  }

  // 4. DEFAULT CARD VARIANT
  const ratioClasses = {
    square: 'aspect-square max-w-xs mx-auto',
    video: 'aspect-video w-full',
    auto: 'min-h-[160px] w-full',
  }[aspectRatio];

  return (
    <div className={`w-full ${className}`}>
      {fileInput}
      {cropperModal}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative ${ratioClasses} rounded-3xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none ${
          isDragOver
            ? 'border-[#8B5E3C] bg-[#8B5E3C]/10 scale-[0.99]'
            : 'border-[#E8DDD3] bg-white hover:border-[#8B5E3C]/70 hover:bg-[#FFF9F2]/70 shadow-xs'
        }`}
      >
        {activeImage ? (
          <>
            <img
              src={activeImage}
              alt="Uploaded photo"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 p-4">
              <Camera className="w-7 h-7" />
              <p className="text-xs font-bold">Click or drag to change image</p>
              <p className="text-[10px] opacity-80">Server-optimized with Sharp to WebP</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex items-center justify-center text-[#8B5E3C] shadow-xs">
              <Upload className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#2C211B]">{label}</p>
              <p className="text-xs text-[#766A63] mt-0.5">{sublabel}</p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B5E3C]/10 text-[#8B5E3C] text-[11px] font-bold">
              <Sparkles className="w-3 h-3" />
              <span>Sharp Auto-WebP Compression</span>
            </div>
          </div>
        )}

        {/* Uploading progress overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-[#2C211B]/80 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-3 p-6 z-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#F3E7DA]" />
            <div className="text-center">
              <p className="text-xs font-bold text-[#F3E7DA]">
                {uploadStep || 'Processing Image...'}
              </p>
              <p className="text-[10px] text-[#D8C7B8] mt-1">
                Sharp server-side encoding & Cloudinary delivery
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2.5 p-3 rounded-xl bg-red-50 border border-red-200/80 flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

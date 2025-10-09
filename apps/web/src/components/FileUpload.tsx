'use client';

import { useState, useRef } from 'react';
import { useTranslation } from '@/lib/translations';

interface FileUploadProps {
  onUpload: (file: File) => void;
  onRemove: () => void;
  accept?: string;
  maxSize?: number; // in MB
  folder?: string;
  disabled?: boolean;
}

export default function FileUpload({
  onUpload,
  onRemove,
  accept = 'image/*',
  maxSize = 10,
  folder = 'uploads',
  disabled = false,
}: FileUploadProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(t('fileUpload.fileTooLarge').replace('{maxSize}', maxSize.toString()));
      return;
    }

    // Validate file type
    if (accept.includes('image/*') && !file.type.startsWith('image/')) {
      setError(t('fileUpload.invalidFileType'));
      return;
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        onUpload(file);
        setError(null);
      } else {
        setError(result.error || t('fileUpload.uploadFailed'));
        setPreview(null);
      }
    } catch (err) {
      setError(t('fileUpload.uploadFailed'));
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
          disabled
            ? 'border-muted bg-muted/20 cursor-not-allowed'
            : 'border-border hover:border-primary cursor-pointer'
        }`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-3">
            <img
              src={preview}
              alt="Preview"
              className="max-h-32 mx-auto rounded-lg object-cover"
            />
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="btn-secondary text-sm"
                disabled={disabled}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t('fileUpload.remove')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-muted rounded-lg flex items-center justify-center">
              {uploading ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {uploading ? t('fileUpload.uploading') : t('fileUpload.clickToUpload')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('fileUpload.maxSize').replace('{maxSize}', maxSize.toString())}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-lg">
          <svg className="w-4 h-4 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-error">{error}</p>
        </div>
      )}
    </div>
  );
}

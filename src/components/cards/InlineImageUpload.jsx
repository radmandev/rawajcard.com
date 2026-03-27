import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Upload, Camera, X, Edit2 } from 'lucide-react';
import { api } from '@/api/supabaseAPI';
import { motion, AnimatePresence } from 'framer-motion';

export default function InlineImageUpload({ 
  value, 
  onChange, 
  fieldName,
  displayComponent,
  editMode = false,
  isRTL = false,
  showCameraOption = false,
  className
}) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      onChange(fieldName, file_url);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  if (!editMode) {
    return displayComponent;
  }

  return (
    <div
      className={cn("relative group", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {displayComponent}
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          {showCameraOption && (
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
          )}
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
            title={isRTL ? 'رفع صورة' : 'Upload Image'}
          >
            <Upload className="h-4 w-4 text-teal-600" />
          </button>

          {showCameraOption && (
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
              title={isRTL ? 'التقاط صورة' : 'Take Photo'}
            >
              <Camera className="h-4 w-4 text-teal-600" />
            </button>
          )}

          {value && (
            <button
              onClick={() => onChange(fieldName, '')}
              className="p-2 bg-red-500 rounded-full shadow-lg hover:scale-110 transition-transform"
              title={isRTL ? 'حذف الصورة' : 'Remove Image'}
            >
              <X className="h-4 w-4 text-white" />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
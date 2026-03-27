import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InlineEditableField({ 
  value, 
  onChange, 
  fieldName,
  displayComponent,
  inputType = 'text',
  multiline = false,
  className,
  editMode = false,
  onEditModeChange,
  placeholder,
  isRTL = false
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputType === 'text' || multiline) {
        inputRef.current.select();
      }
    }
  }, [isEditing, inputType, multiline]);

  useEffect(() => {
    setTempValue(value || '');
  }, [value]);

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    if (onEditModeChange) onEditModeChange(true);
  };

  const handleSave = () => {
    onChange(fieldName, tempValue);
    setIsEditing(false);
    if (onEditModeChange) onEditModeChange(false);
  };

  const handleCancel = () => {
    setTempValue(value || '');
    setIsEditing(false);
    if (onEditModeChange) onEditModeChange(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && multiline && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!editMode) {
    return displayComponent;
  }

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("relative group", className)}
        onClick={(e) => e.stopPropagation()}
      >
        {multiline ? (
          <textarea
            ref={inputRef}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            dir={isRTL ? 'rtl' : 'ltr'}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-2 border-teal-400 rounded-lg focus:outline-none focus:border-teal-500 resize-none"
            rows={3}
          />
        ) : (
          <input
            ref={inputRef}
            type={inputType}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            dir={isRTL ? 'rtl' : 'ltr'}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-2 border-teal-400 rounded-lg focus:outline-none focus:border-teal-500"
          />
        )}
        
        <div className="flex gap-1 mt-2 justify-end">
          <button
            onClick={handleCancel}
            className="p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors"
            title={isRTL ? 'إلغاء' : 'Cancel'}
          >
            <X className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
          </button>
          <button
            onClick={handleSave}
            className="p-1.5 bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors"
            title={isRTL ? 'حفظ' : 'Save'}
          >
            <Check className="h-3.5 w-3.5 text-white" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
          {multiline 
            ? (isRTL ? 'اضغط Ctrl+Enter للحفظ أو Esc للإلغاء' : 'Press Ctrl+Enter to save or Esc to cancel')
            : (isRTL ? 'اضغط Enter للحفظ أو Esc للإلغاء' : 'Press Enter to save or Esc to cancel')
          }
        </p>
      </motion.div>
    );
  }

  return (
    <div
      onClick={handleEdit}
      className={cn(
        "relative cursor-pointer group transition-all",
        "hover:outline hover:outline-2 hover:outline-teal-400 hover:outline-offset-2 rounded-lg",
        className
      )}
    >
      {displayComponent}
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute top-0 right-0 -mt-2 -mr-2 bg-teal-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <Edit2 className="h-3 w-3" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FONT_OPTIONS = {
  english: [
    { name: 'Inter', label: 'Inter' },
    { name: 'Roboto', label: 'Roboto' },
    { name: 'Open Sans', label: 'Open Sans' },
    { name: 'Lato', label: 'Lato' },
    { name: 'Montserrat', label: 'Montserrat' },
    { name: 'Poppins', label: 'Poppins' },
    { name: 'Raleway', label: 'Raleway' },
    { name: 'Ubuntu', label: 'Ubuntu' },
    { name: 'Nunito', label: 'Nunito' },
    { name: 'Playfair Display', label: 'Playfair Display' }
  ],
  arabic: [
    { name: 'Cairo', label: 'Cairo - القاهرة' },
    { name: 'Tajawal', label: 'Tajawal - تاجول' },
    { name: 'Almarai', label: 'Almarai - المرعي' },
    { name: 'Noto Sans Arabic', label: 'Noto Sans Arabic' },
    { name: 'Amiri', label: 'Amiri - أميري' },
    { name: 'Changa', label: 'Changa - تشانجا' },
    { name: 'El Messiri', label: 'El Messiri - المسيري' },
    { name: 'Lateef', label: 'Lateef - لطيف' },
    { name: 'Markazi Text', label: 'Markazi Text' },
    { name: 'Reem Kufi', label: 'Reem Kufi - ريم كوفي' }
  ]
};

export default function FontSelector({ value = 'Inter', language = 'english', onFontChange, onLanguageChange, isRTL }) {
  const currentFonts = FONT_OPTIONS[language] || FONT_OPTIONS.english;
  
  // Load Google Fonts
  React.useEffect(() => {
    const fonts = [...FONT_OPTIONS.english, ...FONT_OPTIONS.arabic]
      .map(f => f.name.replace(/\s+/g, '+'))
      .join('|');
    
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fonts}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <Label>{isRTL ? 'لغة الخط' : 'Font Language'}</Label>
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">
              {isRTL ? 'إنجليزي' : 'English'}
            </SelectItem>
            <SelectItem value="arabic">
              {isRTL ? 'عربي' : 'Arabic'}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{isRTL ? 'نوع الخط' : 'Font Family'}</Label>
        <Select value={value} onValueChange={onFontChange}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currentFonts.map((font) => (
              <SelectItem key={font.name} value={font.name}>
                <span style={{ fontFamily: font.name }}>{font.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <p style={{ fontFamily: value }} className="text-lg">
            {language === 'arabic' 
              ? 'نموذج النص بالخط المختار' 
              : 'Sample text in selected font'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
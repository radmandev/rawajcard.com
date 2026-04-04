import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Palette, QrCode, Check } from 'lucide-react';
import { api } from '@/api/supabaseAPI';

const buildPresets = (design = {}) => [
  { nameEn: 'Classic',    nameAr: 'كلاسيك', dot: '#000000',                           bg: '#FFFFFF', style: 'square' },
  { nameEn: 'Brand',      nameAr: 'براند',   dot: design.primary_color || '#0D7377',  bg: '#FFFFFF', style: 'square' },
  { nameEn: 'Inverted',   nameAr: 'معكوس',   dot: '#FFFFFF',                           bg: design.primary_color || '#0D7377', style: 'square' },
  { nameEn: 'Accent',     nameAr: 'أكسنت',   dot: design.accent_color || '#00B4D8',   bg: '#FFFFFF', style: 'rounded' },
  { nameEn: 'Dark Brand', nameAr: 'داكن',    dot: design.accent_color || '#00B4D8',   bg: design.secondary_color || '#14274E', style: 'rounded' },
  { nameEn: 'Subtle',     nameAr: 'هادئ',    dot: design.secondary_color || '#14274E', bg: '#F8F9FA', style: 'rounded' },
  { nameEn: 'Dark',       nameAr: 'أسود',    dot: '#FFFFFF',                           bg: '#1a1a2e', style: 'dots' },
  { nameEn: 'Gold',       nameAr: 'ذهبي',    dot: '#F4B400',                           bg: '#14274E', style: 'dots' },
];

export default function QRCodeCustomizer({ qrSettings, onChange, cardDesign = {} }) {
  const { t, isRTL } = useLanguage();
  const [uploading, setUploading] = useState(false);

  const presets = buildPresets(cardDesign);
  const [selectedPreset, setSelectedPreset] = useState(() => {
    const idx = buildPresets(cardDesign).findIndex(
      p =>
        p.dot === (qrSettings?.dot_color || '#000000') &&
        p.bg === (qrSettings?.background_color || '#FFFFFF') &&
        p.style === (qrSettings?.style || 'square')
    );
    return idx >= 0 ? idx : 0;
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      onChange({ ...qrSettings, logo_url: file_url });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const presetStyles = [
    { value: 'square', labelEn: 'Square', labelAr: 'مربع' },
    { value: 'rounded', labelEn: 'Rounded', labelAr: 'دائري' },
    { value: 'dots', labelEn: 'Dots', labelAr: 'نقاط' }
  ];

  return (
    <Card className="bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          {isRTL ? 'تخصيص رمز QR' : 'Customize QR Code'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ── Preset Style Slider ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">{isRTL ? 'أنماط جاهزة' : 'Preset Styles'}</Label>
            <span className="text-xs text-slate-400">{isRTL ? 'اختر نمطاً أو خصص يدوياً' : 'Pick a preset or customize below'}</span>
          </div>
          {/* Visual preset row */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedPreset(idx);
                  onChange({ ...qrSettings, dot_color: preset.dot, background_color: preset.bg, style: preset.style });
                }}
                className={cn(
                  'flex-shrink-0 w-[72px] rounded-xl border-2 p-1.5 transition-all',
                  selectedPreset === idx
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-teal-300'
                )}
              >
                <div
                  className="w-full aspect-square rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: preset.bg }}
                >
                  {selectedPreset === idx
                    ? <Check className="h-6 w-6" style={{ color: preset.dot }} />
                    : <QrCode className="h-6 w-6" style={{ color: preset.dot }} />
                  }
                </div>
                <p className="text-[10px] text-center mt-1 font-medium truncate text-slate-600 dark:text-slate-300">
                  {isRTL ? preset.nameAr : preset.nameEn}
                </p>
              </button>
            ))}
          </div>
          {/* Range slider for quick navigation */}
          <input
            type="range" min={0} max={presets.length - 1} value={selectedPreset}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setSelectedPreset(idx);
              onChange({ ...qrSettings, dot_color: presets[idx].dot, background_color: presets[idx].bg, style: presets[idx].style });
            }}
            className="w-full accent-teal-600"
          />
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-1">
          <p className="text-xs text-slate-400 mb-3">{isRTL ? 'تخصيص يدوي إضافي:' : 'Extra customization:'}</p>
        </div>
        {/* Style Selection */}
        <div className="space-y-2">
          <Label>{isRTL ? 'النمط' : 'Style'}</Label>
          <Select
            value={qrSettings?.style || 'square'}
            onValueChange={(value) => onChange({ ...qrSettings, style: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {presetStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {isRTL ? style.labelAr : style.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dot Color */}
        <div className="space-y-2">
          <Label>{isRTL ? 'لون النقاط' : 'Dot Color'}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={qrSettings?.dot_color || '#000000'}
              onChange={(e) => onChange({ ...qrSettings, dot_color: e.target.value })}
              className="w-20 h-10 cursor-pointer"
            />
            <Input
              type="text"
              value={qrSettings?.dot_color || '#000000'}
              onChange={(e) => onChange({ ...qrSettings, dot_color: e.target.value })}
              className="flex-1 font-mono"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Background Color */}
        <div className="space-y-2">
          <Label>{isRTL ? 'لون الخلفية' : 'Background Color'}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={qrSettings?.background_color || '#FFFFFF'}
              onChange={(e) => onChange({ ...qrSettings, background_color: e.target.value })}
              className="w-20 h-10 cursor-pointer"
            />
            <Input
              type="text"
              value={qrSettings?.background_color || '#FFFFFF'}
              onChange={(e) => onChange({ ...qrSettings, background_color: e.target.value })}
              className="flex-1 font-mono"
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>{isRTL ? 'شعار (اختياري)' : 'Logo (Optional)'}</Label>
          {qrSettings?.logo_url ? (
            <div className="space-y-2">
              <div className="relative w-20 h-20 rounded-lg border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
                <img
                  src={qrSettings.logo_url}
                  alt="QR Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange({ ...qrSettings, logo_url: null })}
              >
                {isRTL ? 'إزالة' : 'Remove'}
              </Button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <Upload className="h-5 w-5 text-slate-400" />
              <span className="text-sm text-slate-500">
                {uploading
                  ? isRTL ? 'جاري الرفع...' : 'Uploading...'
                  : isRTL ? 'رفع شعار' : 'Upload Logo'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
          <p className="text-xs text-slate-500">
            {isRTL
              ? 'يوصى بصورة مربعة شفافة PNG للحصول على أفضل النتائج'
              : 'Recommended: Square transparent PNG for best results'}
          </p>
        </div>

      </CardContent>
    </Card>
  );
}
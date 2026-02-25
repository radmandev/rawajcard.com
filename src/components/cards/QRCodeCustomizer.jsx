import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Palette } from 'lucide-react';
import { api } from '@/api/supabaseAPI';
import QRCode from 'qrcode';

export default function QRCodeCustomizer({ qrSettings, onChange, slug }) {
  const { t, isRTL } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [qrPreview, setQrPreview] = useState(null);

  // Generate QR preview whenever settings change
  useEffect(() => {
    if (slug) {
      const generatePreview = async () => {
        try {
          const url = await QRCode.toDataURL(`${window.location.origin}/c/${slug}`, {
            width: 300,
            margin: 2,
            color: {
              dark: qrSettings?.dot_color || '#000000',
              light: qrSettings?.background_color || '#FFFFFF'
            }
          });
          setQrPreview(url);
        } catch (error) {
          console.error('QR generation failed:', error);
        }
      };
      generatePreview();
    }
  }, [slug, qrSettings?.dot_color, qrSettings?.background_color, qrSettings?.style]);

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
        {/* QR Preview */}
        {qrPreview && (
          <div className="flex justify-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
            <div className="relative">
              <img src={qrPreview} alt="QR Preview" className="w-48 h-48 rounded-xl shadow-lg" />
              {qrSettings?.logo_url && (
                <img
                  src={qrSettings.logo_url}
                  alt="Logo"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-lg bg-white p-1"
                />
              )}
            </div>
          </div>
        )}

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

        {/* Quick Presets */}
        <div className="space-y-2">
          <Label>{isRTL ? 'الألوان السريعة' : 'Quick Presets'}</Label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { dot: '#000000', bg: '#FFFFFF', name: 'Classic' },
              { dot: '#0D7377', bg: '#FFFFFF', name: 'Teal' },
              { dot: '#FFFFFF', bg: '#000000', name: 'Dark' },
              { dot: '#F4B400', bg: '#14274E', name: 'Gold' }
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() =>
                  onChange({
                    ...qrSettings,
                    dot_color: preset.dot,
                    background_color: preset.bg
                  })
                }
                className="flex flex-col items-center gap-1 p-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-teal-500 transition-colors"
              >
                <div className="w-full h-8 rounded flex items-center justify-center" style={{ backgroundColor: preset.bg }}>
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.dot }} />
                </div>
                <span className="text-xs">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
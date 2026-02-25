import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { api } from '@/api/supabaseAPI';
import FontSelector from '@/components/shared/FontSelector';
import ColorPresetSlider from '@/components/cards/ColorPresetSlider';
import DraggableColorPicker from '@/components/cards/DraggableColorPicker';
import { 
  User, 
  Building2, 
  Globe, 
  Share2, 
  Palette,
  Upload,
  X
} from 'lucide-react';

export default function CardForm({ card, onChange }) {
  const { t, isRTL } = useLanguage();

  const handleChange = (field, value) => {
    onChange({ ...card, [field]: value });
  };

  const handleSocialChange = (platform, value) => {
    onChange({
      ...card,
      social_links: {
        ...card.social_links,
        [platform]: value
      }
    });
  };

  const handleDesignChange = (property, value) => {
    onChange({
      ...card,
      design: {
        ...card.design,
        [property]: value
      }
    });
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { file_url } = await api.integrations.Core.UploadFile({ file });
    handleChange(field, file_url);
  };

  const socialPlatforms = [
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/yourname' },
    { key: 'twitter', label: 'Twitter / X', placeholder: 'twitter.com/yourname' },
    { key: 'instagram', label: 'Instagram', placeholder: 'instagram.com/yourname' },
    { key: 'facebook', label: 'Facebook', placeholder: 'facebook.com/yourname' },
    { key: 'tiktok', label: 'TikTok', placeholder: 'tiktok.com/@yourname' },
    { key: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@yourname' },
    { key: 'snapchat', label: 'Snapchat', placeholder: 'snapchat.com/add/yourname' },
    { key: 'github', label: 'GitHub', placeholder: 'github.com/yourname' },
    { key: 'behance', label: 'Behance', placeholder: 'behance.net/yourname' },
    { key: 'dribbble', label: 'Dribbble', placeholder: 'dribbble.com/yourname' },
  ];

  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="personal" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{t('personalInfo')}</span>
        </TabsTrigger>
        <TabsTrigger value="contact" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">{t('company')}</span>
        </TabsTrigger>
        <TabsTrigger value="social" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">{t('socialLinks')}</span>
        </TabsTrigger>
        <TabsTrigger value="design" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">{t('design')}</span>
        </TabsTrigger>
      </TabsList>

      {/* Personal Information */}
      <TabsContent value="personal" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('personalInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Image */}
            <div className="space-y-2">
              <Label>{isRTL ? 'الصورة الشخصية' : 'Profile Image'}</Label>
              <div className="flex items-center gap-4">
                {card.profile_image ? (
                  <div className="relative">
                    <img 
                      src={card.profile_image} 
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                    <button
                      onClick={() => handleChange('profile_image', '')}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <User className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'profile_image')}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {isRTL ? 'رفع صورة' : 'Upload'}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label>{isRTL ? 'صورة الغلاف' : 'Cover Image'}</Label>
              <div className="space-y-2">
                {card.cover_image ? (
                  <div className="relative">
                    <img 
                      src={card.cover_image} 
                      alt="Cover"
                      className="h-24 w-full rounded-lg object-cover"
                    />
                    <button
                      onClick={() => handleChange('cover_image', '')}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'cover_image')}
                    />
                    <div className="h-24 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-teal-400 transition-colors">
                      <div className="text-center">
                        <Upload className="h-6 w-6 mx-auto text-slate-400 mb-1" />
                        <span className="text-sm text-slate-500">
                          {isRTL ? 'انقر للرفع' : 'Click to upload'}
                        </span>
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('name')} *</Label>
                <Input
                  value={card.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder={isRTL ? 'الاسم بالإنجليزية' : 'Your name'}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('nameAr')}</Label>
                <Input
                  value={card.name_ar || ''}
                  onChange={(e) => handleChange('name_ar', e.target.value)}
                  placeholder="الاسم بالعربية"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('jobTitle')}</Label>
                <Input
                  value={card.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder={isRTL ? 'المسمى الوظيفي' : 'Your job title'}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('jobTitleAr')}</Label>
                <Input
                  value={card.title_ar || ''}
                  onChange={(e) => handleChange('title_ar', e.target.value)}
                  placeholder="المسمى الوظيفي بالعربية"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('bio')}</Label>
                <Textarea
                  value={card.bio || ''}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder={isRTL ? 'نبذة عنك' : 'A short bio about yourself'}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('bioAr')}</Label>
                <Textarea
                  value={card.bio_ar || ''}
                  onChange={(e) => handleChange('bio_ar', e.target.value)}
                  placeholder="نبذة عنك بالعربية"
                  rows={3}
                  dir="rtl"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Company & Contact */}
      <TabsContent value="contact" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('company')} & {isRTL ? 'التواصل' : 'Contact'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('company')}</Label>
                <Input
                  value={card.company || ''}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder={isRTL ? 'اسم الشركة' : 'Company name'}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('companyAr')}</Label>
                <Input
                  value={card.company_ar || ''}
                  onChange={(e) => handleChange('company_ar', e.target.value)}
                  placeholder="اسم الشركة بالعربية"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('email')}</Label>
                <Input
                  type="email"
                  value={card.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('phone')}</Label>
                <Input
                  type="tel"
                  value={card.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+966 5X XXX XXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('whatsapp')}</Label>
                <Input
                  type="tel"
                  value={card.whatsapp || ''}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  placeholder="+966 5X XXX XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('website')}</Label>
                <Input
                  value={card.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('location')}</Label>
                <Input
                  value={card.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder={isRTL ? 'المدينة، البلد' : 'City, Country'}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('locationAr')}</Label>
                <Input
                  value={card.location_ar || ''}
                  onChange={(e) => handleChange('location_ar', e.target.value)}
                  placeholder="المدينة، البلد"
                  dir="rtl"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Social Links */}
      <TabsContent value="social" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              {t('socialLinks')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialPlatforms.map((platform) => (
                <div key={platform.key} className="space-y-2">
                  <Label>{platform.label}</Label>
                  <Input
                    value={card.social_links?.[platform.key] || ''}
                    onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                    dir="ltr"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Design */}
      <TabsContent value="design" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t('design')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Color Scheme - Drag and Drop */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">{isRTL ? 'نظام الألوان' : 'Color Scheme'}</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                {isRTL ? 'اسحب لإعادة ترتيب الألوان' : 'Drag to reorder colors'}
              </p>
              <DraggableColorPicker
                colors={{
                  primary: card.design?.primary_color || '#0D7377',
                  secondary: card.design?.secondary_color || '#14274E',
                  accent: card.design?.accent_color || '#00B4D8'
                }}
                onColorsChange={(newColors) => {
                  handleDesignChange('primary_color', newColors.primary);
                  handleDesignChange('secondary_color', newColors.secondary);
                  handleDesignChange('accent_color', newColors.accent);
                }}
                isRTL={isRTL}
              />
            </div>

            {/* Preset Colors Slider */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">{isRTL ? 'ألوان مقترحة' : 'Preset Colors'}</Label>
              <ColorPresetSlider
                onSelectPreset={(preset) => {
                  handleDesignChange('primary_color', preset.primary);
                  handleDesignChange('secondary_color', preset.secondary);
                  handleDesignChange('accent_color', preset.accent);
                }}
                isRTL={isRTL}
              />
            </div>

            {/* Font Settings */}
            <FontSelector
              value={card.design?.font_family || 'Inter'}
              language={card.design?.font_language || 'english'}
              onFontChange={(font) => handleDesignChange('font_family', font)}
              onLanguageChange={(lang) => handleDesignChange('font_language', lang)}
              isRTL={isRTL}
            />

            {/* Dark Mode Toggle */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">{isRTL ? 'الوضع الداكن' : 'Dark Mode'}</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {isRTL ? 'تمكين الوضع الداكن للبطاقة' : 'Enable dark theme for your card'}
                  </p>
                </div>
                <Switch
                  checked={card.design?.dark_mode || false}
                  onCheckedChange={(checked) => handleDesignChange('dark_mode', checked)}
                />
              </div>
            </div>

            {/* Border Radius & Padding */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'استدارة الزوايا' : 'Border Radius'}</Label>
                <Input
                  type="text"
                  value={card.design?.border_radius || '12px'}
                  onChange={(e) => handleDesignChange('border_radius', e.target.value)}
                  placeholder="12px"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'المسافة الداخلية' : 'Card Padding'}</Label>
                <Input
                  type="text"
                  value={card.design?.card_padding || '24px'}
                  onChange={(e) => handleDesignChange('card_padding', e.target.value)}
                  placeholder="24px"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
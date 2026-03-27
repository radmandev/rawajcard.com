import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { api } from '@/api/supabaseAPI';
import { 
  User, 
  Building2, 
  Share2, 
  Palette,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2
} from 'lucide-react';

export default function CollapsibleForm({ card, onChange }) {
  const { t, isRTL } = useLanguage();
  const [expandedSections, setExpandedSections] = useState(['personal']);
  const [translating, setTranslating] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

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

  const autoTranslate = async (field, englishText) => {
    if (!englishText || englishText.trim().length === 0) return;
    
    setTranslating({ ...translating, [field]: true });
    
    try {
      const response = await api.integrations.Core.InvokeLLM({
        prompt: `Translate the following text to Arabic. Only return the translation, nothing else: "${englishText}"`,
      });
      
      handleChange(field, response);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslating({ ...translating, [field]: false });
    }
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
  ];

  const Section = ({ id, icon: Icon, title, children }) => {
    const isExpanded = expandedSections.includes(id);
    
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-teal-600" />
            <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </button>
        
        {isExpanded && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Personal Information */}
      <Section id="personal" icon={User} title={t('personalInfo')}>
        <div className="space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('name')} *</Label>
              <Input
                value={card.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={(e) => autoTranslate('name_ar', e.target.value)}
                placeholder={isRTL ? 'الاسم بالإنجليزية' : 'Your name'}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>{t('nameAr')}</Label>
                {translating.name_ar && <Loader2 className="h-3 w-3 animate-spin text-teal-600" />}
              </div>
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
                onBlur={(e) => autoTranslate('title_ar', e.target.value)}
                placeholder={isRTL ? 'المسمى الوظيفي' : 'Your job title'}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>{t('jobTitleAr')}</Label>
                {translating.title_ar && <Loader2 className="h-3 w-3 animate-spin text-teal-600" />}
              </div>
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
                onBlur={(e) => autoTranslate('bio_ar', e.target.value)}
                placeholder={isRTL ? 'نبذة عنك' : 'A short bio about yourself'}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>{t('bioAr')}</Label>
                {translating.bio_ar && <Loader2 className="h-3 w-3 animate-spin text-teal-600" />}
              </div>
              <Textarea
                value={card.bio_ar || ''}
                onChange={(e) => handleChange('bio_ar', e.target.value)}
                placeholder="نبذة عنك بالعربية"
                rows={3}
                dir="rtl"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Company & Contact */}
      <Section id="company" icon={Building2} title={`${t('company')} & ${isRTL ? 'التواصل' : 'Contact'}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('company')}</Label>
              <Input
                value={card.company || ''}
                onChange={(e) => handleChange('company', e.target.value)}
                onBlur={(e) => autoTranslate('company_ar', e.target.value)}
                placeholder={isRTL ? 'اسم الشركة' : 'Company name'}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>{t('companyAr')}</Label>
                {translating.company_ar && <Loader2 className="h-3 w-3 animate-spin text-teal-600" />}
              </div>
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
                onBlur={(e) => autoTranslate('location_ar', e.target.value)}
                placeholder={isRTL ? 'المدينة، البلد' : 'City, Country'}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>{t('locationAr')}</Label>
                {translating.location_ar && <Loader2 className="h-3 w-3 animate-spin text-teal-600" />}
              </div>
              <Input
                value={card.location_ar || ''}
                onChange={(e) => handleChange('location_ar', e.target.value)}
                placeholder="المدينة، البلد"
                dir="rtl"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Social Links */}
      <Section id="social" icon={Share2} title={t('socialLinks')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialPlatforms.map((platform) => (
            <div key={platform.key} className="space-y-2">
              <Label>{platform.label}</Label>
              <Input
                value={card.social_links?.[platform.key] || ''}
                onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                placeholder={platform.placeholder}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Design */}
      <Section id="design" icon={Palette} title={t('design')}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('primaryColor')}</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={card.design?.primary_color || '#0D7377'}
                  onChange={(e) => handleDesignChange('primary_color', e.target.value)}
                  className="h-10 w-16 rounded cursor-pointer"
                />
                <Input
                  value={card.design?.primary_color || '#0D7377'}
                  onChange={(e) => handleDesignChange('primary_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('secondaryColor')}</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={card.design?.secondary_color || '#14274E'}
                  onChange={(e) => handleDesignChange('secondary_color', e.target.value)}
                  className="h-10 w-16 rounded cursor-pointer"
                />
                <Input
                  value={card.design?.secondary_color || '#14274E'}
                  onChange={(e) => handleDesignChange('secondary_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('accentColor')}</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={card.design?.accent_color || '#00B4D8'}
                  onChange={(e) => handleDesignChange('accent_color', e.target.value)}
                  className="h-10 w-16 rounded cursor-pointer"
                />
                <Input
                  value={card.design?.accent_color || '#00B4D8'}
                  onChange={(e) => handleDesignChange('accent_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Preset Colors */}
          <div className="space-y-2">
            <Label>{isRTL ? 'ألوان مقترحة' : 'Preset Colors'}</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { primary: '#0D7377', secondary: '#14274E', accent: '#00B4D8' },
                { primary: '#7C3AED', secondary: '#4C1D95', accent: '#EC4899' },
                { primary: '#059669', secondary: '#064E3B', accent: '#10B981' },
                { primary: '#DC2626', secondary: '#7F1D1D', accent: '#F97316' },
                { primary: '#0EA5E9', secondary: '#0369A1', accent: '#38BDF8' },
                { primary: '#D97706', secondary: '#78350F', accent: '#F59E0B' },
              ].map((preset, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleDesignChange('primary_color', preset.primary);
                    handleDesignChange('secondary_color', preset.secondary);
                    handleDesignChange('accent_color', preset.accent);
                  }}
                  className="flex rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-teal-400 transition-colors"
                >
                  <div className="h-8 w-8" style={{ backgroundColor: preset.primary }} />
                  <div className="h-8 w-8" style={{ backgroundColor: preset.secondary }} />
                  <div className="h-8 w-8" style={{ backgroundColor: preset.accent }} />
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <Label className="text-base font-semibold">
                {isRTL ? 'خيارات متقدمة' : 'Advanced Customization'}
              </Label>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'الخط' : 'Font Family'}</Label>
              <Select
                value={card.design?.font_family || 'Inter'}
                onValueChange={(value) => handleDesignChange('font_family', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter (Modern)</SelectItem>
                  <SelectItem value="Poppins">Poppins (Friendly)</SelectItem>
                  <SelectItem value="Playfair Display">Playfair (Elegant)</SelectItem>
                  <SelectItem value="Roboto">Roboto (Clean)</SelectItem>
                  <SelectItem value="Montserrat">Montserrat (Professional)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'استدارة الحواف' : 'Border Radius'}</Label>
              <Slider
                value={[parseInt(card.design?.border_radius) || 12]}
                onValueChange={([value]) => handleDesignChange('border_radius', `${value}px`)}
                min={0}
                max={24}
                step={2}
                className="py-4"
              />
              <div className="text-xs text-slate-500 text-center">
                {card.design?.border_radius || '12px'}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'المسافات الداخلية' : 'Card Padding'}</Label>
              <Slider
                value={[parseInt(card.design?.card_padding) || 24]}
                onValueChange={([value]) => handleDesignChange('card_padding', `${value}px`)}
                min={16}
                max={48}
                step={4}
                className="py-4"
              />
              <div className="text-xs text-slate-500 text-center">
                {card.design?.card_padding || '24px'}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
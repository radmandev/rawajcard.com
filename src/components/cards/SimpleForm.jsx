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
import { toast } from 'sonner';
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
  Calendar,
  Code,
  Settings,
  MessageSquare,
  Plus,
  Trash2
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Section = ({ id, icon: Icon, title, children, isExpanded, onToggle }) => {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
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

export default function SimpleForm({ card, onChange, onSaveDraft }) {
  const { t, isRTL } = useLanguage();
  const [expandedSections, setExpandedSections] = useState(['personal']);
  const [subscription, setSubscription] = React.useState(null);

  React.useEffect(() => {
    async function fetchSubscription() {
      try {
        const subs = await api.entities.Subscription.list();
        setSubscription(subs[0] || { plan: 'free' });
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      }
    }
    fetchSubscription();
  }, []);

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

  const socialPlatforms = [
    { key: 'linkedin', label: 'LinkedIn', prefix: 'https://linkedin.com/in/', placeholder: 'yourname' },
    { key: 'twitter', label: 'Twitter / X', prefix: 'https://twitter.com/', placeholder: 'yourname' },
    { key: 'instagram', label: 'Instagram', prefix: 'https://instagram.com/', placeholder: 'yourname' },
    { key: 'facebook', label: 'Facebook', prefix: 'https://facebook.com/', placeholder: 'yourname' },
    { key: 'tiktok', label: 'TikTok', prefix: 'https://tiktok.com/@', placeholder: 'yourname' },
    { key: 'youtube', label: 'YouTube', prefix: 'https://youtube.com/@', placeholder: 'yourname' },
    { key: 'snapchat', label: 'Snapchat', prefix: 'https://snapchat.com/add/', placeholder: 'yourname' },
    { key: 'github', label: 'GitHub', prefix: 'https://github.com/', placeholder: 'yourname' },
  ];

  return (
    <div className="space-y-4">
      {/* Personal Information */}
      <Section 
        id="personal" 
        icon={User} 
        title={t('personalInfo')}
        isExpanded={expandedSections.includes('personal')}
        onToggle={() => toggleSection('personal')}
      >
        <div className="space-y-4">
          {/* Profile & Logo Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Image */}
            <div className="space-y-2">
              <Label>{isRTL ? 'الصورة الشخصية' : 'Profile Image'}</Label>
              <div className="flex flex-col items-center gap-3">
                {card.profile_image ? (
                  <div className="relative">
                    <img 
                      src={card.profile_image} 
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('profile_image', '')}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <User className="h-10 w-10 text-slate-400" />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'profile_image')}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {isRTL ? 'رفع' : 'Upload'}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            {/* Company Logo */}
            <div className="space-y-2">
              <Label>{isRTL ? 'شعار الشركة' : 'Company Logo'}</Label>
              <div className="flex flex-col items-center gap-3">
                {card.company_logo ? (
                  <div className="relative">
                    <img 
                      src={card.company_logo} 
                      alt="Logo"
                      className="h-24 w-24 rounded-lg object-contain bg-white p-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('company_logo', '')}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-slate-400" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'company_logo')}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {isRTL ? 'رفع شعار' : 'Upload'}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('name')} *</Label>
            <Input
              value={card.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={isRTL ? 'اسمك' : 'Your name'}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('jobTitle')}</Label>
            <Input
              value={card.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder={isRTL ? 'المسمى الوظيفي' : 'Your job title'}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('bio')}</Label>
            <Textarea
              value={card.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder={isRTL ? 'نبذة عنك' : 'A short bio about yourself'}
              rows={3}
            />
            <p className="text-xs text-slate-500">
              {isRTL ? 'اضغط Enter لإضافة سطر جديد' : 'Press Enter to add line breaks'}
            </p>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>{isRTL ? 'صورة الغلاف' : 'Cover Image'}</Label>
            <div className="flex items-center gap-3">
              {card.cover_image ? (
                <div className="relative h-24 w-full rounded-lg overflow-hidden">
                  <img 
                    src={card.cover_image} 
                    alt="Cover"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange('cover_image', '')}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer w-full">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'cover_image')}
                  />
                  <div className="h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center hover:border-teal-500 transition-colors">
                    <div className="text-center">
                      <Upload className="h-6 w-6 mx-auto text-slate-400 mb-1" />
                      <p className="text-sm text-slate-500">{isRTL ? 'رفع صورة غلاف' : 'Upload cover image'}</p>
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* Company & Contact */}
      <Section 
        id="company" 
        icon={Building2} 
        title={`${t('company')} & ${isRTL ? 'التواصل' : 'Contact'}`}
        isExpanded={expandedSections.includes('company')}
        onToggle={() => toggleSection('company')}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('company')}</Label>
            <Input
              value={card.company || ''}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder={isRTL ? 'اسم الشركة' : 'Company name'}
            />
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

          <div className="space-y-2">
            <Label>{t('location')}</Label>
            <Input
              value={card.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder={isRTL ? 'المدينة، البلد' : 'City, Country'}
            />
          </div>
        </div>
      </Section>

      {/* Social Links */}
      <Section 
        id="social" 
        icon={Share2} 
        title={t('socialLinks')}
        isExpanded={expandedSections.includes('social')}
        onToggle={() => toggleSection('social')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialPlatforms.map((platform) => (
            <div key={platform.key} className="space-y-2">
              <Label>{platform.label}</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 whitespace-nowrap">{platform.prefix}</span>
                <Input
                  value={(card.social_links?.[platform.key] || '').replace(platform.prefix, '')}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleSocialChange(platform.key, value ? platform.prefix + value : '');
                  }}
                  placeholder={platform.placeholder}
                  className="flex-1"
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Design */}
      <Section 
        id="design" 
        icon={Palette} 
        title={t('design')}
        isExpanded={expandedSections.includes('design')}
        onToggle={() => toggleSection('design')}
      >
        <div className="space-y-6">
          {/* Background Image */}
          <div className="space-y-2">
            <Label>{isRTL ? 'صورة الخلفية' : 'Background Image'}</Label>
            <div className="flex items-center gap-3">
              {card.design?.background_image ? (
                <div className="relative h-24 w-full rounded-lg overflow-hidden">
                  <img 
                    src={card.design.background_image} 
                    alt="Background"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDesignChange('background_image', '')}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer w-full">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const { file_url } = await api.integrations.Core.UploadFile({ file });
                        handleDesignChange('background_image', file_url);
                      }
                    }}
                  />
                  <div className="h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center hover:border-teal-500 transition-colors">
                    <div className="text-center">
                      <Upload className="h-6 w-6 mx-auto text-slate-400 mb-1" />
                      <p className="text-sm text-slate-500">{isRTL ? 'رفع صورة خلفية' : 'Upload background'}</p>
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

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
                { primary: '#0D7377', secondary: '#14274E', accent: '#00B4D8', name: 'Teal Navy' },
                { primary: '#7C3AED', secondary: '#4C1D95', accent: '#EC4899', name: 'Purple Pink' },
                { primary: '#059669', secondary: '#064E3B', accent: '#10B981', name: 'Green Emerald' },
                { primary: '#DC2626', secondary: '#7F1D1D', accent: '#F97316', name: 'Red Orange' },
                { primary: '#0EA5E9', secondary: '#0369A1', accent: '#38BDF8', name: 'Sky Blue' },
                { primary: '#D97706', secondary: '#78350F', accent: '#F59E0B', name: 'Amber Gold' },
                { primary: '#F43F5E', secondary: '#9F1239', accent: '#FB7185', name: 'Rose Red' },
                { primary: '#8B5CF6', secondary: '#6D28D9', accent: '#A78BFA', name: 'Violet Purple' },
                { primary: '#14B8A6', secondary: '#0F766E', accent: '#2DD4BF', name: 'Teal Cyan' },
                { primary: '#F59E0B', secondary: '#B45309', accent: '#FBBF24', name: 'Yellow Amber' },
                { primary: '#EC4899', secondary: '#BE185D', accent: '#F9A8D4', name: 'Pink Magenta' },
                { primary: '#6366F1', secondary: '#4338CA', accent: '#818CF8', name: 'Indigo Blue' },
              ].map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange({
                      ...card,
                      design: {
                        ...card.design,
                        primary_color: preset.primary,
                        secondary_color: preset.secondary,
                        accent_color: preset.accent
                      }
                    });
                  }}
                  className="flex rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:scale-105 transition-all"
                  title={preset.name}
                >
                  <div className="h-8 w-8" style={{ backgroundColor: preset.primary }} />
                  <div className="h-8 w-8" style={{ backgroundColor: preset.secondary }} />
                  <div className="h-8 w-8" style={{ backgroundColor: preset.accent }} />
                </button>
              ))}
            </div>
          </div>

          {/* Extract from Logo */}
          {card.company_logo && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-600" />
                {isRTL ? 'استخراج الألوان من الشعار' : 'Extract Colors from Logo'}
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    const result = await api.integrations.Core.InvokeLLM({
                      prompt: `Extract 3 distinct hex color codes from this company logo image: 
                      1. Primary color (most dominant)
                      2. Secondary color (second most used)
                      3. Accent color (highlighting/pop color)
                      Return ONLY valid hex codes starting with #`,
                      file_urls: [card.company_logo],
                      response_json_schema: {
                        type: 'object',
                        properties: {
                          primary_color: { type: 'string' },
                          secondary_color: { type: 'string' },
                          accent_color: { type: 'string' }
                        },
                        required: ['primary_color', 'secondary_color', 'accent_color']
                      }
                    });
                    
                    if (result?.primary_color) {
                      onChange({
                        ...card,
                        design: {
                          ...card.design,
                          primary_color: result.primary_color,
                          secondary_color: result.secondary_color,
                          accent_color: result.accent_color
                        }
                      });
                      toast.success(isRTL ? 'تم استخراج الألوان بنجاح' : 'Colors extracted successfully');
                    }
                  } catch (error) {
                    console.error('Color extraction failed:', error);
                    toast.error(isRTL ? 'فشل استخراج الألوان' : 'Failed to extract colors');
                  }
                }}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isRTL ? 'استخراج الألوان' : 'Extract Colors'}
              </Button>
            </div>
          )}

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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{isRTL ? 'استدارة الحواف' : 'Border Radius'}</Label>
                <span className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {(card.design?.border_radius || '12').toString().replace('px', '')}px
                </span>
              </div>
              <Slider
                value={[parseInt((card.design?.border_radius || '12').toString().replace('px', ''))]}
                onValueChange={([value]) => handleDesignChange('border_radius', `${value}px`)}
                min={0}
                max={32}
                step={2}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{isRTL ? 'المسافات الداخلية' : 'Card Padding'}</Label>
                <span className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {(card.design?.card_padding || '24').toString().replace('px', '')}px
                </span>
              </div>
              <Slider
                value={[parseInt((card.design?.card_padding || '24').toString().replace('px', ''))]}
                onValueChange={([value]) => handleDesignChange('card_padding', `${value}px`)}
                min={12}
                max={48}
                step={4}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Appointment Booking */}
      <Section 
        id="appointments" 
        icon={Calendar} 
        title={
          <div className="flex items-center gap-2">
            {isRTL ? 'حجز المواعيد' : 'Appointment Booking'}
            {subscription?.plan !== 'premium' && (
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold">
                {isRTL ? 'مميز' : 'PREMIUM'}
              </span>
            )}
          </div>
        }
        isExpanded={expandedSections.includes('appointments')}
        onToggle={() => toggleSection('appointments')}
      >
        <div className="space-y-4">
          {subscription?.plan !== 'premium' ? (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-xl p-6 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-amber-500 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {isRTL ? 'ميزة مميزة' : 'Premium Feature'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                {isRTL 
                  ? 'قم بالترقية إلى الخطة المميزة لتفعيل حجز المواعيد'
                  : 'Upgrade to Premium to enable appointment booking'
                }
              </p>
              <Button
                onClick={onSaveDraft}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              >
                {isRTL ? 'ترقية الآن' : 'Upgrade Now'}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label>{isRTL ? 'تفعيل حجز المواعيد' : 'Enable Appointment Booking'}</Label>
                <Switch
                  checked={card.appointment_settings?.enabled || false}
                  onCheckedChange={(checked) => {
                onChange({
                  ...card,
                  appointment_settings: {
                    ...card.appointment_settings,
                    enabled: checked,
                    appointments: card.appointment_settings?.appointments || []
                  }
                });
              }}
            />
          </div>

          {card.appointment_settings?.enabled && (
            <div className="space-y-4 pt-4">
              {(card.appointment_settings?.appointments || []).map((apt, index) => (
                <div key={index} className="p-4 bg-white dark:bg-slate-800 rounded-lg border space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{isRTL ? `موعد ${index + 1}` : `Appointment ${index + 1}`}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newAppointments = card.appointment_settings.appointments.filter((_, i) => i !== index);
                        onChange({
                          ...card,
                          appointment_settings: {
                            ...card.appointment_settings,
                            appointments: newAppointments
                          }
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder={isRTL ? 'العنوان' : 'Title'}
                      value={apt.title || ''}
                      onChange={(e) => {
                        const newAppointments = [...card.appointment_settings.appointments];
                        newAppointments[index] = { ...apt, title: e.target.value };
                        onChange({
                          ...card,
                          appointment_settings: {
                            ...card.appointment_settings,
                            appointments: newAppointments
                          }
                        });
                      }}
                    />
                    <Input
                      placeholder={isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}
                      value={apt.title_ar || ''}
                      onChange={(e) => {
                        const newAppointments = [...card.appointment_settings.appointments];
                        newAppointments[index] = { ...apt, title_ar: e.target.value };
                        onChange({
                          ...card,
                          appointment_settings: {
                            ...card.appointment_settings,
                            appointments: newAppointments
                          }
                        });
                      }}
                    />
                  </div>

                  <Textarea
                    placeholder={isRTL ? 'الوصف' : 'Description'}
                    value={apt.description || ''}
                    onChange={(e) => {
                      const newAppointments = [...card.appointment_settings.appointments];
                      newAppointments[index] = { ...apt, description: e.target.value };
                      onChange({
                        ...card,
                        appointment_settings: {
                          ...card.appointment_settings,
                          appointments: newAppointments
                        }
                      });
                    }}
                    rows={2}
                  />

                  <Input
                    placeholder={isRTL ? 'رابط الحجز (Calendly, etc.)' : 'Booking URL (Calendly, etc.)'}
                    value={apt.url || ''}
                    onChange={(e) => {
                      const newAppointments = [...card.appointment_settings.appointments];
                      newAppointments[index] = { ...apt, url: e.target.value };
                      onChange({
                        ...card,
                        appointment_settings: {
                          ...card.appointment_settings,
                          appointments: newAppointments
                        }
                      });
                    }}
                  />

                  <Input
                    placeholder={isRTL ? 'نص الزر' : 'Button Label'}
                    value={apt.button_label || ''}
                    onChange={(e) => {
                      const newAppointments = [...card.appointment_settings.appointments];
                      newAppointments[index] = { ...apt, button_label: e.target.value };
                      onChange({
                        ...card,
                        appointment_settings: {
                          ...card.appointment_settings,
                          appointments: newAppointments
                        }
                      });
                    }}
                  />
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() => {
                  const newAppointment = {
                    title: '',
                    title_ar: '',
                    description: '',
                    url: '',
                    button_label: ''
                  };
                  onChange({
                    ...card,
                    appointment_settings: {
                      ...card.appointment_settings,
                      appointments: [...(card.appointment_settings.appointments || []), newAppointment]
                    }
                  });
                }}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {isRTL ? 'إضافة موعد' : 'Add Appointment'}
              </Button>
            </div>
          )}
            </>
          )}
        </div>
      </Section>

      {/* Custom Form Embed */}
      <Section 
        id="customForm" 
        icon={Code} 
        title={
          <div className="flex items-center gap-2">
            {isRTL ? 'نموذج مخصص' : 'Custom Form'}
            {subscription?.plan !== 'premium' && (
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold">
                {isRTL ? 'مميز' : 'PREMIUM'}
              </span>
            )}
          </div>
        }
        isExpanded={expandedSections.includes('customForm')}
        onToggle={() => toggleSection('customForm')}
      >
        <div className="space-y-4">
          {subscription?.plan !== 'premium' ? (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-xl p-6 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-amber-500 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {isRTL ? 'ميزة مميزة' : 'Premium Feature'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                {isRTL 
                  ? 'قم بالترقية إلى الخطة المميزة لتفعيل النماذج المخصصة'
                  : 'Upgrade to Premium to enable custom forms'
                }
              </p>
              <Button
                onClick={onSaveDraft}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              >
                {isRTL ? 'ترقية الآن' : 'Upgrade Now'}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label>{isRTL ? 'تفعيل النموذج المخصص' : 'Enable Custom Form'}</Label>
                <Switch
                  checked={card.custom_form_embed?.enabled || false}
                  onCheckedChange={(checked) => {
                onChange({
                  ...card,
                  custom_form_embed: {
                    ...card.custom_form_embed,
                    enabled: checked
                  }
                });
              }}
            />
          </div>

          {card.custom_form_embed?.enabled && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder={isRTL ? 'عنوان النموذج' : 'Form Title'}
                  value={card.custom_form_embed?.title || ''}
                  onChange={(e) => {
                    onChange({
                      ...card,
                      custom_form_embed: {
                        ...card.custom_form_embed,
                        title: e.target.value
                      }
                    });
                  }}
                />
                <Input
                  placeholder={isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}
                  value={card.custom_form_embed?.title_ar || ''}
                  onChange={(e) => {
                    onChange({
                      ...card,
                      custom_form_embed: {
                        ...card.custom_form_embed,
                        title_ar: e.target.value
                      }
                    });
                  }}
                />
              </div>

              <Textarea
                placeholder={isRTL ? 'كود HTML أو JavaScript' : 'HTML or JavaScript code'}
                value={card.custom_form_embed?.html_code || ''}
                onChange={(e) => {
                  onChange({
                    ...card,
                    custom_form_embed: {
                      ...card.custom_form_embed,
                      html_code: e.target.value
                    }
                  });
                }}
                rows={8}
                className="font-mono text-xs"
              />
              <p className="text-xs text-slate-500">
                {isRTL 
                  ? 'الصق كود HTML أو JavaScript للنموذج (من Google Forms، Typeform، إلخ)'
                  : 'Paste HTML or JavaScript code for your form (from Google Forms, Typeform, etc.)'
                }
              </p>
            </div>
          )}
            </>
          )}
        </div>
      </Section>

      {/* Contact Collection Form */}
      <Section 
        id="contactForm" 
        icon={MessageSquare} 
        title={
          <div className="flex items-center gap-2">
            {isRTL ? 'نموذج جمع جهات الاتصال' : 'Collect Contacts'}
            {subscription?.plan !== 'premium' && (
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold">
                {isRTL ? 'مميز' : 'PREMIUM'}
              </span>
            )}
          </div>
        }
        isExpanded={expandedSections.includes('contactForm')}
        onToggle={() => toggleSection('contactForm')}
      >
        <div className="space-y-4">
          {subscription?.plan !== 'premium' ? (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-xl p-6 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-amber-500 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {isRTL ? 'ميزة مميزة' : 'Premium Feature'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                {isRTL 
                  ? 'قم بالترقية إلى الخطة المميزة لجمع جهات الاتصال'
                  : 'Upgrade to Premium to collect visitor contacts'
                }
              </p>
              <Button
                onClick={onSaveDraft}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              >
                {isRTL ? 'ترقية الآن' : 'Upgrade Now'}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <Label>{isRTL ? 'تفعيل جمع جهات الاتصال' : 'Enable Contact Collection'}</Label>
                  <p className="text-xs text-slate-500 mt-1">
                    {isRTL ? 'جمع معلومات الزوار تلقائياً' : 'Collect visitor information automatically'}
                  </p>
                </div>
                <Switch
                  checked={card.contact_form?.enabled || false}
                  onCheckedChange={(checked) => {
                onChange({
                  ...card,
                  contact_form: {
                    ...card.contact_form,
                    enabled: checked,
                    form_name: card.contact_form?.form_name || 'Contact Collection',
                    title: card.contact_form?.title || 'Get in touch',
                    description: card.contact_form?.description || 'Please provide your information',
                    form_type: card.contact_form?.form_type || 'overlay',
                    display_type: card.contact_form?.display_type || 'popup',
                    show_trigger: card.contact_form?.show_trigger || 'after_delay',
                    delay_seconds: card.contact_form?.delay_seconds || 3,
                    allow_dismiss: card.contact_form?.allow_dismiss !== false,
                    show_once: card.contact_form?.show_once !== false,
                    button_label: card.contact_form?.button_label || 'Submit',
                    success_message: card.contact_form?.success_message || 'Thank you for your response!',
                    fields: card.contact_form?.fields || [
                      { label: 'Your Name', type: 'text', required: true, placeholder: 'Enter your name' },
                      { label: 'Your Email', type: 'email', required: true, placeholder: 'your@email.com' },
                      { label: 'Your Phone', type: 'phone', required: false, placeholder: '+966 5X XXX XXXX' }
                    ]
                  }
                });
              }}
            />
          </div>

          {card.contact_form?.enabled && (
            <div className="space-y-4 pt-4 border-t">
              <Input
                placeholder={isRTL ? 'اسم النموذج' : 'Form Name'}
                value={card.contact_form?.form_name || ''}
                onChange={(e) => {
                  onChange({
                    ...card,
                    contact_form: {
                      ...card.contact_form,
                      form_name: e.target.value
                    }
                  });
                }}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder={isRTL ? 'العنوان' : 'Title'}
                  value={card.contact_form?.title || ''}
                  onChange={(e) => {
                    onChange({
                      ...card,
                      contact_form: {
                        ...card.contact_form,
                        title: e.target.value
                      }
                    });
                  }}
                />
                <Input
                  placeholder={isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}
                  value={card.contact_form?.title_ar || ''}
                  onChange={(e) => {
                    onChange({
                      ...card,
                      contact_form: {
                        ...card.contact_form,
                        title_ar: e.target.value
                      }
                    });
                  }}
                />
              </div>

              <Textarea
                placeholder={isRTL ? 'الوصف' : 'Description'}
                value={card.contact_form?.description || ''}
                onChange={(e) => {
                  onChange({
                    ...card,
                    contact_form: {
                      ...card.contact_form,
                      description: e.target.value
                    }
                  });
                }}
                rows={2}
              />

              <div className="space-y-3 pt-2">
                <Label className="text-sm font-semibold">{isRTL ? 'نوع النموذج' : 'Form Type'}</Label>
                <RadioGroup
                  value={card.contact_form?.form_type || 'overlay'}
                  onValueChange={(value) => {
                    onChange({
                      ...card,
                      contact_form: {
                        ...card.contact_form,
                        form_type: value
                      }
                    });
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="overlay" id="overlay" />
                    <Label htmlFor="overlay">{isRTL ? 'نافذة منبثقة' : 'Overlay'}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inline" id="inline" />
                    <Label htmlFor="inline">{isRTL ? 'ضمن الصفحة' : 'Inline'}</Label>
                  </div>
                </RadioGroup>
              </div>

              {card.contact_form?.form_type === 'overlay' && (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">{isRTL ? 'الحجم' : 'Size'}</Label>
                    <RadioGroup
                      value={card.contact_form?.display_type || 'popup'}
                      onValueChange={(value) => {
                        onChange({
                          ...card,
                          contact_form: {
                            ...card.contact_form,
                            display_type: value
                          }
                        });
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="popup" id="popup" />
                        <Label htmlFor="popup">{isRTL ? 'نافذة' : 'Popup'}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="full_screen" id="full_screen" />
                        <Label htmlFor="full_screen">{isRTL ? 'ملء الشاشة' : 'Full Screen'}</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">{isRTL ? 'عرض النموذج' : 'Show Form'}</Label>
                    <RadioGroup
                      value={card.contact_form?.show_trigger || 'after_delay'}
                      onValueChange={(value) => {
                        onChange({
                          ...card,
                          contact_form: {
                            ...card.contact_form,
                            show_trigger: value
                          }
                        });
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="after_delay" id="after_delay" />
                        <Label htmlFor="after_delay">{isRTL ? 'بعد تأخير' : 'After Delay'}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="on_scroll" id="on_scroll" />
                        <Label htmlFor="on_scroll">{isRTL ? 'عند التمرير' : 'On Scroll'}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="on_click" id="on_click" />
                        <Label htmlFor="on_click">{isRTL ? 'عند النقر' : 'On Click'}</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {card.contact_form?.show_trigger === 'after_delay' && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={card.contact_form?.delay_seconds || 3}
                        onChange={(e) => {
                          onChange({
                            ...card,
                            contact_form: {
                              ...card.contact_form,
                              delay_seconds: parseInt(e.target.value)
                            }
                          });
                        }}
                        className="w-20"
                      />
                      <Label>{isRTL ? 'ثانية' : 'Seconds'}</Label>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label>{isRTL ? 'السماح بإغلاق النموذج' : 'Allow to dismiss form'}</Label>
                    <Switch
                      checked={card.contact_form?.allow_dismiss !== false}
                      onCheckedChange={(checked) => {
                        onChange({
                          ...card,
                          contact_form: {
                            ...card.contact_form,
                            allow_dismiss: checked
                          }
                        });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{isRTL ? 'عدم عرض النموذج مرة أخرى' : "Don't show multiple times"}</Label>
                    <Switch
                      checked={card.contact_form?.show_once !== false}
                      onCheckedChange={(checked) => {
                        onChange({
                          ...card,
                          contact_form: {
                            ...card.contact_form,
                            show_once: checked
                          }
                        });
                      }}
                    />
                  </div>
                </>
              )}

              <div className="pt-4 border-t">
                <Label className="text-sm font-semibold mb-3 block">{isRTL ? 'حقول النموذج' : 'Form Fields'}</Label>
                <div className="space-y-3">
                  {(card.contact_form?.fields || []).map((field, index) => (
                    <div key={index} className="p-3 bg-white dark:bg-slate-800 rounded-lg border space-y-2">
                      <div className="flex justify-between items-start mb-2">
                        <Input
                          placeholder={isRTL ? 'عنوان الحقل' : 'Field Label'}
                          value={field.label || ''}
                          onChange={(e) => {
                            const newFields = [...card.contact_form.fields];
                            newFields[index] = { ...field, label: e.target.value };
                            onChange({
                              ...card,
                              contact_form: {
                                ...card.contact_form,
                                fields: newFields
                              }
                            });
                          }}
                          className="flex-1 mr-2"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newFields = card.contact_form.fields.filter((_, i) => i !== index);
                            onChange({
                              ...card,
                              contact_form: {
                                ...card.contact_form,
                                fields: newFields
                              }
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={field.type || 'text'}
                          onValueChange={(value) => {
                            const newFields = [...card.contact_form.fields];
                            newFields[index] = { ...field, type: value };
                            onChange({
                              ...card,
                              contact_form: {
                                ...card.contact_form,
                                fields: newFields
                              }
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">{isRTL ? 'نص' : 'Text'}</SelectItem>
                            <SelectItem value="email">{isRTL ? 'بريد' : 'Email'}</SelectItem>
                            <SelectItem value="phone">{isRTL ? 'هاتف' : 'Phone'}</SelectItem>
                            <SelectItem value="textarea">{isRTL ? 'نص طويل' : 'Textarea'}</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.required || false}
                            onCheckedChange={(checked) => {
                              const newFields = [...card.contact_form.fields];
                              newFields[index] = { ...field, required: checked };
                              onChange({
                                ...card,
                                contact_form: {
                                  ...card.contact_form,
                                  fields: newFields
                                }
                              });
                            }}
                          />
                          <Label className="text-xs">{isRTL ? 'مطلوب' : 'Required'}</Label>
                        </div>
                      </div>

                      <Input
                        placeholder={isRTL ? 'نص تلميحي' : 'Placeholder'}
                        value={field.placeholder || ''}
                        onChange={(e) => {
                          const newFields = [...card.contact_form.fields];
                          newFields[index] = { ...field, placeholder: e.target.value };
                          onChange({
                            ...card,
                            contact_form: {
                              ...card.contact_form,
                              fields: newFields
                            }
                          });
                        }}
                      />
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={() => {
                      const newField = {
                        label: 'New Field',
                        type: 'text',
                        required: false,
                        placeholder: ''
                      };
                      onChange({
                        ...card,
                        contact_form: {
                          ...card.contact_form,
                          fields: [...(card.contact_form.fields || []), newField]
                        }
                      });
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isRTL ? 'إضافة حقل' : 'Add Field'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Input
                  placeholder={isRTL ? 'نص الزر' : 'Button Label'}
                  value={card.contact_form?.button_label || ''}
                  onChange={(e) => {
                    onChange({
                      ...card,
                      contact_form: {
                        ...card.contact_form,
                        button_label: e.target.value
                      }
                    });
                  }}
                />
                <Input
                  placeholder={isRTL ? 'نص الزر (عربي)' : 'Button Label (AR)'}
                  value={card.contact_form?.button_label_ar || ''}
                  onChange={(e) => {
                    onChange({
                      ...card,
                      contact_form: {
                        ...card.contact_form,
                        button_label_ar: e.target.value
                      }
                    });
                  }}
                />
              </div>

              <Textarea
                placeholder={isRTL ? 'رسالة النجاح' : 'Success Message'}
                value={card.contact_form?.success_message || ''}
                onChange={(e) => {
                  onChange({
                    ...card,
                    contact_form: {
                      ...card.contact_form,
                      success_message: e.target.value
                    }
                  });
                }}
                rows={2}
              />
            </div>
          )}
            </>
          )}
        </div>
      </Section>

      {/* CRM Integration - Coming Soon */}
      <Section 
        id="crm" 
        icon={Settings} 
        title={
          <div className="flex items-center gap-2">
            {isRTL ? 'ربط CRM' : 'CRM Integration'}
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              {isRTL ? 'قريباً' : 'SOON'}
            </span>
          </div>
        }
        isExpanded={expandedSections.includes('crm')}
        onToggle={() => toggleSection('crm')}
      >
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-blue-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {isRTL ? 'قريباً' : 'Coming Soon'}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {isRTL 
              ? 'ربط تلقائي مع Bitrix24، HubSpot، Salesforce وغيرها'
              : 'Automatic integration with Bitrix24, HubSpot, Salesforce and more'
            }
          </p>
        </div>
      </Section>

      {/* Floating Actions Settings */}
      <Section 
        id="floatingActions" 
        icon={Settings} 
        title={isRTL ? 'الأزرار العائمة' : 'Floating Actions'}
        isExpanded={expandedSections.includes('floatingActions')}
        onToggle={() => toggleSection('floatingActions')}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{isRTL ? 'حفظ جهة الاتصال' : 'Save Contact Button'}</Label>
            <Switch
              checked={card.floating_actions?.save_contact !== false}
              onCheckedChange={(checked) => {
                onChange({
                  ...card,
                  floating_actions: {
                    ...card.floating_actions,
                    save_contact: checked
                  }
                });
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>{isRTL ? 'عرض QR' : 'Show QR Code Button'}</Label>
            <Switch
              checked={card.floating_actions?.show_qr !== false}
              onCheckedChange={(checked) => {
                onChange({
                  ...card,
                  floating_actions: {
                    ...card.floating_actions,
                    show_qr: checked
                  }
                });
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>{isRTL ? 'مشاركة البطاقة' : 'Share Card Button'}</Label>
            <Switch
              checked={card.floating_actions?.share_card !== false}
              onCheckedChange={(checked) => {
                onChange({
                  ...card,
                  floating_actions: {
                    ...card.floating_actions,
                    share_card: checked
                  }
                });
              }}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
/**
 * Master list of all card templates.
 * `defaultTier` is the built-in default — admin can override via app_settings.
 */
export const ALL_TEMPLATES = [
  {
    id: 'navy_gold',
    name: 'Navy Gold',
    nameAr: 'الأزرق الذهبي',
    description: 'Professional navy with gold accents',
    descriptionAr: 'أزرق داكن احترافي مع لمسات ذهبية',
    colors: ['#14274E', '#F4B400', '#FFFFFF'],
    preview: 'bg-gradient-to-br from-[#14274E] to-[#0D1B3E]',
    defaultTier: 'free',
  },
  {
    id: 'dark_minimal',
    name: 'Dark Minimal',
    nameAr: 'الداكن البسيط',
    description: 'Sleek black and white design',
    descriptionAr: 'تصميم أسود وأبيض أنيق',
    colors: ['#000000', '#1F2937', '#FFFFFF'],
    preview: 'bg-gradient-to-br from-black to-slate-900',
    defaultTier: 'free',
  },
  {
    id: 'purple_coral',
    name: 'Purple Coral',
    nameAr: 'البنفسجي المرجاني',
    description: 'Vibrant purple with coral highlights',
    descriptionAr: 'بنفسجي نابض مع لمسات مرجانية',
    colors: ['#7C3AED', '#F87171', '#FFFFFF'],
    preview: 'bg-gradient-to-br from-purple-600 to-violet-800',
    defaultTier: 'free',
  },
  {
    id: 'earthy_minimal',
    name: 'Earthy',
    nameAr: 'الترابي',
    description: 'Warm earthy tones with organic feel',
    descriptionAr: 'ألوان ترابية دافئة بإحساس طبيعي',
    colors: ['#92400E', '#FEF7ED', '#D97706'],
    preview: 'bg-gradient-to-br from-amber-100 to-orange-100',
    defaultTier: 'free',
  },
  {
    id: 'pink_modern',
    name: 'Rose Modern',
    nameAr: 'الوردي العصري',
    description: 'Fresh pink modern aesthetic',
    descriptionAr: 'جمالية وردية عصرية منعشة',
    colors: ['#F43F5E', '#FFF1F2', '#FB7185'],
    preview: 'bg-gradient-to-br from-pink-100 to-rose-200',
    defaultTier: 'free',
  },
  {
    id: 'orange_pro',
    name: 'Pro Business',
    nameAr: 'الأعمال الاحترافي',
    description: 'Corporate indigo with orange accent',
    descriptionAr: 'نيلي احترافي مع لمسة برتقالية',
    colors: ['#3730A3', '#F97316', '#F8FAFC'],
    preview: 'bg-gradient-to-br from-indigo-700 to-purple-800',
    defaultTier: 'free',
  },
  {
    id: 'noqtatain1',
    name: 'Wave Blue',
    nameAr: 'موجة زرقاء',
    description: 'Elegant wave design with profile focus',
    descriptionAr: 'تصميم موجي أنيق مع تركيز على الملف الشخصي',
    colors: ['#1e40af', '#93c5fd', '#FFFFFF'],
    preview: 'bg-gradient-to-br from-blue-600 to-blue-900',
    defaultTier: 'free',
  },
  {
    id: 'noqtatain2',
    name: 'Gradient Pro',
    nameAr: 'متدرج احترافي',
    description: 'Modern gradient with clean layout',
    descriptionAr: 'تدرج حديث مع تخطيط نظيف',
    colors: ['#0f172a', '#6366f1', '#e0e7ff'],
    preview: 'bg-gradient-to-br from-slate-900 to-indigo-900',
    defaultTier: 'free',
  },
  {
    id: 'noqtatain3',
    name: 'Cover Style',
    nameAr: 'نمط الغلاف',
    description: 'Cover image with overlaid profile',
    descriptionAr: 'صورة غلاف مع ملف شخصي متراكب',
    colors: ['#1e293b', '#38bdf8', '#FFFFFF'],
    preview: 'bg-gradient-to-br from-slate-800 to-sky-900',
    defaultTier: 'free',
  },
  {
    id: 'noqtatain4',
    name: 'Wave Pro',
    nameAr: 'موجة احترافية',
    description: 'Professional wave background design',
    descriptionAr: 'تصميم خلفية موجية احترافية',
    colors: ['#0f766e', '#99f6e4', '#FFFFFF'],
    preview: 'bg-gradient-to-br from-teal-700 to-teal-900',
    defaultTier: 'free',
  },
  {
    id: 'noqtatain6',
    name: 'Color Pop',
    nameAr: 'انفجار الألوان',
    description: 'Vibrant colored background with modern feel',
    descriptionAr: 'خلفية ملونة نابضة بالحياة مع إحساس عصري',
    colors: ['#ec4899', '#fbbf24', '#FFFFFF'],
    preview: 'bg-gradient-to-br from-pink-500 to-yellow-400',
    defaultTier: 'free',
  },
  {
    id: 'modern_gradient',
    name: 'Modern Gradient',
    nameAr: 'التدرج العصري',
    description: 'Rich gradient with contemporary layout',
    descriptionAr: 'تدرج غني مع تخطيط معاصر',
    colors: ['#6d28d9', '#db2777', '#f9fafb'],
    preview: 'bg-gradient-to-br from-violet-700 to-pink-600',
    defaultTier: 'premium',
  },
  {
    id: 'luxury_gold',
    name: 'Luxury Gold',
    nameAr: 'الذهبي الفاخر',
    description: 'Opulent dark design with gold luxury feel',
    descriptionAr: 'تصميم داكن فاخر بإحساس ذهبي راقٍ',
    colors: ['#1c1917', '#ca8a04', '#fef9c3'],
    preview: 'bg-gradient-to-br from-stone-900 to-yellow-900',
    defaultTier: 'premium',
  },
  {
    id: 'tech_blue',
    name: 'Tech Blue',
    nameAr: 'الأزرق التقني',
    description: 'Clean tech aesthetic with electric blue',
    descriptionAr: 'جمالية تقنية نظيفة باللون الأزرق الكهربائي',
    colors: ['#0f172a', '#0ea5e9', '#e0f2fe'],
    preview: 'bg-gradient-to-br from-slate-900 to-sky-900',
    defaultTier: 'premium',
  },
  {
    id: 'sunset_warm',
    name: 'Sunset Warm',
    nameAr: 'الغروب الدافئ',
    description: 'Warm sunset gradients with soft tones',
    descriptionAr: 'تدرجات غروب دافئة بألوان ناعمة',
    colors: ['#c2410c', '#fb923c', '#fef3c7'],
    preview: 'bg-gradient-to-br from-orange-700 to-amber-400',
    defaultTier: 'premium',
  },
  {
    id: 'forest_green',
    name: 'Forest Green',
    nameAr: 'أخضر الغابة',
    description: 'Lush nature-inspired green palette',
    descriptionAr: 'لوحة ألوان طبيعية غنية بالأخضر',
    colors: ['#14532d', '#4ade80', '#f0fdf4'],
    preview: 'bg-gradient-to-br from-green-900 to-green-600',
    defaultTier: 'premium',
  },
  {
    id: 'aurora_glass',
    name: 'Aurora Glass',
    nameAr: 'أورورا زجاجي',
    description: 'Animated aurora with glassmorphism cards',
    descriptionAr: 'خلفية أورورا متحركة مع تصميم زجاجي عصري',
    colors: ['#7c3aed', '#38bdf8', '#f472b6'],
    preview: 'bg-gradient-to-br from-[#0f0c29] via-[#1a0533] to-[#0d1b6e]',
    defaultTier: 'premium',
  },
];

/** Default tier map derived from the list above */
export const DEFAULT_TIERS = Object.fromEntries(
  ALL_TEMPLATES.map(t => [t.id, t.defaultTier])
);

/** Plans that unlock premium templates */
export const PREMIUM_PLANS = ['premium', 'teams', 'enterprise'];

/** Check if a template is accessible for a given plan + tier overrides */
export function canUseTemplate(templateId, userPlan, tiersOverride = {}) {
  const tiers = { ...DEFAULT_TIERS, ...tiersOverride };
  const tier = tiers[templateId] ?? 'free';
  if (tier === 'free') return true;
  return PREMIUM_PLANS.includes(userPlan);
}

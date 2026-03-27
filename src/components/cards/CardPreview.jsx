import React from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import TemplateNavyGold from './templates/TemplateNavyGold';
import TemplateDarkMinimal from './templates/TemplateDarkMinimal';
import TemplatePurpleCoral from './templates/TemplatePurpleCoral';
import TemplateEarthyMinimal from './templates/TemplateEarthyMinimal';
import TemplatePinkModern from './templates/TemplatePinkModern';
import TemplateOrangePro from './templates/TemplateOrangePro';
import TemplateNoqtatain1 from './templates/TemplateNoqtatain1';
import TemplateNoqtatain2 from './templates/TemplateNoqtatain2';
import TemplateNoqtatain3 from './templates/TemplateNoqtatain3';
import TemplateNoqtatain4 from './templates/TemplateNoqtatain4';
import TemplateNoqtatain6 from './templates/TemplateNoqtatain6';
import TemplateModernGradient from './templates/TemplateModernGradient';
import TemplateLuxuryGold from './templates/TemplateLuxuryGold';
import TemplateTechBlue from './templates/TemplateTechBlue';
import TemplateSunsetWarm from './templates/TemplateSunsetWarm';
import TemplateForestGreen from './templates/TemplateForestGreen';
import TemplateAuroraGlass from './templates/TemplateAuroraGlass';

const templateComponents = {
  navy_gold: TemplateNavyGold,
  dark_minimal: TemplateDarkMinimal,
  purple_coral: TemplatePurpleCoral,
  earthy_minimal: TemplateEarthyMinimal,
  pink_modern: TemplatePinkModern,
  orange_pro: TemplateOrangePro,
  noqtatain1: TemplateNoqtatain1,
  noqtatain2: TemplateNoqtatain2,
  noqtatain3: TemplateNoqtatain3,
  noqtatain4: TemplateNoqtatain4,
  noqtatain6: TemplateNoqtatain6,
  modern_gradient: TemplateModernGradient,
  luxury_gold: TemplateLuxuryGold,
  tech_blue: TemplateTechBlue,
  sunset_warm: TemplateSunsetWarm,
  forest_green: TemplateForestGreen,
  aurora_glass: TemplateAuroraGlass,
  // Legacy mappings
  modern: TemplateNavyGold,
  classic: TemplateDarkMinimal,
  minimal: TemplateEarthyMinimal,
  bold: TemplatePurpleCoral,
  gradient: TemplatePinkModern,
  elegant: TemplateOrangePro,
  creative: TemplatePurpleCoral,
};

export default function CardPreview({ card, template, showPlaceholder, onLinkClick, editMode = false, onCardChange }) {
  const { isRTL } = useLanguage();
  
  const cardData = showPlaceholder ? {
    name: isRTL ? 'اسمك هنا' : 'Your Name',
    title: isRTL ? 'المسمى الوظيفي' : 'Job Title',
    company: isRTL ? 'الشركة' : 'Company',
    bio: isRTL ? 'نبذة عنك تظهر هنا...' : 'Your bio appears here...',
    email: 'email@example.com',
    phone: '+966 5X XXX XXXX',
    social_links: { linkedin: '#', twitter: '#', instagram: '#' },
    design: card?.design || {}
  } : card;

  const TemplateComponent = templateComponents[template] || TemplateNavyGold;

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl max-w-sm mx-auto">
      <TemplateComponent 
        card={cardData} 
        isRTL={isRTL} 
        onLinkClick={onLinkClick}
        editMode={editMode}
        onCardChange={onCardChange}
      />
    </div>
  );
}
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function TemplatePreview({ layout, onClose }) {
  const { sections = [], colors, fonts, spacing } = layout;

  const spacingValues = {
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem'
  };

  const sectionSpacing = spacingValues[spacing?.section] || '1rem';
  const paddingValue = spacingValues[spacing?.padding] || '1rem';

  const renderSection = (section) => {
    if (!section.visible) return null;

    const style = {
      padding: paddingValue,
      marginBottom: sectionSpacing
    };

    switch (section.type) {
      case 'header':
        return (
          <div
            key={section.id}
            style={{
              ...style,
              background: colors?.primary || '#0D7377',
              height: `${section.settings?.height || 200}px`,
              position: 'relative'
            }}
          >
            {section.settings?.showWave && (
              <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 40" preserveAspectRatio="none">
                <path d="M0,40 L0,20 Q100,0 200,20 T400,20 L400,40 Z" fill={colors?.accent || '#F4B400'} />
              </svg>
            )}
          </div>
        );

      case 'profile':
        return (
          <div key={section.id} style={style} className="flex justify-center -mt-12">
            <div
              style={{
                width: `${section.settings?.size || 120}px`,
                height: `${section.settings?.size || 120}px`,
                borderRadius: section.settings?.shape === 'circle' ? '50%' : section.settings?.shape === 'rounded' ? '1rem' : '0',
                background: colors?.accent || '#F4B400',
                border: section.settings?.showBorder !== false ? '4px solid white' : 'none'
              }}
            />
          </div>
        );

      case 'info':
        return (
          <div key={section.id} style={{ ...style, textAlign: section.settings?.align || 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors?.text }}>John Doe</h2>
            <p style={{ color: colors?.secondary }}>Senior Developer</p>
            {section.settings?.showCompany !== false && (
              <p style={{ color: colors?.accent }}>Tech Company</p>
            )}
            {section.settings?.showLocation !== false && (
              <p style={{ fontSize: '0.875rem', color: colors?.text }}>📍 San Francisco, CA</p>
            )}
          </div>
        );

      case 'bio':
        return (
          <div key={section.id} style={style}>
            <p style={{ color: colors?.text, lineClamp: section.settings?.maxLines || 'unset' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            {section.settings?.showReadMore && (
              <button style={{ color: colors?.accent, marginTop: '0.5rem' }}>Read more...</button>
            )}
          </div>
        );

      case 'social':
        return (
          <div key={section.id} style={{ ...style, display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            {['LinkedIn', 'Twitter', 'Instagram'].map(social => (
              <div
                key={social}
                style={{
                  width: `${section.settings?.iconSize || 24}px`,
                  height: `${section.settings?.iconSize || 24}px`,
                  background: section.settings?.colorful ? colors?.accent : colors?.secondary,
                  borderRadius: '50%'
                }}
              />
            ))}
          </div>
        );

      case 'contact':
        return (
          <div
            key={section.id}
            style={{
              ...style,
              display: section.settings?.layout === 'list' ? 'block' : 'grid',
              gridTemplateColumns: section.settings?.layout === 'grid' ? 'repeat(2, 1fr)' : '1fr',
              gap: '0.5rem'
            }}
          >
            {['Email', 'Phone', 'WhatsApp'].map(contact => (
              <div key={contact} style={{ padding: '0.5rem', background: colors?.background, border: `1px solid ${colors?.secondary}`, borderRadius: '0.5rem' }}>
                {section.settings?.showIcons !== false && '📧 '}
                {contact}
              </div>
            ))}
          </div>
        );

      case 'gallery':
        return (
          <div
            key={section.id}
            style={{
              ...style,
              display: 'grid',
              gridTemplateColumns: `repeat(${section.settings?.columns || 3}, 1fr)`,
              gap: spacingValues[section.settings?.gap] || '1rem'
            }}
          >
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  aspectRatio: '1',
                  background: colors?.secondary,
                  borderRadius: '0.5rem'
                }}
              />
            ))}
          </div>
        );

      case 'custom':
        return (
          <div key={section.id} style={style} dangerouslySetInnerHTML={{ __html: section.settings?.html || '' }} />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-auto p-0">
        <div className="sticky top-0 bg-white dark:bg-slate-900 p-4 border-b flex justify-between items-center z-10">
          <h3 className="font-semibold">Preview</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div style={{ background: colors?.background, fontFamily: fonts?.body }}>
          {sections.sort((a, b) => a.order - b.order).map(renderSection)}
        </div>
      </DialogContent>
    </Dialog>
  );
}
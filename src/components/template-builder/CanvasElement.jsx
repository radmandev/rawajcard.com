import React from 'react';
import { 
  User, 
  Briefcase, 
  Building, 
  FileText, 
  Phone, 
  Mail, 
  MessageCircle,
  MapPin,
  QrCode,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Facebook
} from 'lucide-react';

export default function CanvasElement({ element, theme, onUpdate }) {
  const applyGlobalStyles = (type, baseStyles) => {
    let styles = { ...baseStyles };
    
    // Apply font families
    if (type === 'name' || type === 'title') {
      styles.fontFamily = theme.fonts.heading;
      if (theme.globalStyles?.titleStyle) {
        styles = { ...styles, ...theme.globalStyles.titleStyle };
      }
    } else {
      styles.fontFamily = theme.fonts.body;
      if (theme.globalStyles?.textStyle && (type === 'bio' || type === 'company' || type === 'location')) {
        styles = { ...styles, ...theme.globalStyles.textStyle };
      }
    }
    
    // Apply button styles
    if (type.includes('button') && theme.globalStyles?.buttonStyle) {
      styles = { ...styles, ...theme.globalStyles.buttonStyle };
    }
    
    return styles;
  };

  const renderElement = () => {
    const baseStyles = {
      fontFamily: theme.fonts.body,
      color: theme.colors.text,
      ...element.styles
    };
    
    const themedStyles = applyGlobalStyles(element.type, baseStyles);

    switch (element.type) {
      case 'name':
        return (
          <div style={themedStyles} className="text-2xl font-bold text-center py-4">
            {`{{name}}`}
          </div>
        );

      case 'title':
        return (
          <div style={themedStyles} className="text-lg text-center py-2 opacity-80">
            {`{{job_title}}`}
          </div>
        );

      case 'company':
        return (
          <div style={themedStyles} className="flex items-center justify-center gap-2 py-2">
            <Building className="h-4 w-4" />
            <span>{`{{company}}`}</span>
          </div>
        );

      case 'bio':
        return (
          <div style={themedStyles} className="px-6 py-4 text-center">
            <p className="leading-relaxed">{`{{bio}}`}</p>
          </div>
        );

      case 'profile_image':
        return (
          <div className="flex justify-center py-6">
            <div
              style={{
                width: element.styles.size || 120,
                height: element.styles.size || 120,
                borderRadius: element.styles.borderRadius || '50%',
                background: theme.colors.secondary,
                border: `4px solid ${theme.colors.accent}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User className="h-12 w-12 text-white" />
            </div>
          </div>
        );

      case 'cover_image':
        return (
          <div
            style={{
              height: element.styles.height || 200,
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              ...baseStyles
            }}
          />
        );

      case 'contact_button':
        return (
          <div className="px-6 py-2">
            <button
              style={{
                background: theme.colors.primary,
                color: 'white',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                ...themedStyles
              }}
            >
              <Phone className="h-4 w-4" />
              <span>{element.content.label || 'Call'}</span>
            </button>
          </div>
        );

      case 'email_button':
        return (
          <div className="px-6 py-2">
            <button
              style={{
                background: theme.colors.accent,
                color: 'white',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                ...themedStyles
              }}
            >
              <Mail className="h-4 w-4" />
              <span>{element.content.label || 'Email'}</span>
            </button>
          </div>
        );

      case 'whatsapp_button':
        return (
          <div className="px-6 py-2">
            <button
              style={{
                background: '#25D366',
                color: 'white',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                ...themedStyles
              }}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{element.content.label || 'WhatsApp'}</span>
            </button>
          </div>
        );

      case 'social_links':
        const socialIcons = [
          { icon: Instagram, color: '#E4405F' },
          { icon: Linkedin, color: '#0077B5' },
          { icon: Twitter, color: '#1DA1F2' },
          { icon: Facebook, color: '#1877F2' }
        ];
        
        return (
          <div className="flex justify-center gap-4 py-4">
            {socialIcons.map((social, idx) => {
              const Icon = social.icon;
              return (
                <div
                  key={idx}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: element.styles.colorful ? social.color : theme.colors.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
              );
            })}
          </div>
        );

      case 'qr_code':
        return (
          <div className="flex justify-center py-6">
            <div
              style={{
                width: element.styles.size || 150,
                height: element.styles.size || 150,
                border: `2px solid ${theme.colors.secondary}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white'
              }}
            >
              <QrCode className="h-20 w-20 text-slate-400" />
            </div>
          </div>
        );

      case 'location':
        return (
          <div style={themedStyles} className="flex items-center justify-center gap-2 py-2">
            <MapPin className="h-4 w-4" />
            <span>{`{{location}}`}</span>
          </div>
        );

      case 'spacer':
        return (
          <div style={{ height: element.styles.height || 24 }} />
        );

      case 'divider':
        return (
          <div className="px-6 py-2">
            <hr style={{ borderColor: theme.colors.secondary, opacity: 0.2, ...baseStyles }} />
          </div>
        );

      default:
        return (
          <div className="p-4 bg-slate-100 dark:bg-slate-800 text-center rounded">
            <p className="text-sm text-slate-500">Unknown element: {element.type}</p>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        width: element.position.width,
        padding: element.styles.padding || '0',
        margin: element.styles.margin || '0 auto',
        zIndex: element.zIndex
      }}
    >
      {renderElement()}
    </div>
  );
}
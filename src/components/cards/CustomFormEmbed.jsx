import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CustomFormEmbed({ card, isRTL }) {
  const settings = card.custom_form_embed;
  const design = card.design || {};
  const accentColor = design.accent_color || '#00B4D8';
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && settings?.html_code) {
      // Clear any existing content
      containerRef.current.innerHTML = settings.html_code;
      
      // Execute any scripts in the HTML
      const scripts = containerRef.current.getElementsByTagName('script');
      Array.from(scripts).forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }
  }, [settings?.html_code]);
  
  if (!settings?.enabled || !settings?.html_code) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 pb-6"
    >
      <div 
        className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border-2"
        style={{ borderColor: `${accentColor}30` }}
      >
        {(settings.title || settings.title_ar) && (
          <h3 
            className="font-semibold mb-4"
            style={{ color: design.text_color || '#1F2937' }}
          >
            {isRTL && settings.title_ar ? settings.title_ar : settings.title}
          </h3>
        )}
        <div ref={containerRef} className="custom-form-embed" />
      </div>
    </motion.div>
  );
}
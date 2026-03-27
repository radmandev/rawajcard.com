import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AppointmentSection({ card, isRTL }) {
  const settings = card.appointment_settings;
  const design = card.design || {};
  const primaryColor = design.primary_color || '#0D7377';
  const accentColor = design.accent_color || '#00B4D8';
  const borderRadius = design.border_radius || '12px';
  const fontFamily = design.font_family || 'Inter';
  
  if (!settings?.enabled || !settings?.appointments || settings.appointments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 px-6 pb-6" style={{ fontFamily }}>
      {settings.appointments.map((appointment, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-5 border-2 hover:shadow-lg transition-all"
          style={{ borderColor: `${accentColor}30`, borderRadius }}
        >
          <div className="flex items-start gap-4">
            <div 
              className="p-3"
              style={{ backgroundColor: `${accentColor}20`, borderRadius: `calc(${borderRadius} * 0.75)` }}
            >
              <Calendar className="h-5 w-5" style={{ color: accentColor }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {isRTL && appointment.title_ar ? appointment.title_ar : appointment.title}
              </h3>
              {(appointment.description || appointment.description_ar) && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {isRTL && appointment.description_ar ? appointment.description_ar : appointment.description}
                </p>
              )}
              <Button
                asChild
                size="sm"
                className="w-full text-white shadow-md hover:shadow-lg transition-all"
                style={{ 
                  backgroundColor: primaryColor,
                  borderRadius: `calc(${borderRadius} * 0.75)`
                }}
              >
                <a href={appointment.url} target="_blank" rel="noopener noreferrer">
                  {isRTL && appointment.button_label_ar ? appointment.button_label_ar : (appointment.button_label || (isRTL ? 'حجز موعد' : 'Book Appointment'))}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
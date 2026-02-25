import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COLOR_PRESETS = [
  { name: 'Teal Professional', primary: '#0D7377', secondary: '#14274E', accent: '#00B4D8' },
  { name: 'Purple Passion', primary: '#7C3AED', secondary: '#4C1D95', accent: '#EC4899' },
  { name: 'Emerald Fresh', primary: '#059669', secondary: '#064E3B', accent: '#10B981' },
  { name: 'Ruby Red', primary: '#DC2626', secondary: '#7F1D1D', accent: '#F97316' },
  { name: 'Ocean Blue', primary: '#0EA5E9', secondary: '#0369A1', accent: '#38BDF8' },
  { name: 'Sunset Orange', primary: '#D97706', secondary: '#78350F', accent: '#F59E0B' },
  { name: 'Navy Gold', primary: '#14274E', secondary: '#0D1B3E', accent: '#F4B400' },
  { name: 'Forest Green', primary: '#065F46', secondary: '#064E3B', accent: '#34D399' },
  { name: 'Royal Purple', primary: '#6B21A8', secondary: '#581C87', accent: '#C084FC' },
  { name: 'Coral Sunset', primary: '#F43F5E', secondary: '#BE123C', accent: '#FB923C' },
  { name: 'Midnight Blue', primary: '#1E3A8A', secondary: '#1E293B', accent: '#60A5FA' },
  { name: 'Cherry Blossom', primary: '#DB2777', secondary: '#9F1239', accent: '#F9A8D4' },
  { name: 'Mint Chocolate', primary: '#047857', secondary: '#1F2937', accent: '#6EE7B7' },
  { name: 'Lavender Dream', primary: '#8B5CF6', secondary: '#5B21B6', accent: '#DDD6FE' },
  { name: 'Tangerine', primary: '#EA580C', secondary: '#9A3412', accent: '#FDBA74' },
  { name: 'Deep Sea', primary: '#0891B2', secondary: '#164E63', accent: '#67E8F9' },
  { name: 'Rose Gold', primary: '#BE185D', secondary: '#831843', accent: '#FBBF24' },
  { name: 'Slate Modern', primary: '#475569', secondary: '#1E293B', accent: '#94A3B8' },
];

export default function ColorPresetSlider({ onSelectPreset, isRTL }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const presetsPerPage = 6;
  const totalPages = Math.ceil(COLOR_PRESETS.length / presetsPerPage);

  const currentPresets = COLOR_PRESETS.slice(
    currentIndex * presetsPerPage,
    (currentIndex + 1) * presetsPerPage
  );

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handlePrev}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 grid grid-cols-3 gap-2 px-2">
          {currentPresets.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className="group relative flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={preset.name}
            >
              <div className="flex rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 group-hover:border-teal-400 transition-colors">
                <div className="h-8 w-8" style={{ backgroundColor: preset.primary }} />
                <div className="h-8 w-8" style={{ backgroundColor: preset.secondary }} />
                <div className="h-8 w-8" style={{ backgroundColor: preset.accent }} />
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400 truncate w-full text-center">
                {preset.name}
              </span>
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-center gap-1">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === currentIndex 
                ? 'w-6 bg-teal-600' 
                : 'w-1.5 bg-slate-300 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
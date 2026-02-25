import React from 'react';
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';
import { api } from '@/api/supabaseAPI';

export default function FeatureSection({ 
  title, 
  subtitle, 
  description, 
  features, 
  primaryCta, 
  secondaryCta, 
  imagePosition = "right",
  bgColor = "white",
  image
}) {
  const isLeft = imagePosition === "left";
  
  return (
    <section className={`py-20 ${bgColor === 'gray' ? 'bg-slate-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isLeft ? 'lg:flex-row-reverse' : ''}`}>
          {/* Content */}
          <div className={isLeft ? 'lg:order-2' : ''}>
            {subtitle && (
              <span className="text-sm text-teal-600 dark:text-teal-400 font-semibold tracking-wider uppercase mb-4 block">
                {subtitle}
              </span>
            )}
            
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
              {title}
            </h2>
            
            {description && (
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">{description}</p>
            )}
            
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{feature.title}</span>
                    {feature.description && (
                      <span className="text-slate-600 dark:text-slate-300"> – {feature.description}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="flex flex-wrap gap-4">
              {primaryCta && (
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-teal-600 to-blue-500 hover:from-teal-700 hover:to-blue-600 text-white rounded-full px-8"
                  onClick={() => api.auth.redirectToLogin()}
                >
                  {primaryCta}
                </Button>
              )}
              {secondaryCta && (
                <Button 
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 border-2"
                >
                  {secondaryCta}
                </Button>
              )}
            </div>
          </div>
          
          {/* Image */}
          <div className={isLeft ? 'lg:order-1' : ''}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20 dark:from-teal-500/10 dark:to-blue-500/10 rounded-3xl transform rotate-3 scale-105" />
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden">
                {image ? (
                  <img src={image} alt={title} className="w-full h-auto" />
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                    <div className="w-full max-w-sm p-6">
                      {/* Mockup UI */}
                      <div className="space-y-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                        <div className="h-32 bg-slate-100 dark:bg-slate-900 rounded-lg mt-6" />
                        <div className="flex gap-2">
                          <div className="h-10 bg-teal-500 dark:bg-teal-600 rounded-lg flex-1" />
                          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
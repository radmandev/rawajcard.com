import React from 'react';
import { Smartphone, Palette, Leaf } from 'lucide-react';

const badges = [
  {
    icon: Smartphone,
    text: "iPhone & Android Compatible"
  },
  {
    icon: Palette,
    text: "Fully Customizable"
  },
  {
    icon: Leaf,
    text: "Eco-Friendly"
  }
];

export default function TrustBadges() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-full border border-slate-100"
            >
              <badge.icon className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-medium text-slate-700">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
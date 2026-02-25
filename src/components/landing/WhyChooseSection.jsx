import React from 'react';
import { 
  Share2, 
  Smartphone, 
  Palette, 
  Globe, 
  Shield, 
  Headphones,
  TreePine,
  RefreshCw
} from 'lucide-react';

const benefits = [
  {
    icon: Share2,
    title: "Easy Sharing for Everyone",
    description: "Tap or scan. Share without apps, typing, or friction."
  },
  {
    icon: Smartphone,
    title: "Best-in-Class Mobile App",
    description: "Network on the go. Update your profile, track views, and follow up instantly."
  },
  {
    icon: Palette,
    title: "Fully Branded Profiles & Cards",
    description: "Bulk-edit templates and maintain company-wide branding."
  },
  {
    icon: Globe,
    title: "Global Brand",
    description: "Trusted across Europe, the U.S., LatAm, and more."
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "ISO27001 and GDPR-ready to protect your data."
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Always-on help, whether it's a live event or team onboarding."
  },
  {
    icon: TreePine,
    title: "Eco-Friendly Networking",
    description: "One Rawajcard = 1 tree planted."
  },
  {
    icon: RefreshCw,
    title: "No Reprints. Ever.",
    description: "Your card's always up to date. No waste, no reorders."
  }
];

export default function WhyChooseSection() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Benefits Grid */}
          <div>
            <span className="text-teal-600 dark:text-teal-400 text-sm font-semibold tracking-wider uppercase mb-4 block">
              Why Rawajcard
            </span>
            
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12">
              Why Sales Pros, Managers & Event Teams Choose Rawajcard
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="group">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30 flex items-center justify-center group-hover:from-teal-100 group-hover:to-blue-100 dark:group-hover:from-teal-900/50 dark:group-hover:to-blue-900/50 transition-colors">
                      <benefit.icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{benefit.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Image/Mockup */}
          <div className="relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20 dark:from-teal-500/10 dark:to-blue-500/10 rounded-3xl transform -rotate-3 scale-105" />
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 shadow-2xl">
                {/* Dashboard mockup */}
                <div className="aspect-[4/3] bg-white rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex gap-4 mb-6">
                      <div className="flex-1 bg-teal-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-teal-600">1,234</div>
                        <div className="text-xs text-slate-500">Total Leads</div>
                      </div>
                      <div className="flex-1 bg-blue-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">89%</div>
                        <div className="text-xs text-slate-500">Sync Rate</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500" />
                          <div className="flex-1">
                            <div className="h-3 bg-slate-200 rounded w-24" />
                            <div className="h-2 bg-slate-100 rounded w-16 mt-1" />
                          </div>
                          <div className="h-6 w-16 bg-teal-100 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
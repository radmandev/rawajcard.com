import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const footerLinks = {
  Product: ["Digital Cards", "NFC Cards", "QR Codes", "Mobile App", "Teams", "Pricing"],
  Resources: ["Blog", "Help Center", "API Docs", "Integrations", "Case Studies"],
  Company: ["About Us", "Careers", "Press", "Contact", "Partners"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"]
};

const socialLinks = [
  { icon: Facebook, href: "#" },
  { icon: Twitter, href: "#" },
  { icon: Instagram, href: "#" },
  { icon: Linkedin, href: "#" },
  { icon: Youtube, href: "#" }
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-black text-white pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_6962369d7645fd9abc56cb8f/9f16258e0_Rawajcard.png" 
                alt="Rawajcard" 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-slate-400 dark:text-slate-500 mb-6 max-w-xs">
              Your digital business card platform. Turn real-life meetings into real revenue.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-teal-600 transition-all hover:scale-110"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Links */}
          {Object.entries(footerLinks).map(([title, links], index) => (
            <div key={index}>
              <h4 className="font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href="#" 
                      className="text-slate-400 hover:text-teal-400 transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom */}
        <div className="border-t border-slate-800 dark:border-slate-950 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 dark:text-slate-600 text-sm">
            © {new Date().getFullYear()} Rawajcard. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-slate-500 dark:text-slate-600 text-sm flex items-center gap-2">
              🌳 50,000+ trees planted
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
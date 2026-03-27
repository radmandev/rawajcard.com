import React, { useEffect } from 'react';
import { api } from '@/api/supabaseAPI';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import TrustBadges from '@/components/landing/TrustBadges';
import CompanyLogos from '@/components/landing/CompanyLogos';
import StatsSection from '@/components/landing/StatsSection';
import StepsSection from '@/components/landing/StepsSection';
import FeatureSection from '@/components/landing/FeatureSection';
import NFCCardsSection from '@/components/landing/NFCCardsSection';
import EcoSection from '@/components/landing/EcoSection';
import WhyChooseSection from '@/components/landing/WhyChooseSection';
import GetStartedSteps from '@/components/landing/GetStartedSteps';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <TrustBadges />
      <CompanyLogos />
      <StatsSection />
      <StepsSection />
      
      {/* Feature: Share Contact Info */}
      <FeatureSection
        title="Share Your Contact Info, Socials & Website"
        subtitle="all in one tap"
        description="Whether it's a business card, QR code, or link-in-bio - Rawajcard helps you turn introductions into leads, followers, or customers."
        features={[
          { title: "Tap to Share", description: "Instantly share your digital card with one tap. No apps needed." },
          { title: "Scan QR Access", description: "Let anyone scan your code to save your details in seconds." },
          { title: "Smart Link-In-Bio", description: "Showcase everything: contact info, calendar, socials, site." }
        ]}
        primaryCta="Create Your Free Digital Card"
        secondaryCta="Book a Demo"
        imagePosition="right"
      />
      
      {/* Feature: Lead Capture */}
      <FeatureSection
        title="Smart Lead Capture & CRM Sync"
        subtitle="Turns contacts into clients"
        description="Instantly capture leads from profile visits or paper business cards. Organize them, sync to your CRM, and follow up automatically—without lifting a finger."
        features={[
          { title: "Instant Lead Capture", description: "Use forms on your profile to collect contacts on the spot. Autofill makes it fast, frictionless, and professional." },
          { title: "AI Card Scanner", description: "Scan any paper business card → it's instantly added to your digital Rolodex." },
          { title: "Auto Follow-Up", description: "Rawajcard sends your details via email to leads instantly" }
        ]}
        primaryCta="Create Your Free Lead Capture Page"
        secondaryCta="Book a Demo"
        imagePosition="left"
        bgColor="gray"
      />
      
      {/* Feature: CRM Sync */}
      <FeatureSection
        title="Auto-Sync Every Lead to Your CRM"
        subtitle="Turns contacts into clients"
        description="Rawajcard instantly syncs your captured leads with Salesforce, HubSpot, and more."
        features={[
          { title: "Works With Your CRM", description: "From Salesforce to HubSpot, Microsoft to Pipedrive, our direct integrations ensure seamless syncing with your preferred CRM." },
          { title: "Lead Ownership Visibility", description: "Centralize and monitor leads gathered by your team. Stay informed with data on lead ownership, locations, and essential notes." },
          { title: "Smart Team Dashboard", description: "Track your team's performance, location-based lead activity, and conversion rates—automatically." }
        ]}
        primaryCta="Start Syncing Leads to CRM"
        secondaryCta="Talk to Sales"
        imagePosition="right"
      />
      
      <EcoSection />
      <NFCCardsSection />
      <WhyChooseSection />
      <CTASection />
      <GetStartedSteps />
      <Footer />
    </div>
  );
}
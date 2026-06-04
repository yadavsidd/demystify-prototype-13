
import React from 'react';
import type { Page } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { GradientButton } from '@/components/ui/GradientButton';
import { StarsBackground } from "@/components/ui/stars-background";
import { DemystifierIcon, TranslatorIcon, DrafterIcon, GuideIcon, ScaleIcon, HistoryIcon, LockIcon, LightningIcon } from '../components/icons';
import { cn } from "@/lib/utils";
import { EvervaultCard } from '../components/ui/evervault-card';
import { CornerBorderContainer } from '../components/ui/corner-border-container';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

const FeatureCard = ({ icon, title, description, className, onClick }: { icon: React.ReactNode, title: string, description: string, className?: string, onClick?: () => void }) => {
  return (
    <CornerBorderContainer
        onClick={onClick}
        className={cn("flex flex-col items-start w-full mx-auto p-4 cursor-pointer hover:border-white/[0.4] transition-colors rounded-xl", className)}
        cornerClassName="text-white"
    >
      <div className="w-full aspect-square mb-6 relative">
        <EvervaultCard text={title} />
      </div>

      <div className="relative z-20 w-full mt-auto">
        <h2 className="text-white text-sm font-light leading-relaxed mb-4 min-h-[3rem]">
            {description}
        </h2>
        <div className="text-sm border font-light border-white/[0.2] rounded-full text-white px-3 py-1.5 flex items-center gap-2 w-fit hover:bg-white/10 transition-colors">
            {icon}
            <span className="font-medium">Explore Feature</span>
        </div>
      </div>
    </CornerBorderContainer>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { session } = useAuth();

  return (
    <div className="min-h-screen w-full flex flex-col relative bg-black overflow-x-hidden">
      <div className="absolute inset-0 z-0">
        <StarsBackground />
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar onNavigate={onNavigate} />
        
        <main className="flex-grow flex flex-col items-center justify-start pt-24 pb-20">
          <section className="text-center container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-16">
              <h1 className="text-6xl sm:text-8xl font-bold text-white font-heading tracking-wider uppercase">
                  DECODE YOUR DOCUMENTS
              </h1>
              <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
                  Analyze, translate, and draft complex documents with the power of AI. Gain clarity and confidence in seconds.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                   {session ? (
                      <GradientButton 
                          onClick={() => onNavigate('demystifier')}
                          variant="default"
                          className="w-full sm:w-auto"
                      >
                          ENTER APP
                      </GradientButton>
                   ) : (
                      <>
                          <GradientButton 
                              onClick={() => onNavigate('signup')}
                              variant="default"
                              className="w-full sm:w-auto"
                          >
                              SIGN UP
                          </GradientButton>
                          <GradientButton 
                              onClick={() => onNavigate('login')}
                              variant="variant"
                              className="w-full sm:w-auto"
                          >
                              SIGN IN
                          </GradientButton>
                      </>
                   )}
              </div>
          </section>

          <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<DemystifierIcon className="h-4 w-4" />}
                title="Demystify"
                description="Upload any legal document. We'll extract the key facts, highlight red flags, and explain the jargon in plain English."
                onClick={() => onNavigate('demystifier')}
              />
              <FeatureCard
                icon={<TranslatorIcon className="h-4 w-4" />}
                title="Translator"
                description="Instantly translate complex documents into over 20 languages while preserving the original formatting and context."
                onClick={() => onNavigate('translator')}
              />
              <FeatureCard
                icon={<DrafterIcon className="h-4 w-4" />}
                title="Drafter"
                description="Generate rock-solid agreements like freelance contracts and leases just by answering a few simple questions."
                onClick={() => onNavigate('drafter')}
              />
              <FeatureCard
                icon={<GuideIcon className="h-4 w-4" />}
                title="Guide"
                description="Confused by bureaucracy? Our AI assistant provides step-by-step guidance for passports, visas, and official procedures."
                onClick={() => onNavigate('guide')}
              />
              <FeatureCard
                icon={<ScaleIcon className="h-4 w-4" />}
                title="Compare"
                description="Upload two versions of a document to instantly spot differences, missing clauses, and new risks."
                onClick={() => onNavigate('compare')}
              />
              <FeatureCard
                icon={<HistoryIcon className="h-4 w-4" />}
                title="History"
                description="Instantly access your past document analyses, translations, and drafts. Your personal legal archive."
                onClick={() => onNavigate('history')}
              />
              <FeatureCard
                icon={<LockIcon className="h-4 w-4" />}
                title="Secure"
                description="Your documents are processed in memory and never stored. We prioritize your privacy and data security."
                onClick={() => onNavigate('privacy')}
              />
              <FeatureCard
                icon={<LightningIcon className="h-4 w-4" />}
                title="Fast"
                description="Don't wait days for a lawyer. Get comprehensive legal breakdowns and summaries in seconds."
                onClick={() => onNavigate('demystifier')}
              />
            </div>
          </section>

        </main>

        <Footer onNavigate={onNavigate} />
      </div>
    </div>
  );
};

export default LandingPage;

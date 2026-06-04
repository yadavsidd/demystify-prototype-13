
import React from 'react';
import type { Page } from '../types';
import { BrandIcon } from './icons';
import { IconBrandTwitter, IconBrandGithub, IconBrandLinkedin } from "@tabler/icons-react";

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const apiKey = process.env.API_KEY;
  const displayKey = apiKey && apiKey.length > 4 ? `...${apiKey.slice(-4)}` : 'Not Loaded';

  return (
    <footer className="w-full border-t border-gray-800 bg-black/50 backdrop-blur-xl pt-16 pb-8 mt-auto no-print relative z-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
             <div className="flex items-center space-x-2 group cursor-pointer w-fit" onClick={() => onNavigate('landing')}>
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 group-hover:border-[var(--accent-color)] transition-colors">
                    <BrandIcon className="w-5 h-5 text-white group-hover:text-[var(--accent-color)] transition-colors" />
                </div>
                <span className="text-lg font-bold font-heading text-white tracking-wide">
                    DEMYSTIFY
                </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Empowering individuals with AI-driven legal clarity. Decode documents, draft contracts, and translate complex jargon in seconds.
            </p>
            <div className="flex gap-4">
                <button className="text-gray-500 hover:text-[var(--accent-color)] transition-colors" aria-label="Twitter">
                    <IconBrandTwitter className="w-5 h-5" />
                </button>
                <button className="text-gray-500 hover:text-[var(--accent-color)] transition-colors" aria-label="GitHub">
                    <IconBrandGithub className="w-5 h-5" />
                </button>
                 <button className="text-gray-500 hover:text-[var(--accent-color)] transition-colors" aria-label="LinkedIn">
                    <IconBrandLinkedin className="w-5 h-5" />
                </button>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><button onClick={() => onNavigate('demystifier')} className="hover:text-[var(--accent-color)] transition-colors text-left">Document Demystifier</button></li>
              <li><button onClick={() => onNavigate('translator')} className="hover:text-[var(--accent-color)] transition-colors text-left">Translator</button></li>
              <li><button onClick={() => onNavigate('drafter')} className="hover:text-[var(--accent-color)] transition-colors text-left">Contract Drafter</button></li>
              <li><button onClick={() => onNavigate('guide')} className="hover:text-[var(--accent-color)] transition-colors text-left">Document Guide</button></li>
            </ul>
          </div>

           {/* Company Column */}
           <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><button className="hover:text-[var(--accent-color)] transition-colors text-left">About Us</button></li>
              <li><button className="hover:text-[var(--accent-color)] transition-colors text-left">Blog</button></li>
              <li><button className="hover:text-[var(--accent-color)] transition-colors text-left">Careers</button></li>
              <li><button className="hover:text-[var(--accent-color)] transition-colors text-left">Contact</button></li>
            </ul>
          </div>

           {/* Legal Column */}
           <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-[var(--accent-color)] transition-colors text-left">Privacy Policy</button></li>
              <li><button className="hover:text-[var(--accent-color)] transition-colors text-left">Terms of Service</button></li>
              <li><button className="hover:text-[var(--accent-color)] transition-colors text-left">Cookie Policy</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Demystify. All rights reserved.
             </p>
             <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                    All Systems Operational
                </div>
                {/* API Key Debugger for local development */}
                <div className="text-gray-700" title="For local debugging: Shows the last 4 chars of the loaded API Key.">
                    API Key: {displayKey}
                </div>
             </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState, useEffect } from 'react';
import type { Page } from '../types';
import { BrandIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import { cn } from "@/lib/utils";

interface NavbarProps {
  onNavigate: (page: Page) => void;
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, className }) => {
    const { user } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header 
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b",
                scrolled 
                    ? "bg-black/80 backdrop-blur-md border-gray-800 py-2 shadow-lg" 
                    : "bg-transparent border-transparent py-4",
                className
            )}
        >
            <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <button 
                        onClick={() => onNavigate('landing')} 
                        className="flex items-center space-x-3 group focus:outline-none"
                    >
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 group-hover:border-[var(--accent-color)] group-hover:bg-[var(--accent-color)]/10 transition-all duration-300">
                            <BrandIcon className="w-6 h-6 text-white group-hover:text-[var(--accent-color)] transition-colors" />
                        </div>
                        <span className="text-xl font-bold font-heading text-white tracking-wide group-hover:text-gray-200 transition-colors">
                            DEMYSTIFY
                        </span>
                    </button>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <ProfileDropdown onNavigate={onNavigate} />
                        ) : (
                            <>
                                <button 
                                    onClick={() => onNavigate('login')}
                                    className="text-sm font-semibold text-gray-300 hover:text-white transition-colors px-4 py-2"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => onNavigate('signup')}
                                    className="px-5 py-2.5 text-sm font-bold text-black bg-[var(--accent-color)] rounded-lg hover:bg-gray-400 transition-all duration-200 shadow-[0_0_15px_rgba(161,161,170,0.3)] hover:shadow-[0_0_25px_rgba(161,161,170,0.5)]"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
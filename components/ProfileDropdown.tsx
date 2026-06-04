import React, { useState, useRef, useEffect } from "react";
import { LogOut, Sparkles, History } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { cn } from "@/lib/utils";
import type { Page } from '../types';

interface MenuItem {
    label: string;
    value?: string;
    icon: React.ReactNode;
    onClick?: () => void;
    highlight?: boolean;
}

interface ProfileDropdownProps {
    className?: string;
    onNavigate: (page: Page) => void;
}

export default function ProfileDropdown({
    className,
    onNavigate
}: ProfileDropdownProps) {
    const { user, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        await signOut();
        setIsOpen(false);
        onNavigate('login');
    };

    const handleNavigate = (page: Page) => {
        onNavigate(page);
        setIsOpen(false);
    };

    if (!user) return null;

    const data = {
        name: user.user_metadata?.full_name || 'User',
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'U')}&background=random`,
        model: "Gemini Flash",
    };

    const menuItems: MenuItem[] = [
        {
            label: "History",
            icon: <History className="w-4 h-4" />,
            onClick: () => handleNavigate('history')
        },
        {
            label: "Model",
            value: data.model,
            icon: <Sparkles className="w-4 h-4" />,
            // Model is just informational for now
        },
    ];

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <div className="group relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 md:gap-6 p-2 md:p-3 rounded-2xl bg-black/40 border border-gray-800 hover:border-gray-700 hover:bg-gray-900 transition-all duration-200 focus:outline-none w-full md:min-w-[240px]"
                >
                    <div className="text-left flex-1 hidden md:block">
                        <div className="text-sm font-medium text-gray-200 tracking-tight leading-tight truncate max-w-[120px]">
                            {data.name}
                        </div>
                        <div className="text-xs text-gray-500 tracking-tight leading-tight truncate max-w-[120px]">
                            {data.email}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-color)] via-purple-500 to-blue-500 p-0.5">
                            <div className="w-full h-full rounded-full overflow-hidden bg-black">
                                <img
                                    src={data.avatar}
                                    alt={data.name}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Bending line indicator on the right */}
                    <div
                        className={cn(
                            "absolute -right-2 top-1/2 -translate-y-1/2 transition-all duration-200 hidden md:block",
                            isOpen
                                ? "opacity-100"
                                : "opacity-60 group-hover:opacity-100"
                        )}
                    >
                        <svg
                            width="12"
                            height="24"
                            viewBox="0 0 12 24"
                            fill="none"
                            className={cn(
                                "transition-all duration-200",
                                isOpen
                                    ? "text-[var(--accent-color)] scale-110"
                                    : "text-gray-600 group-hover:text-gray-400"
                            )}
                            aria-hidden="true"
                        >
                            <path
                                d="M2 4C6 8 6 16 2 20"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                fill="none"
                            />
                        </svg>
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-black/95 backdrop-blur-md border border-gray-800 rounded-2xl shadow-xl z-50 animate-fade-in-up">
                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={item.onClick}
                                    disabled={!item.onClick}
                                    className={cn(
                                        "w-full flex items-center p-3 rounded-xl transition-all duration-200 group border border-transparent",
                                        item.onClick 
                                            ? "hover:bg-gray-800/60 cursor-pointer hover:shadow-sm hover:border-gray-700/50" 
                                            : "cursor-default opacity-80"
                                    )}
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="text-gray-400 group-hover:text-[var(--accent-color)] transition-colors">
                                            {item.icon}
                                        </span>
                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                            {item.label}
                                        </span>
                                    </div>
                                    <div className="flex-shrink-0 ml-auto">
                                        {item.value && (
                                            <span
                                                className={cn(
                                                    "text-xs font-medium rounded-md py-1 px-2 tracking-tight",
                                                    item.label === "Model"
                                                        ? "text-blue-400 bg-blue-900/20 border border-blue-500/20"
                                                        : "text-purple-400 bg-purple-900/20 border border-purple-500/20"
                                                )}
                                            >
                                                {item.value}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="my-3 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

                        <button
                            onClick={handleSignOut}
                            type="button"
                            className="w-full flex items-center gap-3 p-3 duration-200 bg-red-500/10 rounded-xl hover:bg-red-500/20 cursor-pointer border border-transparent hover:border-red-500/30 hover:shadow-sm transition-all group"
                        >
                            <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-400" />
                            <span className="text-sm font-medium text-red-500 group-hover:text-red-400">
                                Sign Out
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

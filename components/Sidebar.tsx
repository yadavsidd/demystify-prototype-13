
import React, { useState } from 'react';
import { 
  IconFileAnalytics, 
  IconLanguage, 
  IconWriting, 
  IconCompass, 
  IconHistory, 
  IconLogout,
  IconScale
} from "@tabler/icons-react";
import { Sidebar as SidebarContainer, SidebarBody, SidebarLink } from './ui/sidebar';
import type { Page, User as UserType } from '../types';
import { cn } from "@/lib/utils";
import { BrandIcon } from './icons';

interface SidebarProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
  user: UserType | null;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentPage, user, onSignOut }) => {
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: 'Demystifier',
      href: '#',
      icon: <IconFileAnalytics className={cn("w-6 h-6 shrink-0", currentPage === 'demystifier' ? "text-[var(--accent-color)]" : "text-gray-400")} />,
      onClick: () => onNavigate('demystifier')
    },
    {
      label: 'Translator',
      href: '#',
      icon: <IconLanguage className={cn("w-6 h-6 shrink-0", currentPage === 'translator' ? "text-[var(--accent-color)]" : "text-gray-400")} />,
      onClick: () => onNavigate('translator')
    },
    {
      label: 'Drafter',
      href: '#',
      icon: <IconWriting className={cn("w-6 h-6 shrink-0", currentPage === 'drafter' ? "text-[var(--accent-color)]" : "text-gray-400")} />,
      onClick: () => onNavigate('drafter')
    },
    {
      label: 'Guide',
      href: '#',
      icon: <IconCompass className={cn("w-6 h-6 shrink-0", currentPage === 'guide' ? "text-[var(--accent-color)]" : "text-gray-400")} />,
      onClick: () => onNavigate('guide')
    },
    {
      label: 'Compare',
      href: '#',
      icon: <IconScale className={cn("w-6 h-6 shrink-0", currentPage === 'compare' ? "text-[var(--accent-color)]" : "text-gray-400")} />,
      onClick: () => onNavigate('compare')
    },
    {
        label: 'History',
        href: '#',
        icon: <IconHistory className={cn("w-6 h-6 shrink-0", currentPage === 'history' ? "text-[var(--accent-color)]" : "text-gray-400")} />,
        onClick: () => onNavigate('history')
    }
  ];

  return (
    <div className={cn("rounded-md flex flex-col md:flex-row bg-black w-full flex-1 max-w-7xl mx-auto h-full overflow-hidden")}>
        <SidebarContainer open={open} setOpen={setOpen} animate={true}>
            <SidebarBody className="justify-between gap-10">
                <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    <div 
                        className="flex items-center gap-2 mb-10 cursor-pointer group py-2" 
                        onClick={() => onNavigate('landing')}
                    >
                         <BrandIcon className="w-6 h-6 shrink-0 text-white group-hover:text-[var(--accent-color)] transition-colors" />
                         {open && (
                            <span className="font-bold text-xl text-white font-heading whitespace-pre">
                                DEMYSTIFY
                            </span>
                         )}
                    </div>
                    <div className="flex flex-col gap-2">
                        {links.map((link, idx) => (
                            <SidebarLink key={idx} link={link} />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    {user && (
                         <SidebarLink
                            link={{
                                label: user.user_metadata?.full_name || user.email || "User",
                                href: "#",
                                icon: (
                                   <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-[var(--accent-color)] to-blue-500 p-0.5 overflow-hidden">
                                        <img 
                                            src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'U')}&background=random`}
                                            alt="Avatar"
                                            className="h-full w-full rounded-full object-cover bg-black"
                                        />
                                   </div>
                                ),
                                onClick: () => {}
                            }}
                         />
                    )}
                    <SidebarLink
                        link={{
                            label: "Logout",
                            href: "#",
                            icon: <IconLogout className="w-6 h-6 shrink-0 text-red-400" />,
                            onClick: onSignOut
                        }}
                    />
                </div>
            </SidebarBody>
        </SidebarContainer>
    </div>
  );
};

export default Sidebar;

import React from 'react';

interface SidebarLinkProps {
  link: {
    label: string;
    href: string;
    icon: React.ReactNode;
  };
  isOpen: boolean;
  isActive: boolean;
  onClick: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ link, isOpen, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 ${
        isActive
          ? 'bg-green-900/50 text-[var(--accent-color)]'
          : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
      } ${!isOpen && 'justify-center'}`}
    >
      <div className="flex-shrink-0">{link.icon}</div>
      {isOpen && <span className="ml-4 font-medium whitespace-nowrap">{link.label}</span>}
    </button>
  );
};

export default SidebarLink;
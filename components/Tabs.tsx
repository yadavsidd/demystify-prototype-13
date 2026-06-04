import React from 'react';

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="w-full flex justify-center mb-8">
      <div className="flex items-center space-x-2 bg-gray-900 p-1.5 rounded-full">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
              activeTab === tab
                ? 'bg-[var(--accent-color)] text-black'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;

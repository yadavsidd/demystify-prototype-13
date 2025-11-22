import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, message, description }) => {
  return (
    <div className="text-center py-12 px-6 rounded-lg border-2 border-dashed border-gray-800">
      <div className="w-12 h-12 mx-auto text-gray-500">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-300 mt-4">{message}</h3>
      <p className="text-gray-500 mt-1 max-w-md mx-auto">{description}</p>
    </div>
  );
};

export default EmptyState;

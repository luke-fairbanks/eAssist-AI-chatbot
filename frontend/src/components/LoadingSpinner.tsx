import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      <span className="text-gray-600 text-sm">Processing your request...</span>
    </div>
  );
};

export default LoadingSpinner;
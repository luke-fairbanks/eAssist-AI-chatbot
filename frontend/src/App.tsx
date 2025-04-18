import React from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            eAssist AI
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Describe your IT issue and I'll help you find a solution
          </p>
        </div>
        <ChatInterface />
      </div>
    </div>
  );
}

export default App;

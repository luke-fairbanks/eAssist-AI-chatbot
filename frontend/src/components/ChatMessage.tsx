import React from 'react';
import { ChatMessage as ChatMessageType, FlowOption } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  onOptionSelect: (option: FlowOption) => void;
  onOtherSelect: (option: FlowOption) => void;
  onViewInitialOptions?: () => void;
  isFirstMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onOptionSelect,
  onOtherSelect,
  onViewInitialOptions,
  isFirstMessage = false
}) => {
  const { content, sender, options, showFlowPath, isProcessing } = message;

  // Function to display the option message and its flow path if available
  const renderOptionWithPath = (option: FlowOption) => {
    // Only show the path if showFlowPath is true and flowPath exists
    const shouldShowPath = showFlowPath && option.flowPath;

    // Display message with path underneath if available
    return (
      <>
        {shouldShowPath && (
          <div className="text-xs text-gray-500 mt-1">
            {option.flowPath}
          </div>
        )}
        <div>{option.originalMessage || option.message}</div>
      </>
    );
  };

  // Function to detect and convert URLs in text to clickable links
  const renderTextWithLinks = (text: string) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Split the text by URLs
    const parts = text.split(urlRegex);

    // Find all URLs in the text and ensure it's string[]
    const urls: string[] = text.match(urlRegex) || [];

    // Combine parts and URLs into React elements
    return parts.map((part, index) => {
      // If this part matches a URL, render it as a link
      if (urls.indexOf(part) !== -1) {
        return (
          <>
            <br />
            <div
            key={index}
            className='w-full p-2 bg-gray-100 hover:bg-gray-200 text-left rounded-md border border-gray-300 transition-colors cursor-pointer my-2'
            >
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                {/* {part} */}
                Click here
              </a>
            </div>
          </>
        );
      }
      // Otherwise, render it as plain text
      return part;
    });
  };

  // If this is a processing message, show the typing indicator
  if (isProcessing) {
    return (
      <div className="mb-4 text-left">
        <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${sender === 'user' ? 'text-right' : 'text-left'}`}>
      {content && (
        <div
          className={`inline-block p-3 rounded-lg max-w-[85%] break-words ${
            sender === 'user'
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }`}
        >
          <div className="m-0">{renderTextWithLinks(content)}</div>
        </div>
      )}

      {/* Show "View Suggestion Options" button if this is the first message */}
      {isFirstMessage && sender === 'bot' && onViewInitialOptions && (
        <div className="mt-2">
          <button
            onClick={onViewInitialOptions}
            className="p-2 w-full bg-blue-100 hover:bg-blue-200 text-center rounded-md border border-blue-300 transition-colors font-medium"
          >
            View Suggestion Options
          </button>
        </div>
      )}

      {options && options.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {options.filter(option => !option?.isIntroMessage).map((option) => (
            <button
              key={option._id}
              onClick={() => onOptionSelect(option)}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-left rounded-md border border-gray-300 transition-colors"
            >
              {renderOptionWithPath(option)}
            </button>
          ))}
          {/* Show flow path means we're on the first step */}
          {showFlowPath && <button
            onClick={() => onOtherSelect(options[0])}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-left rounded-md border border-gray-300 transition-colors"
          >
            Other
          </button>
  }
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
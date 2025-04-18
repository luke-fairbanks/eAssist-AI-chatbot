import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { findMatches, continueFlow, getInitialFlowOptions } from '../services/api';
import { ChatMessage as ChatMessageType, FlowOption } from '../types';
import ChatMessage from './ChatMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: uuidv4(),
      content: "Hello! I'm your IT support assistant. Please describe your issue.",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{optionId: string, step: number}[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [textInputDisabled, setTextInputDisabled] = useState(false);
  const [showFlowPath, setShowFlowPath] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: uuidv4(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add a loading message for better UX
    const loadingMessage: ChatMessageType = {
      id: uuidv4(),
      content: '',
      sender: 'bot',
      isProcessing: true, // Flag to indicate this is a temporary loading message
      timestamp: new Date()
    };

    setMessages(prev => [...prev, loadingMessage]);

    // Check for special commands
    if (inputValue.toLowerCase().trim() === '/restart') {
      handleRestart();
      setIsLoading(false);
      // Remove the loading message
      setMessages(prev => prev.filter(msg => !msg.isProcessing));
      return;
    }

    try {
      // Find matching options based on user input
      const options = await findMatches(inputValue);

      if (!options || options.length === 0) {
        // Replace loading message with no matches found
        setMessages(prev => {
          const filteredMessages = prev.filter(msg => !msg.isProcessing);
          return [...filteredMessages, {
            id: uuidv4(),
            content: 'Sorry, I could not find any matching options for your request. Please rephrase your issue.',
            sender: 'bot',
            timestamp: new Date()
          }];
        });
        return;
      }

      // Replace the loading message with actual response
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isProcessing);
        return [...filteredMessages, {
          id: uuidv4(),
          content: 'Based on your description, here are some possible issues:',
          sender: 'bot',
          options,
          timestamp: new Date(),
          showFlowPath: showFlowPath
        }];
      });

      setConversationHistory([]);
      setCurrentStep(1);
      // Disable text input after first user message
      setTextInputDisabled(true);
    } catch (error) {
      console.error('Error processing message:', error);

      // Replace the loading message with error
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isProcessing);
        return [...filteredMessages, {
          id: uuidv4(),
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          sender: 'bot',
          timestamp: new Date()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = async (selectedOption: FlowOption) => {
    // Add the selected option as a user message
    const userSelection: ChatMessageType = {
      id: uuidv4(),
      content: selectedOption.message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userSelection]);
    setIsLoading(true);

    // Add a loading message
    const loadingMessage: ChatMessageType = {
      id: uuidv4(),
      content: '',
      sender: 'bot',
      isProcessing: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, loadingMessage]);

    // Update conversation history
    setConversationHistory(prev => [...prev, {optionId: selectedOption._id, step: currentStep}]);
    setCurrentStep(prev => prev + 1);

    // Set flowPath to false for subsequent messages
    setShowFlowPath(false);

    // Disable text input after option selection
    setTextInputDisabled(true);

    try {
      // Get child options for the selected option
      let childOptions = await continueFlow(selectedOption._id);

      console.log('Child options:');
      console.log(selectedOption, childOptions);

      // Check if we received an instruction
      const hasInstruction = childOptions.length === 1 && childOptions[0].isMenu === false;

      // If we received an instruction, we need to show it and then get its children
      if (hasInstruction) {
        const instructionOption = childOptions[0];

        // Replace loading message with the instruction
        setMessages(prev => {
          const filteredMessages = prev.filter(msg => !msg.isProcessing);
          return [...filteredMessages, {
            id: uuidv4(),
            content: instructionOption.message,
            sender: 'bot',
            timestamp: new Date()
          }];
        });

        // Now fetch the options that should follow this instruction
        childOptions = await continueFlow(instructionOption._id);

        // Add these options as a new message
        if (childOptions && childOptions.length > 0) {
          setMessages(prev => [
            ...prev,
            {
              id: uuidv4(),
              content: '',
              sender: 'bot',
              options: childOptions,
              timestamp: new Date()
            }
          ]);
        }
      } else {
        // Handle normal menu options with children - this is the existing logic
        setMessages(prev => {
          const filteredMessages = prev.filter(msg => !msg.isProcessing);

          if (childOptions && childOptions.length > 0) {
            return [...filteredMessages, {
              id: uuidv4(),
              content: '',
              sender: 'bot',
              options: childOptions,
              timestamp: new Date()
            }];
          } else if (selectedOption.closesTicket) {
            return [...filteredMessages, {
              id: uuidv4(),
              content: '✅ Ticket closed. Thank you for using our service.',
              sender: 'bot',
              timestamp: new Date()
            }];
          } else {
            return [...filteredMessages, {
              id: uuidv4(),
              content: '📞 Your ticket has been submitted. An IT specialist will contact you shortly. ',
              sender: 'bot',
              timestamp: new Date()
            }];
          }
        });
      }
    } catch (error) {
      console.error('Error handling option selection:', error);

      // Replace loading message with error
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isProcessing);
        return [...filteredMessages, {
          id: uuidv4(),
          content: 'Sorry, I encountered an error processing your selection. Please try again.',
          sender: 'bot',
          timestamp: new Date()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    // Reset the conversation
    setMessages([
      {
        id: uuidv4(),
        content: "Hello! I'm your IT support assistant. Please describe your issue.",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
    setConversationHistory([]);
    setCurrentStep(0);
    setTextInputDisabled(false);
    setShowFlowPath(true);
  };

  const handleBack = async () => {
    if (conversationHistory.length === 0) {
      return;
    }

    // Remove the last two messages (user selection and bot response)
    setMessages(prev => prev.slice(0, -2));

    // Go back to previous step
    const newHistory = [...conversationHistory];
    newHistory.pop();
    setConversationHistory(newHistory);

    setCurrentStep(prev => Math.max(0, prev - 1));

    if (newHistory.length > 0) {
      // Get the previous options
      const lastItem = newHistory[newHistory.length - 1];
      setIsLoading(true);

      try {
        const options = await continueFlow(lastItem.optionId);

        const botResponse: ChatMessageType = {
          id: uuidv4(),
          content: '', // Remove "Please select an option" text
          sender: 'bot',
          options,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botResponse]);
      } catch (error) {
        console.error('Error going back:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtherSelect = async (selectedOption: FlowOption) => {
    setMessages(prev => [
      ...prev,
      {
        id: uuidv4(),
        content: "Please describe your issue in detail.",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);

    setTextInputDisabled(false);
    setShowFlowPath(true);
  };

  const handleViewInitialOptions = async () => {
    setIsLoading(true);

    // Add a loading message for better UX
    const loadingMessage: ChatMessageType = {
      id: uuidv4(),
      content: '',
      sender: 'bot',
      isProcessing: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Fetch the initial flow options
      const initialOptions = await getInitialFlowOptions();

      if (!initialOptions || initialOptions.length === 0) {
        // Replace loading message with error
        setMessages(prev => {
          const filteredMessages = prev.filter(msg => !msg.isProcessing);
          return [...filteredMessages, {
            id: uuidv4(),
            content: 'Sorry, I could not find any options. Please describe your issue instead.',
            sender: 'bot',
            timestamp: new Date()
          }];
        });
        return;
      }

      // Replace the loading message with the initial options
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isProcessing);
        return [...filteredMessages, {
          id: uuidv4(),
          content: 'Here are some common issues I can help you with:',
          sender: 'bot',
          options: initialOptions,
          timestamp: new Date(),
          showFlowPath: showFlowPath
        }];
      });

      // Disable text input after showing options
      setTextInputDisabled(true);
    } catch (error) {
      console.error('Error fetching initial options:', error);

      // Replace the loading message with error
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isProcessing);
        return [...filteredMessages, {
          id: uuidv4(),
          content: 'Sorry, I encountered an error fetching the options. Please try describing your issue instead.',
          sender: 'bot',
          timestamp: new Date()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-lg mx-auto border rounded-lg shadow-lg">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <h2 className="text-xl font-semibold">IT Support Assistant</h2>
        <div className="flex space-x-2">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              disabled={isLoading || conversationHistory.length === 0}
              className={`px-2 py-1 bg-blue-700 rounded text-sm hover:bg-blue-800 transition-colors
                ${(isLoading || conversationHistory.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              Back
            </button>
          )}
          <button
            onClick={handleRestart}
            disabled={isLoading}
            className={`px-2 py-1 bg-blue-700 rounded text-sm hover:bg-blue-800 transition-colors
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            Restart
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            onOptionSelect={handleOptionSelect}
            onOtherSelect={handleOtherSelect}
            onViewInitialOptions={index === 0 ? handleViewInitialOptions : undefined}
            isFirstMessage={index === 0}
          />
        ))}
        {
          isLoading && (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          )
        }
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={textInputDisabled ? "Please select an option above" : "Type your issue here..."}
            className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || textInputDisabled}
          />
          <button
            type="submit"
            className={`bg-blue-600 text-white px-4 py-2 rounded-r-md
              ${(isLoading || textInputDisabled) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}
            `}
            disabled={isLoading || textInputDisabled}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
import axios from 'axios';
import { ApiResponse, FlowOption } from '../types';

const API_URL = 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add axios interceptors for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    }
    return Promise.reject(error);
  }
);

export const findMatches = async (message: string): Promise<FlowOption[]> => {
  try {
    const response = await apiClient.post<ApiResponse>('/find-matches', { message });

    // Add defensive check to ensure we have options
    if (!response.data || !response.data.options || !Array.isArray(response.data.options)) {
      console.error('Received invalid response format from find-matches:', response.data);
      return []; // Return empty array instead of undefined
    }

    // Log the actual response for debugging
    console.log('Find matches response:', response.data);

    return response.data.options;
  } catch (error) {
    console.error('Error finding matches:', error);
    throw error;
  }
};

export const continueFlow = async (optionId: string): Promise<FlowOption[]> => {
  try {
    const response = await apiClient.get<ApiResponse>(`/continue-flow?optionId=${optionId}`);

    console.log("continue flow response", response.data)

    // Add defensive check
    if (!response.data || !response.data.options || !Array.isArray(response.data.options)) {
      console.error('Received invalid response format from continue-flow:', response.data);
      return []; // Return empty array instead of undefined
    }

    return response.data.options;
  } catch (error) {
    console.error('Error continuing flow:', error);
    throw error;
  }
};

export const getInitialFlowOptions = async (): Promise<FlowOption[]> => {
  try {
    // First, get the root option
    const rootResponse = await apiClient.get<ApiResponse>('/flow-options?parentId=root');

    if (!rootResponse.data || !rootResponse.data.options || !rootResponse.data.options.length) {
      console.error('Could not find root message');
      return [];
    }

    const rootOption = rootResponse.data.options[0];

    // Then get all options that have the root option's ID as their parentId
    const response = await apiClient.get<ApiResponse>(`/flow-options?parentId=${rootOption._id}`);

    // Add defensive check
    if (!response.data || !response.data.options || !Array.isArray(response.data.options)) {
      console.error('Received invalid response format from flow-options:', response.data);
      return [];
    }

    console.log('Initial flow options:', response.data.options);

    return response.data.options;
  } catch (error) {
    console.error('Error fetching initial flow options:', error);
    throw error;
  }
};
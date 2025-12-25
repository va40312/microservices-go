import { User } from '../types';

// Mock Auth Service
// Later, replace these with fetch() calls to your Go Auth Microservice

export const loginUser = async (email: string, password: string): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  if (email && password) {
    return {
      id: 'user_123',
      email: email,
      name: email.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };
  }
  throw new Error('Invalid credentials');
};

export const registerUser = async (email: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: 'user_new_456',
    email: email,
    name: email.split('@')[0],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
  };
};

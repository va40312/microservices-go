import { User } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';
const USE_MOCKS = false;

export const loginUser = async (username: string, password: string): Promise<User> => {
  const authHeader = btoa(`${username}:${password}`);
  
  if (USE_MOCKS) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { 
      id: 'mock-id-' + Math.random(), 
      email: `${username}@internal`, 
      name: username,
      authHeader 
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/videos/dashboard`, {
      method: 'GET',
      headers: { 
        'Authorization': `Basic ${authHeader}`
      }
    });

    if (response.status === 401) throw new Error('Invalid credentials');

    return {
      id: username,
      email: `${username}@internal`,
      name: username,
      authHeader
    };
  } catch (e) {
    if (e instanceof Error && e.message === 'Invalid credentials') throw e;

    return {
      id: username,
      email: `${username}@internal`,
      name: username,
      authHeader
    };
  }
};

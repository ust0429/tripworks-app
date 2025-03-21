// import axios from 'axios';
import axios from '../mocks/axiosMock';
import { User } from '../types/user';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.echo-app.jp/v1';

export const getUserProfile = async (): Promise<User> => {
  const response = await axios.get(`${API_URL}/users/profile`);
  return response.data;
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await axios.put(`${API_URL}/users/profile`, userData);
  return response.data;
};
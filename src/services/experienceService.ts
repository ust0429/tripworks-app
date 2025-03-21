// import axios from 'axios';
import axios from '../mocks/axiosMock';
import { Experience } from '../types/experience';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.echo-app.jp/v1';

export const getExperiences = async (params?: any): Promise<Experience[]> => {
  const response = await axios.get(`${API_URL}/experiences`, { params });
  return response.data;
};

export const getExperienceById = async (id: string): Promise<Experience> => {
  const response = await axios.get(`${API_URL}/experiences/${id}`);
  return response.data;
};

export const getExperienceAvailability = async (id: string, startDate: string, endDate: string): Promise<string[]> => {
  const response = await axios.get(`${API_URL}/experiences/${id}/availability`, {
    params: { startDate, endDate }
  });
  return response.data;
};

export const bookExperience = async (experienceId: string, bookingData: {
  date: string;
  numberOfPeople: number;
  specialRequests?: string;
}): Promise<{ bookingId: string }> => {
  const response = await axios.post(`${API_URL}/experiences/${experienceId}/book`, bookingData);
  return response.data;
};
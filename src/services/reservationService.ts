// import axios from 'axios';
import axios from '../mocks/axiosMock';
import { Reservation } from '../types/reservation';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.echo-app.jp/v1';

export const getReservations = async (): Promise<Reservation[]> => {
  const response = await axios.get(`${API_URL}/reservations`);
  return response.data;
};

export const getReservationById = async (id: string): Promise<Reservation> => {
  const response = await axios.get(`${API_URL}/reservations/${id}`);
  return response.data;
};

export const cancelReservation = async (id: string, reason?: string): Promise<void> => {
  await axios.post(`${API_URL}/reservations/${id}/cancel`, { reason });
};
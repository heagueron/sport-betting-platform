import { Sport, Event, PaginatedResponse } from '../types';
import { get, post, put, del } from './api';

export const getSports = async (params?: { active?: boolean }) => {
  return get<Sport[]>('/sports', params);
};

export const getSportById = async (id: string) => {
  return get<Sport>(`/sports/${id}`);
};

export const getSportEvents = async (
  id: string,
  params?: { status?: string; page?: number; limit?: number }
) => {
  return get<PaginatedResponse<Event>>(`/sports/${id}/events`, params);
};

export const createSport = async (data: { name: string; active?: boolean }) => {
  return post<Sport>('/sports', data);
};

export const updateSport = async (id: string, data: { name?: string; active?: boolean }) => {
  return put<Sport>(`/sports/${id}`, data);
};

export const deleteSport = async (id: string) => {
  return del(`/sports/${id}`);
};

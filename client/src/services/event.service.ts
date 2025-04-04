import { Event, PaginatedResponse } from '../types';
import { get, post, put } from './api';

export interface CreateEventData {
  name: string;
  sportId: string;
  startTime: string;
  participants: { name: string; odds: number }[];
}

export interface UpdateEventData {
  name?: string;
  startTime?: string;
  status?: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  result?: string;
}

export const getEvents = async (params?: {
  sportId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return get<PaginatedResponse<Event>>('/events', params);
};

export const getEventById = async (id: string) => {
  return get<Event>(`/events/${id}`);
};

export const createEvent = async (data: CreateEventData) => {
  return post<Event>('/events', data);
};

export const updateEvent = async (id: string, data: UpdateEventData) => {
  return put<Event>(`/events/${id}`, data);
};

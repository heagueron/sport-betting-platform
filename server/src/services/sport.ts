import { Sport, Event, EventStatus } from '@prisma/client';
import prisma from '../config/prisma';
import { SportData } from '../types';

/**
 * Create a new sport
 * @param sportData Sport data
 * @returns Newly created sport
 */
export const createNewSport = async (sportData: SportData): Promise<Sport> => {
  // Generate slug from name
  const slug = sportData.name.toLowerCase().replace(/\s+/g, '-');

  // Create sport
  const sport = await prisma.sport.create({
    data: {
      name: sportData.name,
      slug,
      active: sportData.active !== undefined ? sportData.active : true
    }
  });

  return sport;
};

/**
 * Get all sports
 * @param active Filter by active status
 * @returns List of sports
 */
export const getAllSports = async (active?: boolean): Promise<Sport[]> => {
  // If active is provided, filter by active status
  if (active !== undefined) {
    return prisma.sport.findMany({
      where: { active },
      orderBy: { name: 'asc' }
    });
  }

  // Otherwise, return all sports
  return prisma.sport.findMany({
    orderBy: { name: 'asc' }
  });
};

/**
 * Get sport by ID
 * @param sportId Sport ID
 * @returns Sport if found
 */
export const getSportById = async (sportId: string): Promise<Sport | null> => {
  return prisma.sport.findUnique({
    where: { id: sportId }
  });
};

/**
 * Get sport by slug
 * @param slug Sport slug
 * @returns Sport if found
 */
export const getSportBySlug = async (slug: string): Promise<Sport | null> => {
  return prisma.sport.findUnique({
    where: { slug }
  });
};

/**
 * Get events by sport ID
 * @param sportId Sport ID
 * @param status Filter by status
 * @returns List of events
 */
export const getEventsBySportId = async (
  sportId: string,
  status?: EventStatus
): Promise<Event[]> => {
  // If status is provided, filter by status
  if (status) {
    return prisma.event.findMany({
      where: {
        sportId,
        status
      },
      orderBy: { startTime: 'asc' }
    });
  }

  // Otherwise, return all events for the sport
  return prisma.event.findMany({
    where: { sportId },
    orderBy: { startTime: 'asc' }
  });
};

/**
 * Update sport
 * @param sportId Sport ID
 * @param updateData Update data
 * @returns Updated sport
 */
export const updateSportById = async (
  sportId: string,
  updateData: Partial<SportData>
): Promise<Sport | null> => {
  // Check if sport exists
  const sport = await prisma.sport.findUnique({
    where: { id: sportId }
  });

  if (!sport) {
    return null;
  }

  // Prepare update data
  const data: any = {};

  if (updateData.name) {
    data.name = updateData.name;
    // Update slug if name is changed
    data.slug = updateData.name.toLowerCase().replace(/\s+/g, '-');
  }

  if (updateData.active !== undefined) {
    data.active = updateData.active;
  }

  // Update sport
  return prisma.sport.update({
    where: { id: sportId },
    data
  });
};

/**
 * Delete sport
 * @param sportId Sport ID
 * @returns Boolean indicating success
 */
export const deleteSportById = async (sportId: string): Promise<boolean> => {
  try {
    // Check if sport exists
    const sport = await prisma.sport.findUnique({
      where: { id: sportId },
      include: {
        events: true
      }
    });

    if (!sport) {
      return false;
    }

    // Check if sport has events
    if (sport.events.length > 0) {
      // Don't delete sport with events
      return false;
    }

    // Delete sport
    await prisma.sport.delete({
      where: { id: sportId }
    });

    return true;
  } catch (error) {
    console.error('Error deleting sport:', error);
    return false;
  }
};

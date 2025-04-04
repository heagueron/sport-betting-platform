import { Event, Participant, EventStatus } from '@prisma/client';
import prisma from '../config/prisma';
import { EventData, ParticipantData } from '../types';

/**
 * Create a new event
 * @param eventData Event data
 * @returns Newly created event with participants
 */
export const createEvent = async (eventData: EventData): Promise<Event & { participants: Participant[] }> => {
  // Create event with participants in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create event
    const event = await tx.event.create({
      data: {
        name: eventData.name,
        sportId: eventData.sportId,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        status: eventData.status || 'SCHEDULED',
      }
    });

    // Create participants
    const participants = await Promise.all(
      eventData.participants.map(participant => 
        tx.participant.create({
          data: {
            name: participant.name,
            odds: participant.odds,
            eventId: event.id
          }
        })
      )
    );

    return { ...event, participants };
  });

  return result;
};

/**
 * Get all events
 * @param status Filter by status
 * @param sportId Filter by sport ID
 * @param page Page number
 * @param limit Items per page
 * @returns List of events with pagination info
 */
export const getAllEvents = async (
  status?: EventStatus,
  sportId?: string,
  page: number = 1,
  limit: number = 10
): Promise<{ events: Event[]; total: number; page: number; pages: number }> => {
  // Build where clause
  const where: any = {};
  
  if (status) {
    where.status = status;
  }
  
  if (sportId) {
    where.sportId = sportId;
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Get total count
  const total = await prisma.event.count({ where });
  
  // Get events
  const events = await prisma.event.findMany({
    where,
    include: {
      participants: true,
      sport: true
    },
    orderBy: { startTime: 'asc' },
    skip,
    take: limit
  });
  
  // Calculate total pages
  const pages = Math.ceil(total / limit);
  
  return {
    events,
    total,
    page,
    pages
  };
};

/**
 * Get event by ID
 * @param eventId Event ID
 * @returns Event if found
 */
export const getEventById = async (eventId: string): Promise<(Event & { participants: Participant[] }) | null> => {
  return prisma.event.findUnique({
    where: { id: eventId },
    include: {
      participants: true,
      sport: true
    }
  });
};

/**
 * Update event
 * @param eventId Event ID
 * @param updateData Update data
 * @returns Updated event
 */
export const updateEventById = async (
  eventId: string,
  updateData: Partial<EventData>
): Promise<Event | null> => {
  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });
  
  if (!event) {
    return null;
  }
  
  // Prepare update data
  const data: any = {};
  
  if (updateData.name) {
    data.name = updateData.name;
  }
  
  if (updateData.startTime) {
    data.startTime = updateData.startTime;
  }
  
  if (updateData.endTime) {
    data.endTime = updateData.endTime;
  }
  
  if (updateData.status) {
    data.status = updateData.status;
  }
  
  if (updateData.sportId) {
    data.sportId = updateData.sportId;
  }
  
  // Update event
  return prisma.event.update({
    where: { id: eventId },
    data
  });
};

/**
 * Update event status
 * @param eventId Event ID
 * @param status New status
 * @param result Result (if status is COMPLETED)
 * @returns Updated event
 */
export const updateEventStatus = async (
  eventId: string,
  status: EventStatus,
  result?: string
): Promise<Event | null> => {
  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });
  
  if (!event) {
    return null;
  }
  
  // Prepare update data
  const data: any = { status };
  
  // If status is COMPLETED, set endTime and result
  if (status === 'COMPLETED') {
    data.endTime = new Date();
    
    if (result) {
      data.result = result;
    }
  }
  
  // Update event
  return prisma.event.update({
    where: { id: eventId },
    data
  });
};

/**
 * Delete event
 * @param eventId Event ID
 * @returns Boolean indicating success
 */
export const deleteEventById = async (eventId: string): Promise<boolean> => {
  try {
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        bets: true
      }
    });
    
    if (!event) {
      return false;
    }
    
    // Check if event has bets
    if (event.bets.length > 0) {
      // Don't delete event with bets
      return false;
    }
    
    // Delete event and its participants in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete participants
      await tx.participant.deleteMany({
        where: { eventId }
      });
      
      // Delete event
      await tx.event.delete({
        where: { id: eventId }
      });
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
};

/**
 * Add participant to event
 * @param eventId Event ID
 * @param participantData Participant data
 * @returns Added participant
 */
export const addParticipant = async (
  eventId: string,
  participantData: ParticipantData
): Promise<Participant | null> => {
  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });
  
  if (!event) {
    return null;
  }
  
  // Create participant
  return prisma.participant.create({
    data: {
      name: participantData.name,
      odds: participantData.odds,
      eventId
    }
  });
};

/**
 * Update participant
 * @param participantId Participant ID
 * @param updateData Update data
 * @returns Updated participant
 */
export const updateParticipant = async (
  participantId: string,
  updateData: Partial<ParticipantData>
): Promise<Participant | null> => {
  // Check if participant exists
  const participant = await prisma.participant.findUnique({
    where: { id: participantId }
  });
  
  if (!participant) {
    return null;
  }
  
  // Prepare update data
  const data: any = {};
  
  if (updateData.name) {
    data.name = updateData.name;
  }
  
  if (updateData.odds !== undefined) {
    data.odds = updateData.odds;
  }
  
  // Update participant
  return prisma.participant.update({
    where: { id: participantId },
    data
  });
};

/**
 * Remove participant from event
 * @param participantId Participant ID
 * @returns Boolean indicating success
 */
export const removeParticipant = async (participantId: string): Promise<boolean> => {
  try {
    // Check if participant exists
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        event: {
          include: {
            bets: true
          }
        }
      }
    });
    
    if (!participant) {
      return false;
    }
    
    // Check if event has bets
    if (participant.event.bets.length > 0) {
      // Don't remove participant if event has bets
      return false;
    }
    
    // Delete participant
    await prisma.participant.delete({
      where: { id: participantId }
    });
    
    return true;
  } catch (error) {
    console.error('Error removing participant:', error);
    return false;
  }
};

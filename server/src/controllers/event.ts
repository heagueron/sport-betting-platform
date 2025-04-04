import { Request, Response, NextFunction } from 'express';
import { EventStatus } from '@prisma/client';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEventById,
  updateEventStatus,
  deleteEventById,
  addParticipant,
  updateParticipant,
  removeParticipant
} from '../services/event';
import { getSportById } from '../services/sport';

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin
export const createNewEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, sportId, startTime, endTime, status, participants } = req.body;

    // Validate input
    if (!name || !sportId || !startTime || !participants || !Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, sportId, startTime, and at least 2 participants'
      });
    }

    // Validate participants
    for (const participant of participants) {
      if (!participant.name || participant.odds === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Each participant must have a name and odds'
        });
      }
    }

    // Check if sport exists
    const sport = await getSportById(sportId);
    if (!sport) {
      return res.status(404).json({
        success: false,
        error: 'Sport not found'
      });
    }

    // Create event
    const event = await createEvent({
      name,
      sportId,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : undefined,
      status: status as EventStatus | undefined,
      participants
    });

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse query parameters
    const statusParam = req.query.status as string | undefined;
    const sportId = req.query.sportId as string | undefined;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);

    // Validate status if provided
    let status: EventStatus | undefined;
    if (statusParam) {
      if (['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'].includes(statusParam)) {
        status = statusParam as EventStatus;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be one of: SCHEDULED, LIVE, COMPLETED, CANCELLED'
        });
      }
    }

    // Get events
    const result = await getAllEvents(status, sportId, page, limit);

    res.status(200).json({
      success: true,
      count: result.total,
      pagination: {
        page: result.page,
        pages: result.pages,
        total: result.total
      },
      data: result.events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.id;

    // Get event
    const event = await getEventById(eventId);

    // Check if event exists
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
export const updateEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.id;
    const { name, sportId, startTime, endTime, status } = req.body;

    // Check if at least one field is provided
    if (!name && !sportId && !startTime && !endTime && !status) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one field to update'
      });
    }

    // Prepare update data
    const updateData: any = {};

    if (name) updateData.name = name;
    if (sportId) {
      // Check if sport exists
      const sport = await getSportById(sportId);
      if (!sport) {
        return res.status(404).json({
          success: false,
          error: 'Sport not found'
        });
      }
      updateData.sportId = sportId;
    }
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (status) {
      if (['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
        updateData.status = status as EventStatus;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be one of: SCHEDULED, LIVE, COMPLETED, CANCELLED'
        });
      }
    }

    // Update event
    const updatedEvent = await updateEventById(eventId, updateData);

    // Check if event exists
    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedEvent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event status
// @route   PUT /api/events/:id/status
// @access  Private/Admin
export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.id;
    const { status, result } = req.body;

    // Validate status
    if (!status || !['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid status: SCHEDULED, LIVE, COMPLETED, CANCELLED'
      });
    }

    // If status is COMPLETED, result is required
    if (status === 'COMPLETED' && !result) {
      return res.status(400).json({
        success: false,
        error: 'Result is required when status is COMPLETED'
      });
    }

    // Update event status
    const updatedEvent = await updateEventStatus(eventId, status as EventStatus, result);

    // Check if event exists
    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedEvent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
export const deleteEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.id;

    // Delete event
    const result = await deleteEventById(eventId);

    // Check if event was deleted
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Event not found or cannot be deleted because it has associated bets'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add participant to event
// @route   POST /api/events/:id/participants
// @access  Private/Admin
export const addEventParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.id;
    const { name, odds } = req.body;

    // Validate input
    if (!name || odds === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name and odds'
      });
    }

    // Add participant
    const participant = await addParticipant(eventId, { name, odds });

    // Check if event exists
    if (!participant) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(201).json({
      success: true,
      data: participant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update participant
// @route   PUT /api/events/participants/:id
// @access  Private/Admin
export const updateEventParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const participantId = req.params.id;
    const { name, odds } = req.body;

    // Check if at least one field is provided
    if (!name && odds === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one field to update'
      });
    }

    // Update participant
    const updatedParticipant = await updateParticipant(participantId, { name, odds });

    // Check if participant exists
    if (!updatedParticipant) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedParticipant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove participant from event
// @route   DELETE /api/events/participants/:id
// @access  Private/Admin
export const removeEventParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const participantId = req.params.id;

    // Remove participant
    const result = await removeParticipant(participantId);

    // Check if participant was removed
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found or cannot be removed because the event has associated bets'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

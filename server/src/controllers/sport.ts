import { Request, Response, NextFunction } from 'express';
import { EventStatus } from '@prisma/client';
import {
  createNewSport,
  getAllSports,
  getSportById,
  getSportBySlug,
  getEventsBySportId,
  updateSportById,
  deleteSportById
} from '../services/sport';

// @desc    Create new sport
// @route   POST /api/sports
// @access  Private/Admin
export const createSport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, active } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a sport name'
      });
    }

    // Check if sport with same name already exists
    const existingSport = await getSportBySlug(name.toLowerCase().replace(/\s+/g, '-'));
    if (existingSport) {
      return res.status(400).json({
        success: false,
        error: 'Sport with this name already exists'
      });
    }

    // Create sport
    const sport = await createNewSport({ name, active });

    res.status(201).json({
      success: true,
      data: sport
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sports
// @route   GET /api/sports
// @access  Public
export const getSports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse query parameters
    const active = req.query.active === 'true' ? true :
                  req.query.active === 'false' ? false : undefined;

    // Get sports
    const sports = await getAllSports(active);

    res.status(200).json({
      success: true,
      count: sports.length,
      data: sports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sport
// @route   GET /api/sports/:id
// @access  Public
export const getSport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sportId = req.params.id;

    // Check if ID is provided
    if (!sportId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a sport ID'
      });
    }

    // Get sport
    const sport = await getSportById(sportId);

    // Check if sport exists
    if (!sport) {
      return res.status(404).json({
        success: false,
        error: 'Sport not found'
      });
    }

    res.status(200).json({
      success: true,
      data: sport
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sport events
// @route   GET /api/sports/:id/events
// @access  Public
export const getSportEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sportId = req.params.id;
    const statusParam = req.query.status as string | undefined;

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

    // Check if sport exists
    const sport = await getSportById(sportId);
    if (!sport) {
      return res.status(404).json({
        success: false,
        error: 'Sport not found'
      });
    }

    // Get events
    const events = await getEventsBySportId(sportId, status);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sport
// @route   PUT /api/sports/:id
// @access  Private/Admin
export const updateSport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sportId = req.params.id;
    const { name, active } = req.body;

    // Check if at least one field is provided
    if (!name && active === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one field to update'
      });
    }

    // Update sport
    const updatedSport = await updateSportById(sportId, { name, active });

    // Check if sport exists
    if (!updatedSport) {
      return res.status(404).json({
        success: false,
        error: 'Sport not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedSport
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sport
// @route   DELETE /api/sports/:id
// @access  Private/Admin
export const deleteSport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sportId = req.params.id;

    // Delete sport
    const result = await deleteSportById(sportId);

    // Check if sport was deleted
    if (!result.success) {
      // If sport has events, return 400
      if (result.hasEvents) {
        return res.status(400).json({
          success: false,
          error: 'Sport cannot be deleted because it has associated events'
        });
      }

      // Otherwise, sport not found
      return res.status(404).json({
        success: false,
        error: 'Sport not found'
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

import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserById, generateToken, updateUserDetails } from '../services/auth';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Register user
    const user = await registerUser({ name, email, password });

    // Generate token
    const token = generateToken(user.id);

    // Set cookie
    const cookieOptions = {
      expires: new Date(
        Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || '30') * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    };

    res.cookie('token', token, cookieOptions);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      token,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('Server: login request received:', req.body);
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      console.log('Server: email or password missing');
      res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
      return;
    }

    console.log('Server: attempting to login user with email:', email);
    // Check for user
    const user = await loginUser({ email, password });

    if (!user) {
      console.log('Server: invalid credentials for email:', email);
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    console.log('Server: user found:', user.id, user.email, user.role);

    // Generate token
    const token = generateToken(user.id);
    console.log('Server: token generated');

    // Set cookie
    const cookieOptions = {
      expires: new Date(
        Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || '30') * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    };

    res.cookie('token', token, cookieOptions);
    console.log('Server: cookie set');

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log('Server: sending response');
    res.status(200).json({
      success: true,
      token,
      data: userWithoutPassword
    });
    console.log('Server: response sent');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
export const logout = (req: Request, res: Response) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // req.user is set in the auth middleware
    const user = await getUserById(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Update user details
    const user = await updateUserDetails(req.user.id, req.body);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

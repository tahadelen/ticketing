import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/user';

import { BadRequestError, validateRequest } from '@tdtickets/common';

const router = express.Router();

router.post('/api/users/signup', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 chars!')
],
validateRequest,
async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new BadRequestError('Email is in use!');
    }

    const user = User.build({ email, password });
    await user.save();

    // Generate JWT (JWT sign coming from kubernetes environment variable)
    const userJwt = jwt.sign({
            id: user.id,
            email: user.email
        }, 
        process.env.JWT!
    );
    // Store it on session
    req.session = {
        jwt: userJwt
    };

    res.status(201).send(user);
});

export { router as signupRouter };
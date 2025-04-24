import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details.map((detail: { message: any; }) => detail.message) 
      });
    }
    
    next();
  };
};

// Example validation schema for user creation
export const userCreateSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  age: Joi.number().min(18).max(120),
  college: Joi.string().allow(''),
  last_location: Joi.object({
    type: Joi.string().valid('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2)
  }).optional()
});
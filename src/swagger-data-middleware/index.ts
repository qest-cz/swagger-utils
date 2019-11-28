import { NextFunction, Request, Response } from 'express';
import { SwaggerGenerator } from '../swagger-generator';

export const swaggerDataMiddleware = (swaggerGenerator: SwaggerGenerator) => (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json(swaggerGenerator.getAsObject());
    } catch (e) {
        next(e);
    }
};

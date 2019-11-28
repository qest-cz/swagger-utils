import { NextFunction, Request, Response } from 'express';
import { SwaggerGenerator } from '../swagger-generator';

export const swaggerDataMiddleware = (swaggerGenerator: SwaggerGenerator, asJson = true) => (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        if (asJson) {
            res.status(200).json(swaggerGenerator.getAsObject());
        } else {
            res.status(200)
                .contentType('text/yaml')
                .send(swaggerGenerator.getAsYaml());
        }
    } catch (e) {
        next(e);
    }
};

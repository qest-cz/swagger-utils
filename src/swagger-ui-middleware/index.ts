import { Router } from 'express';
import * as swaggerUi from 'swagger-ui-express';

export const swaggerUiMiddleware = (options: swaggerUi.SwaggerUiOptions) => Router().use(swaggerUi.serve, swaggerUi.setup(null, options));

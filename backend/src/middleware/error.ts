import { NextFunction, Request, RequestHandler, Response } from 'express';

export class HttpError extends Error {
    constructor(public status: number, message: string, public details?: unknown) {
        super(message);
        this.name = 'HttpError';
    }

    static badRequest(message: string, details?: unknown) {
        return new HttpError(400, message, details);
    }

    static unauthorized(message = 'Authentication required') {
        return new HttpError(401, message);
    }

    static forbidden(message = 'Not permitted') {
        return new HttpError(403, message);
    }

    static notFound(message = 'Not found') {
        return new HttpError(404, message);
    }

    static conflict(message: string) {
        return new HttpError(409, message);
    }
}

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler = (handler: AsyncHandler): RequestHandler =>
    (req, res, next) => {
        handler(req, res, next).catch(next);
    };

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (res.headersSent) {
        next(err);
        return;
    }

    if (err instanceof HttpError) {
        res.status(err.status).json({ error: err.message, details: err.details });
        return;
    }

    console.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);
    res.status(500).json({ error: 'Internal server error' });
};

export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
};

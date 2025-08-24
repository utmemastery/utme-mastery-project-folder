import { Response } from 'express';

export const successResponse = <T>(res: Response, data: T, message: string, statusCode: number = 200) => {
    return res.status(statusCode).json({
        success: true,
        data,
        message
    });
};

export const errorResponse = (res: Response, message: string, statusCode: number = 500) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};
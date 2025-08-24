export class ValidationError extends Error {
    statusCode: number;
    constructor(message: string = 'Invalid input provided') {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
    }
}
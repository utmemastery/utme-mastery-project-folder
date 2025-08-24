export class ConflictError extends Error {
    statusCode: number;

    constructor(message: string = 'Resource conflict occurred') {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
    }
}
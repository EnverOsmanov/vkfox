


// Custom errors

export class AccessTokenError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, AccessTokenError.prototype)
    }
}

export class LongPollKeyError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, LongPollKeyError.prototype)
    }
}


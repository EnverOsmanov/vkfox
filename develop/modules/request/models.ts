export interface ApiOptions {
    code: string
    method?: string
}


export interface ApiQuery {
    params: ApiOptions,

    resolve(value: any): void
    reject(value: Error): void
}

// Custom errors

export class AccessTokenError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, AccessTokenError.prototype)
    }
}
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

export interface ApiResponse {
    response: any[];

    execute_errors: ApiError[]

    error ?: ApiError;
}

interface ApiError {
    error_code: number;
    error_msg: string;
    method: string;
}
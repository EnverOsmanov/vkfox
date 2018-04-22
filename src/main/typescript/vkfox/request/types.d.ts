export interface ApiOptions {
    code: string
    method?: string
}

export interface ApiQuery {
    params: ApiOptions,

    resolve(value: any): void

    reject(value: Error): void
}

export interface WithApiError {
    error?: ApiError;
}

export interface ExecuteResponse extends WithApiError {
    response: any[];

    execute_errors: ApiError[]
}

interface ApiError {
    error_code: number;
    error_msg: string;
    method: string;
}

interface DErrorResponse<P> {
    error: DApiError<P>
}

export interface DApiError<P> {
    error_code  : number;
    error_msg   : string;

    request_params: P
}

export interface DResponse {
    response: object
}
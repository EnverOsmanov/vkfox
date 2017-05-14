export interface ApiOptions {
    code: string
    method?: string
}


export interface ApiQuery {
    params: ApiOptions,

    resolve(value: any): void
    reject(value: Error): void
}
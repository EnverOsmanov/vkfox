
export interface LongPollServerRS {
    ts: number
    key: string
    server: string
}


export interface LongPollRS {
    ts: number
    updates: number[][]

    // bad style here
    failed?: number
}

export interface LPMessage extends Array<number | string | object> {
    1: number
    2: number
    3: number
    4: number
    5: string
    6: string
    7: object
}
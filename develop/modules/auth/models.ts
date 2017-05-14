import {Model} from "backbone";


export class AuthModel extends Model {
    get accessToken(): string {
        return super.get("accessToken")
    }

    get userId(): number {
        return super.get("userId")
    }


    set accessToken(value: string) {
        super.set("accessToken", value)
    }

    set userId(value: number) {
        super.set("userId", value)
    }
}


import { localize } from "./msgLocalize"

export const successMsg = (msg:string,status:number) => {
    return {
        msg:localize(msg),
        status
    }
}

import { localize } from "./msgLocalize"

export const customeError = (msg:string,status:number) => {
    return {
        msg:localize(msg),
        status
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successMsg = void 0;
const msgLocalize_1 = require("./msgLocalize");
const successMsg = (msg, status) => {
    return {
        msg: (0, msgLocalize_1.localize)(msg),
        status
    };
};
exports.successMsg = successMsg;

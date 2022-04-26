"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailCheck = exports.passwordCheck = void 0;
const passwordCheck = (password) => {
    return password.length < 8;
};
exports.passwordCheck = passwordCheck;
const emailCheck = (email) => {
    let rgx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return rgx.test(email);
};
exports.emailCheck = emailCheck;

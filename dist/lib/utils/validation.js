"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailCheck = exports.passwordCheck = void 0;
const passwordCheck = (password) => {
    return password.length < 8;
};
exports.passwordCheck = passwordCheck;
const emailCheck = (email) => {
    let rgx = /^([0-9]|[a-z])+\.?([0-9]|[a-z])+@([0-9]|[a-z])(\.?[a-z]?)+\.[a-z]{2,}$/g;
    return rgx.test(email);
};
exports.emailCheck = emailCheck;

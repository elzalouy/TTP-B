"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trelloApi = void 0;
const trelloApi = (service) => {
    let url = `https://api.trello.com/1/${service}key=${process.env.TRELLO_TEST_KEY}&token=${process.env.TRELLO_TEST_TOKEN}`;
    return url;
};
exports.trelloApi = trelloApi;

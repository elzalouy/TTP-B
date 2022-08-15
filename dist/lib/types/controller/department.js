"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createListsError = exports.createTeamListError = void 0;
// export interface CreateDopartmentResponse : {  }
exports.createTeamListError = {
    error: "team.listId",
    message: "Team list wasn't created in trello",
};
exports.createListsError = {
    error: "team.listId",
    message: "Lists was not created in trello",
};

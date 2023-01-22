"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskCase = void 0;
const TaskCase = (data) => {
    const myCase = {
        inProgress: ["In Progress", "طلب"],
        delivered: ["Done", "deliver"],
        shared: ["Shared"],
        late: ["Late"],
        "not clear": ["Not Clear"],
        cancled: ["Cancled"],
    };
    let targetCase = "";
    for (let item in myCase) {
        if (myCase[item].includes(data)) {
            targetCase = item;
        }
    }
    return targetCase;
};
exports.TaskCase = TaskCase;

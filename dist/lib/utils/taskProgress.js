"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskCase = void 0;
const TaskCase = (data) => {
    const myCase = {
        inProgress: ["inProgress", "طلب"],
        delivered: ["done", "deliver"],
        shared: ["shared"],
        late: ["late"],
        "not clear": ["not clear"],
        cancled: ["cancled"],
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

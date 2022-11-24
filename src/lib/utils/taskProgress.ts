export const TaskCase = (data: string) => {
  const myCase: any = {
    inProgress: ["In Progress", "طلب"],
    delivered: ["Done", "deliver"],
    shared: ["Shared"],
    late: ["Late"],
    "not clear": ["Not Clear"],
    cancled: ["Cancled"],
  };
  let targetCase: string = "";
  for (let item in myCase) {
    if (myCase[item].includes(data)) {
      targetCase = item;
    }
  }

  return targetCase;
};

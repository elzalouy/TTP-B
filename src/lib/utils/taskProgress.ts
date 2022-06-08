export const TaskCase = (data: string) => {
  const myCase: any = {
    inProgress: ["inProgress", "طلب"],
    delivered: ["done", "deliver"],
    shared: ["shared"],
    late: ["late"],
    "not clear": ["not clear"],
    cancled: ["cancled"],
  };
  let targetCase: string = "";
  for (let item in myCase) {
    if (myCase[item].includes(data)) {
      targetCase = item;
    }
  }

  return targetCase;
};

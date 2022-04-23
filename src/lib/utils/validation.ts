export const passwordCheck = (password: string) => {
  return password.length < 8;
};

export const emailCheck = (email: string) => {
  let rgx =
    /^([0-9]|[a-z])+\.?([0-9]|[a-z])+@([0-9]|[a-z])(\.?[a-z]?)+\.[a-z]{2,}$/g;
  return rgx.test(email);
};


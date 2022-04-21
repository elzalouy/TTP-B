export const trelloApi = (service: string): string => {
  let url = `https://api.trello.com/1/${service}key=${process.env.TRELLO_TEST_KEY}&token=${process.env.TRELLO_TEST_TOKEN}`;
  return url;
};

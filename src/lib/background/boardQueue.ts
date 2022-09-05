import queue from "queue";

export const TrelloCardActionsQueue = queue({
  results: [],
  autostart: true,
  concurrency: 1,
});

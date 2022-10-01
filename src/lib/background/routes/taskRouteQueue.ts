import Queue from "queue";

export const taskRoutesQueue = Queue({
  results: [],
  autostart: true,
  concurrency: 1,
});

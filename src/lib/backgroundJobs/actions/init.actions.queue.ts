import Queue from "queue";

export const initializeQueue = Queue({
  results: [],
  autostart: true,
});
export const intializeTaskQueue = Queue({
  results: [],
  autostart: true,
  timeout: 500,
  concurrency: 1,
});

import Queue from "queue";

export const initializeQueue = Queue({
  results: [],
  autostart: true,
  concurrency: 1,
  timeout: 1000000,
});

export const intializeTaskQueue = Queue({
  results: [],
  autostart: true,
  timeout: 500,
  concurrency: 1,
});

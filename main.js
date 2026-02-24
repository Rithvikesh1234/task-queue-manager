// Task Queue Manager - Lightweight async task queue for Node.js
class TaskQueue {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.run();
    });
  }

  async run() {
    if (this.running >= this.concurrency || this.queue.length === 0) return;
    const { task, resolve, reject } = this.queue.shift();
    this.running++;
    try {
      const result = await task();
      resolve(result);
    } catch (e) {
      reject(e);
    } finally {
      this.running--;
      this.run();
    }
  }
}

// Demo
const queue = new TaskQueue(2);
const delay = (ms, label) => () =>
  new Promise(r => setTimeout(() => { console.log(`✅ Done: ${label}`); r(label); }, ms));

(async () => {
  console.log("Starting task queue with concurrency=2");
  await Promise.all([
    queue.add(delay(1000, "Task A")),
    queue.add(delay(500,  "Task B")),
    queue.add(delay(800,  "Task C")),
    queue.add(delay(300,  "Task D")),
  ]);
  console.log("All tasks complete!");
})();

// Rate-limited fetch wrapper
// - Limits requests to 5 per second (200ms between sends)
// - Retries on HTTP 429 with exponential backoff: 1s, 2s, 4s
// - Uses async/await and returns the underlying Fetch API Response

const RATE_INTERVAL_MS = 200; // 200ms between requests -> 5 req/sec
const RETRY_DELAYS = [1000, 2000, 4000]; // ms

const queue = [];
let processorStarted = false;
let isProcessing = false; // Add processing lock

function ensureProcessor() {
  if (processorStarted) return;
  processorStarted = true;
  setInterval(processNext, RATE_INTERVAL_MS);
}

async function processNext() {
  if (queue.length === 0 || isProcessing) return; // Skip if empty or already processing
  
  isProcessing = true;
  const task = queue.shift();
  
  try {
    await task.run();
  } catch (err) {
    console.error('Task execution error:', err);
  } finally {
    isProcessing = false;
  }
}

function createTask(input, init, resolve, reject) {
  return {
    input,
    init,
    attempt: 0,
    async run() {
      try {
        const res = await fetch(this.input, this.init);
        
        if (res.status !== 429) {
          resolve(res);
          return;
        }

        // Received 429 - determine whether to retry
        if (this.attempt < RETRY_DELAYS.length) {
          const delay = RETRY_DELAYS[this.attempt];
          this.attempt += 1;
          console.warn(`Rate limited (429). Retrying in ${delay}ms (attempt ${this.attempt}/${RETRY_DELAYS.length})`);
          
          // Wait for backoff delay then re-add to queue
          await new Promise(r => setTimeout(r, delay));
          queue.unshift(this); // Add to front of queue for priority retry
        } else {
          reject(new Error('Too Many Requests (429) - max retries exceeded'));
        }
      } catch (err) {
        reject(err);
      }
    },
  };
}

/**
 * rateLimitedFetch - enqueue a fetch request and return a Promise for its Response
 * @param {RequestInfo} input
 * @param {RequestInit} [init]
 * @returns {Promise<Response>}
 */
export function rateLimitedFetch(input, init) {
  ensureProcessor();
  return new Promise((resolve, reject) => {
    const task = createTask(input, init, resolve, reject);
    queue.push(task);
  });
}

export default rateLimitedFetch;
// Request coordinator - prevents duplicate concurrent API calls
const pendingRequests = new Map();
const rateLimitDelay = 2000; // 2 seconds between different endpoint calls

class RequestCoordinator {
  constructor() {
    this.lastRequestTime = 0;
    this.requestQueue = [];
    this.processing = false;
  }

  async execute(key, requestFn) {
    // If same request is already in flight, return that promise
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }

    // Calculate delay needed
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const neededDelay = Math.max(0, rateLimitDelay - timeSinceLastRequest);

    if (neededDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, neededDelay));
    }

    // Make the request
    const promise = requestFn()
      .then(result => {
        pendingRequests.delete(key);
        this.lastRequestTime = Date.now();
        return result;
      })
      .catch(error => {
        pendingRequests.delete(key);
        this.lastRequestTime = Date.now();
        throw error;
      });

    pendingRequests.set(key, promise);
    return promise;
  }
}

export const coordinator = new RequestCoordinator();
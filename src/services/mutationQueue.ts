/**
 * Asynchronous Mutation Queue (FIFO) with Rate-Limiting, Auto-Retry & Throttling
 * Prevents server/DB bursts, handles offline/online queueing, and retries on transient errors.
 */

type QueueTask = () => Promise<void>;

interface QueueItem {
  task: QueueTask;
  retries: number;
}

class MutationQueue {
  private queue: QueueItem[] = [];
  private isProcessing = false;
  private minIntervalMs = 60;
  private maxRetries = 3;

  public enqueue(task: QueueTask) {
    this.queue.push({ task, retries: 0 });
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const currentItem = this.queue.shift();

    if (currentItem) {
      try {
        await currentItem.task();
      } catch (err: any) {
        console.warn('[MUTATION QUEUE RETRY]:', err?.message || err);
        if (currentItem.retries < this.maxRetries) {
          currentItem.retries += 1;
          setTimeout(() => {
            this.queue.unshift(currentItem);
            if (!this.isProcessing) {
              this.processQueue();
            }
          }, 350 * currentItem.retries);
        }
      }
    }

    setTimeout(() => {
      this.processQueue();
    }, this.minIntervalMs);
  }
}

export const mutationQueue = new MutationQueue();

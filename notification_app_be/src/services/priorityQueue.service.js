// priority weights for notification types
const TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

// score = type importance * big number + timestamp
// so placement always beats result, result always beats event
// within same type, newer wins because timestamp is higher
function computeScore(notification) {
  const type = notification.Type || notification.type || '';
  const weight = TYPE_WEIGHT[type] || 0;
  const raw = notification.Timestamp || notification.sentAt || notification.createdAt || 0;
  const ts = raw ? new Date(raw).getTime() : 0;
  return weight * 1e13 + ts;
}

// min-heap - root is always the smallest score
// we use a min-heap of size n to track the top-n notifications
// when a new notification comes in, if its score > root score, swap it in
class MinHeap {
  constructor() {
    this.heap = [];
  }

  get size() { return this.heap.length; }
  peek() { return this.heap[0] || null; }

  push(item) {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (!this.heap.length) return null;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  toSortedArray() {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }

  bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].score > this.heap[i].score) {
        [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
        i = parent;
      } else break;
    }
  }

  sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left].score < this.heap[smallest].score) smallest = left;
      if (right < n && this.heap[right].score < this.heap[smallest].score) smallest = right;
      if (smallest !== i) {
        [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
        i = smallest;
      } else break;
    }
  }
}

// returns top n notifications by priority
function getTopN(notifications, n = 10) {
  const heap = new MinHeap();

  for (const notif of notifications) {
    const scored = { ...notif, score: computeScore(notif) };
    if (heap.size < n) {
      heap.push(scored);
    } else if (heap.peek() && scored.score > heap.peek().score) {
      heap.pop();
      heap.push(scored);
    }
  }

  return heap.toSortedArray();
}

module.exports = { MinHeap, getTopN, computeScore, TYPE_WEIGHT };

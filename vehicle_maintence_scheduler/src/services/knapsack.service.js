// 0/1 Knapsack - picks best tasks within the hour budget
// each vehicle has Duration (weight) and Impact (value)
// goal: max total Impact without exceeding MechanicHours (capacity)

function knapsack(capacity, vehicles) {
  const n = vehicles.length;

  if (n === 0 || capacity <= 0) {
    return { maxImpact: 0, selectedTasks: [], totalDuration: 0, unusedHours: capacity };
  }

  // build dp table bottom-up
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { Duration, Impact } = vehicles[i - 1];
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w];
      if (Duration <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - Duration] + Impact);
      }
    }
  }

  // backtrack to find which tasks were selected
  const picked = [];
  let remaining = capacity;

  for (let i = n; i >= 1; i--) {
    if (dp[i][remaining] !== dp[i - 1][remaining]) {
      picked.push(vehicles[i - 1]);
      remaining -= vehicles[i - 1].Duration;
    }
  }

  const totalDuration = picked.reduce((sum, t) => sum + t.Duration, 0);

  return {
    maxImpact: dp[n][capacity],
    selectedTasks: picked,
    totalDuration,
    unusedHours: capacity - totalDuration,
  };
}

module.exports = { knapsack };


export function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function stddev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const m = mean(nums);
  const variance = nums.reduce((acc, n) => acc + Math.pow(n - m, 2), 0) / (nums.length - 1);
  return Math.sqrt(variance);
}

export function rolling<T>(arr: T[], window: number, reducer: (slice: T[]) => number): number[] {
  if (window <= 0) return [];
  const result: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    const slice = arr.slice(Math.max(0, i - window + 1), i + 1);
    result.push(reducer(slice));
  }
  return result;
}

export function streaks(bools: boolean[]): { longestTrue: number; longestFalse: number } {
  let longestTrue = 0;
  let longestFalse = 0;
  let currentTrue = 0;
  let currentFalse = 0;

  for (const bool of bools) {
    if (bool) {
      currentTrue++;
      currentFalse = 0;
    } else {
      currentFalse++;
      currentTrue = 0;
    }
    if (currentTrue > longestTrue) {
      longestTrue = currentTrue;
    }
    if (currentFalse > longestFalse) {
      longestFalse = currentFalse;
    }
  }

  return { longestTrue, longestFalse };
}

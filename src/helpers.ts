/**
 *
 * @param {T[]} arr
 * @param {number} depth
 * @return {T}
 */
export function flatten<T>(arr: T[], depth: number = 1): T {
  return (arr) ? arr.reduce((a, v) => a.concat(depth > 1 && Array.isArray(v) ? flatten(v, depth - 1) : v), []) as any : [];
}

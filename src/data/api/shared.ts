/** 各域共用的小工具，避免每个模块重复写边界钳制与时间换算。 */

/** 把数值限制在 [min, max] 内，非有限值回落到 min。 */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

/** 后端 100ns tick → 秒；非法值回落为 0。 */
export function ticksToSeconds(ticks: number | null | undefined): number {
  if (ticks === null || ticks === undefined || !Number.isFinite(ticks) || ticks <= 0) return 0;
  return Math.round(ticks / 10_000_000);
}

/**
 * 取第一个可用的总数：跳过 null/undefined/空白串，但保留合法的 0。
 * 不能直接用 Number()：它会把 null 和 "" 变成 0，掩盖"后端没给"与"真的是 0"的区别。
 */
export function firstCount(...candidates: unknown[]): number | null {
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    if (typeof candidate === "string" && candidate.trim() === "") continue;
    const num = typeof candidate === "number" ? candidate : Number(candidate);
    if (Number.isFinite(num)) return num;
  }
  return null;
}

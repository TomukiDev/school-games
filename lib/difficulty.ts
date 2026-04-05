import MATRIX from "@/config/difficulty.json";

// 10x10 difficulty matrix: index [a-1][b-1] gives difficulty 1..10 for a × b
export const DIFFICULTY_MATRIX: number[][] = Array.isArray(MATRIX) ? (MATRIX as number[][]) : [];

export function getPointsFor(a: number, b: number): number {
  const ai = Math.max(1, Math.min(10, a)) - 1;
  const bi = Math.max(1, Math.min(10, b)) - 1;
  const value = DIFFICULTY_MATRIX[ai]?.[bi];
  if (typeof value === "number" && value >= 1 && value <= 10) {
    return value;
  }
  return 1;
}

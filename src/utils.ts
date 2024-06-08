/**
 * Author: Samir <samirdiff@proton.me>
 */

export function processServiceInfo(
  info: any,
  coins: Record<string, string>,
  prefix: string = "",
) {
  for (const [key, value] of Object.entries(info)) {
    if (value && typeof value === "object" && "ticker" in value) {
      coins[prefix + key] = value.ticker as string;
    } else if (value && typeof value === "object") {
      processServiceInfo(value, coins, `${prefix}${key}_`);
    }
  }
}

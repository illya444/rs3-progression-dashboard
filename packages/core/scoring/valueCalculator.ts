export function calculateValue(xpReward: number, timeCost: number) {

  return xpReward / Math.max(timeCost, 1)

}

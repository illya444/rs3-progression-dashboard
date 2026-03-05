export function normalizeGEPrices(data: any) {

  const prices: Record<string, number> = {}

  for (const item of data.data) {
    prices[item.name] = item.price
  }

  return prices

}

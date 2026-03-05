export function merchantOpportunities(items: any[]) {

  return items.filter(
    item => item.value > item.cost
  )

}

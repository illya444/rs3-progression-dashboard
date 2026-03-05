export function normalizeMerchant(data: any) {

  return {
    items: data.items || []
  }

}

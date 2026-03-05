export function calculateProfitTraining(methods: any[]) {

  return methods.sort(
    (a, b) => b.profitPerHour - a.profitPerHour
  )

}

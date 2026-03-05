export function estimateCompletion(path: string[], methodData: any) {

  let totalHours = 0

  for (const step of path) {

    const method = methodData[step]

    if (method) {
      totalHours += method.hours || 0
    }

  }

  return totalHours
}

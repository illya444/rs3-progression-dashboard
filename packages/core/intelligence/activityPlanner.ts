export function buildDailyPlan(activities: any) {

  return activities.map((a: any) => ({
    id: a.id,
    description: a.description
  }))

}

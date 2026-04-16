const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

export function formatOdometer(km: number): string {
  return km.toLocaleString('en-US') + ' km'
}

export function getConditionLabel(grade: number): string {
  if (grade >= 4.0) return 'Excellent'
  if (grade >= 3.0) return 'Good'
  if (grade >= 2.0) return 'Fair'
  return 'Poor'
}

export function getConditionColor(grade: number): string {
  if (grade >= 4.0) return 'text-green-500'
  if (grade >= 2.5) return 'text-amber-400'
  return 'text-red-500'
}

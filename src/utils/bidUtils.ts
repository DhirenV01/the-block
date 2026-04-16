export function getMinBidIncrement(currentBid: number): number {
  if (currentBid < 10000) return 250
  if (currentBid < 25000) return 500
  if (currentBid < 50000) return 750
  return 1000
}

export function getMinBid(currentBid: number): number {
  return currentBid + getMinBidIncrement(currentBid)
}

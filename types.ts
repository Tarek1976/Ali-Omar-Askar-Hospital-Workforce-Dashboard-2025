
export interface WorkforceGroup {
  name: string;
  vacant: number;
  occupied: number;
  total: number;
  vacancyRate: number;
  color: string;
}

export interface SummaryStats {
  totalPositions: number;
  totalOccupied: number;
  totalVacant: number;
  stabilityRate: number;
  vacancyRate: number;
}

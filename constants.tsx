
import { WorkforceGroup, SummaryStats } from './types';

export const WORKFORCE_DATA: WorkforceGroup[] = [
  { name: 'طبية مساعدة', vacant: 90, occupied: 755, total: 845, vacancyRate: 10.6, color: '#0ea5e9' },
  { name: 'طبية', vacant: 137, occupied: 296, total: 433, vacancyRate: 31.6, color: '#f43f5e' },
  { name: 'إدارية مساعدة', vacant: 43, occupied: 74, total: 117, vacancyRate: 36.7, color: '#8b5cf6' },
  { name: 'إدارية', vacant: 34, occupied: 35, total: 69, vacancyRate: 49.2, color: '#f59e0b' },
  { name: 'مهنية علمية', vacant: 25, occupied: 40, total: 65, vacancyRate: 38.5, color: '#10b981' },
  { name: 'فنية مساعدة', vacant: 3, occupied: 47, total: 50, vacancyRate: 6.0, color: '#6366f1' },
  { name: 'خدمية', vacant: 11, occupied: 31, total: 42, vacancyRate: 26.1, color: '#64748b' },
  { name: 'تشغيلية', vacant: 1, occupied: 33, total: 34, vacancyRate: 2.9, color: '#2dd4bf' },
  { name: 'فنية', vacant: 0, occupied: 33, total: 33, vacancyRate: 0, color: '#ec4899' },
  { name: 'قيادية', vacant: 1, occupied: 0, total: 1, vacancyRate: 100, color: '#000000' },
];

export const SUMMARY_STATS: SummaryStats = {
  totalPositions: 1689,
  totalOccupied: 1344,
  totalVacant: 345,
  stabilityRate: 79.6,
  vacancyRate: 20.4,
};

export const REPORT_METADATA = {
  author: 'م: طارق المغربي',
  role: 'تحليل بيانات',
  date: '26/12/2025م',
  hospital: 'مستشفى علي عمر عسكر'
};

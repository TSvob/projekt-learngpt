import { SummaryData } from './summary-data-interface';

export interface SummaryInterface {
  _id: string;
  created_at: string;
  data: SummaryData[];
}
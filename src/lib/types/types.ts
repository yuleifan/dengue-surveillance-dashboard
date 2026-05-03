// src/lib/types/types.ts

export interface Indicator {
  id: string;
  label: string;
  description?: string;
}

export interface AgeGroup {
  id: string;
  label: string;
}

export interface SummaryType {
  id: string;
  label: string;
}

export interface HospitalAdmissionRecord {
  admin0Id: string;
  admin2Id: string;
  summaryType: 'mean' | 'standardDeviation';
  age: string;
  hospitalAdmissions: number;
}

export interface NonAgeRecord {
  admin0Id: string;
  admin2Id: string;
  summaryType: 'mean' | 'standardDeviation';
  forceOfInfection?: number;
  prevalenceAmong9YearOlds?: number;
}

export type DataRecord = HospitalAdmissionRecord | NonAgeRecord;

export type IndicatorId = 'forceOfInfection' | 'prevalenceAmong9YearOlds' | 'hospitalAdmissions';


export interface Metadata {
  admin0Label: string;
  admin2Label: string;
  summaryTypes: SummaryType[];
  ageGroups: AgeGroup[];
  indicators: Indicator[];
}
// src/lib/stores/appState.svelte.ts

import { exerciseData, exerciseMetadata } from '../data/dataStore';
import type { DataRecord, IndicatorId } from '../types/types';   

export function createAppState() {
  
  let currentCountry = $state<string>('AGO');
  let currentIndicator = $state<IndicatorId>('hospitalAdmissions');

  const countries = $derived(Array.from(new Set(exerciseData.map(d => d.admin0Id))).sort());
  const indicators = $derived(exerciseMetadata.indicators);
  const ageGroups = $derived(exerciseMetadata.ageGroups);

  const filteredData = $derived(
    exerciseData.filter(d => d.admin0Id === currentCountry && currentIndicator in d)
  );

  const meanRecords = $derived(
    filteredData.filter(d => d.summaryType === 'mean')
  );

  const sdRecords = $derived(
    currentIndicator === 'hospitalAdmissions'
      ? filteredData.filter(d => d.summaryType === 'standardDeviation')
      : []
  );

  return {
    get currentCountry() { return currentCountry; },
    set currentCountry(v: string) { currentCountry = v; },
    get currentIndicator() { return currentIndicator; },
    set currentIndicator(v: IndicatorId) { currentIndicator = v; },   
    get countries() { return countries; },
    get indicators() { return indicators; },
    get ageGroups() { return ageGroups; },
    get meanRecords() { return meanRecords; },
    get sdRecords() { return sdRecords; },
  };
}

export const appState = createAppState();
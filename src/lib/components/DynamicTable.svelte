<!-- src/lib/components/DynamicTable.svelte -->

<script lang="ts">
  import { appState } from '../stores/appState.svelte';
  import type { DataRecord } from '../types/types';

    // Receives a callback function passed from the parent component (for highlighting).
  let { onSelectRegion }: { onSelectRegion?: (regionId: string) => void } = $props();
  
  $inspect(appState.countries)
  $inspect(appState.ageGroups)
  $inspect(appState.indicators)
  
  function getValue(rec: DataRecord, indicatorId: string): number {
    if (indicatorId === 'hospitalAdmissions' && 'hospitalAdmissions' in rec) {
      return rec.hospitalAdmissions;
    }
    if (indicatorId === 'forceOfInfection' && 'forceOfInfection' in rec) {
      return rec.forceOfInfection ?? 0;
    }
    if (indicatorId === 'prevalenceAmong9YearOlds' && 'prevalenceAmong9YearOlds' in rec) {
      return rec.prevalenceAmong9YearOlds ?? 0;
    }
    return 0;
  }
  
  let meanRecs = $derived(appState.meanRecords);
  let sdRecs = $derived(appState.sdRecords);
  let ageGroups = $derived(appState.ageGroups);
  let currentIndicator = $derived(appState.currentIndicator);

  // Hospitalization indicators: constructed by age group
  let ageRows = $derived(
    currentIndicator === 'hospitalAdmissions'
      ? ageGroups.map(age => {
          const meanRec = meanRecs.find(r => 'age' in r && r.age === age.id) as any;
          const sdRec = sdRecs.find(r => 'age' in r && r.age === age.id) as any;
          return {
            ageLabel: age.label,
            mean: meanRec ? getValue(meanRec, currentIndicator) : 0,
            sd: sdRec ? getValue(sdRec, currentIndicator) : null,
          };
        })
      : []
  );

  // Non-hospitalization indicators: displayed by region
  let regionRows = $derived(
    currentIndicator !== 'hospitalAdmissions'
      ? meanRecs.map(rec => ({
          regionId: rec.admin2Id,
          value: getValue(rec, currentIndicator),
        }))
      : []
  );

  function handleRowClick(regionId: string) {
    onSelectRegion?.(regionId);
  }
</script>

<div class="scrollable-table">
  {#if currentIndicator === 'hospitalAdmissions'}
    <table>
      <thead>
        <tr>
          <th>Age group</th>
          <th>Mean</th>
          <th>Std Dev</th>
        </tr>
      </thead>
      <tbody>
        {#each ageRows as row}
          <tr>
            <td>{row.ageLabel}</td>
            <td class="numeric">{row.mean.toFixed(2)}</td>
            <td class="numeric">{row.sd?.toFixed(2) ?? '-'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <table>
      <thead>
        <tr>
          <th>Region (Admin2)</th>
          <th>{appState.indicators.find(i => i.id === currentIndicator)?.label ?? currentIndicator}</th>
        </tr>
      </thead>
      <tbody>
        {#each regionRows as row}
          <tr onclick={() => handleRowClick(row.regionId)}>
            <td>{row.regionId}</td>
            <td class="numeric">{row.value.toFixed(4)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .scrollable-table {
    max-height: 400px;      
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  th, td {
    padding: 0.5rem 0.75rem;
    text-align: left;
    border-bottom: 1px solid #f3f4f6;
  }
  th {
    position: sticky;
    top: 0;
    background-color: #f9fafb;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
  }
  .numeric {
    text-align: right;
    font-family: monospace;
  }
  tbody tr:hover {
    background-color: #f9fafb;
  }

  td:first-child, th:first-child {
    padding-left: 0.75rem;
  }
  td:last-child, th:last-child {
    padding-right: 0.75rem;
  }
</style>
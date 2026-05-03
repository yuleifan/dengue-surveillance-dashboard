<!-- src/App.svelte -->
 
<script lang="ts">
  import Controls from './lib/components/Controls.svelte';
  import DynamicTable from './lib/components/DynamicTable.svelte';
  import AgeChart from './lib/charts/AgeChart.svelte';
  import ForceHeatmap from './lib/charts/ForceHeatmap.svelte';
  import SeroprevalenceChart from './lib/charts/SeroprevalenceChart.svelte'
  import { appState } from './lib/stores/appState.svelte';

  let selectedRegion = $state('');

  //Monitor changes in indicators or countries, and reset the highlighted area.
  $effect(() => {
    appState.currentIndicator;
    appState.currentCountry;   
    selectedRegion = '';
  });

  function handleSelectRegion(regionId: string) {
    selectedRegion = regionId;
  }
</script>

<main class="dashboard">
  <h1 class="title">Dengue Surveillance Dashboard</h1>
  <Controls />

  <div class="two-columns">
    <!-- left：table -->
    <div class="table-container">
      <h2>Table View</h2>
      <DynamicTable onSelectRegion={handleSelectRegion} />
    </div>

    <!-- right：charts -->
    {#if appState.currentIndicator === 'hospitalAdmissions'}
      <div class="chart-container">
        <h2>Age Profile of Hospital Admissions</h2>
        {#key appState.currentCountry}
          <AgeChart />
        {/key}
      </div>
    {:else if appState.currentIndicator === 'forceOfInfection'}
      <div class="chart-container">
        <h2>Force of Infection by Region</h2>
        {#key appState.currentCountry}
          <ForceHeatmap selectedRegion={selectedRegion} />
        {/key}
      </div>
    {:else if appState.currentIndicator === 'prevalenceAmong9YearOlds'}
      <div class="chart-container">
        <h2>Seroprevalence at Age 9 by Region</h2>
        {#key appState.currentCountry}
          <SeroprevalenceChart />
        {/key}
      </div>
    {/if}
  </div>
</main>

<style>
  .dashboard {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .title {
    font-size: 1.875rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  /* grid */
  .two-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    align-items: stretch;   
  }
  .table-container,
  .chart-container {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 0.5rem;
    overflow: hidden;        
  }
  .table-container h2,
  .chart-container h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    padding: 0 0.25rem;
  }


  @media (max-width: 768px) {
    .two-columns {
      grid-template-columns: 1fr;
    }
  }

  :global(.global-tooltip) {
    position: fixed;
    display: none;
    background-color: rgba(0,0,0,0.75);
    color: white;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-family: monospace;
    pointer-events: none;
    z-index: 1000;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
</style>
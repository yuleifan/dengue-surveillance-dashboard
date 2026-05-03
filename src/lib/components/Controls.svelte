<!-- src/lib/components/Controls.svelte -->

<script lang="ts">
  import { appState } from '../stores/appState.svelte';
</script>

<div class="controls-row">
  <div class="control-group">
    <label for="country-select">Country:</label>
    <select  id="country-select" bind:value={appState.currentCountry}>
      {#each appState.countries as country}
        <option value={country}>{country}</option>
      {/each}
    </select>
  </div>
  <div class="control-group">
    <label for="indicator-select">Indicator:</label>
    <select id="indicator-select" bind:value={appState.currentIndicator}>
      {#each appState.indicators as ind}
        <option value={ind.id}>{ind.label}</option>
      {/each}
    </select>
  </div>
</div>

<style>
  .controls-row {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;   
    margin-bottom: 1rem;
  }
  .control-group {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .control-group label {
    font-weight: 500;
    font-size: 0.875rem;
  }
  .control-group select {
    padding: 0.25rem 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.875rem;
  }
</style>
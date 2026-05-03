<!-- src/lib/charts/SeroprevalenceChart.svelte -->

<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import * as d3 from 'd3';
  import { appState } from '../stores/appState.svelte';

  let wrapper: HTMLDivElement;
  let tooltip: HTMLDivElement;
  let containerWidth = $state(600);
  let containerHeight = $state(450); 
 
  const margin = { top: 20, right: 120, bottom: 20, left: 30 }; 
  const innerWidth = $derived(Math.max(200, containerWidth - margin.left - margin.right));
  const innerHeight = $derived(Math.max(200, containerHeight - margin.top - margin.bottom));
  const radius = $derived(Math.min(innerWidth, innerHeight) / 2);
  const centerX = $derived(margin.left + innerWidth / 2);
  const centerY = $derived(margin.top + innerHeight / 2);

  const records = $derived(appState.meanRecords.filter((r: any) => 'prevalenceAmong9YearOlds' in r));
  const data = $derived(
    records
      .map((r: any) => ({ region: r.admin2Id, prevalence: r.prevalenceAmong9YearOlds ?? 0 }))
      .filter(d => d.prevalence > 0)
      .sort((a, b) => b.prevalence - a.prevalence)
  );
  const color = $derived(
    d3.scaleOrdinal<string>()
      .domain(data.map(d => d.region))
      .range(d3.schemeTableau10)
  );
  const pie = $derived(d3.pie<any>().value(d => d.prevalence)(data));
  const arc = $derived(d3.arc<any, d3.PieArcDatum<any>>().innerRadius(0).outerRadius(radius));

  function updateSize() {
    if (wrapper) {
      containerWidth = wrapper.clientWidth;
      containerHeight = wrapper.clientHeight;
    }
  }

  let resizeObserver: ResizeObserver;
  onMount(() => {
    updateSize();
    resizeObserver = new ResizeObserver(() => updateSize());
    if (wrapper) resizeObserver.observe(wrapper);
  });
  onDestroy(() => {
    if (resizeObserver) resizeObserver.disconnect();
  });


</script>

<div bind:this={wrapper} class="pie-chart-wrapper">
  <svg width="100%" height="100%">
    <g transform="translate({centerX},{centerY})">
      {#each pie as slice}
        <path
          d={arc(slice)}
          fill={color(slice.data.region)}
          stroke="#ffffff"
          stroke-width="2"
          role="img"
          aria-label={`Sector for ${slice.data.region}`}
          onmouseenter={(e) => {
            if (tooltip) {
              tooltip.style.display = 'block';
              tooltip.innerHTML = `<strong>${slice.data.region}</strong><br/>Prevalence: ${slice.data.prevalence.toFixed(2)}%`;
              tooltip.style.left = e.pageX + 12 + 'px';
              tooltip.style.top = e.pageY - 28 + 'px';
            }
          }}
          onmouseleave={() => {
            if (tooltip) tooltip.style.display = 'none';
          }}
        />
      {/each}
    </g>
    <!-- legend -->
    <g transform="translate({centerX + radius + 10},{margin.top})">
      {#each data as d, i}
        <g transform="translate(0, {i * 18})">
          <rect width="12" height="12" fill={color(d.region)} rx="2" />
          <text x="16" y="10" font-size="10" fill="#333">
            {d.region} ({d.prevalence.toFixed(1)}%)
          </text>
        </g>
      {/each}
    </g>
  </svg>
  <div bind:this={tooltip} class="tooltip-internal"></div>
</div>

<style>
  .pie-chart-wrapper {
    width: 100%;
    height: 100%;      
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    position: relative;
    overflow: hidden;  
  }
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
  .tooltip-internal {
    position: fixed;
    display: none;
    background-color: rgba(0,0,0,0.75);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-family: monospace;
    pointer-events: none;
    z-index: 1000;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
</style>
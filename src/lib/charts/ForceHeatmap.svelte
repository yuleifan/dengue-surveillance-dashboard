<!-- src/lib/charts/ForceHeatmap.svelte -->

<script lang="ts">
  import * as d3 from 'd3';
  import { appState } from '../stores/appState.svelte';
  import { onMount, onDestroy } from 'svelte';

  export let selectedRegion: string = '';

  let wrapper: HTMLDivElement;
  let gx: SVGGElement | undefined;
  let gy: SVGGElement | undefined;

  $: records = appState.meanRecords.filter((r: any) => 'forceOfInfection' in r);
  $: data = records
    .map((r: any) => ({ region: r.admin2Id, value: r.forceOfInfection ?? 0 }))
    .sort((a, b) => b.value - a.value);

  $: barHeight = 24;
  $: contentHeight = data.length * barHeight;
  // top 10 + content + bottom 12
  $: baseHeight = Math.max(200, contentHeight + 10 + 12);
  $: maxVal = d3.max(data, d => d.value) || 0.01;

  let containerWidth = 600;
  function updateWidth() {
    if (wrapper) containerWidth = wrapper.clientWidth;
  }

  let resizeObserver: ResizeObserver;
  onMount(() => {
    updateWidth();
    resizeObserver = new ResizeObserver(() => updateWidth());
    if (wrapper) resizeObserver.observe(wrapper);
  });
  onDestroy(() => {
    if (resizeObserver) resizeObserver.disconnect();
  });

  $: leftMargin = 80;
  $: rightMargin = 20;
  $: innerWidth = Math.max(200, containerWidth - leftMargin - rightMargin);
  $: xScale = d3.scaleLinear([0, maxVal], [0, innerWidth]);

  // Y start from top 2
  $: yScale = d3.scaleBand(data.map(d => d.region), [2, contentHeight]).padding(0.2);

  $: if (gy) d3.select(gy).call(d3.axisLeft(yScale));
  $: if (gx) d3.select(gx).call(d3.axisBottom(xScale).ticks(6));

  $: svgWidth = containerWidth;
  $: svgHeight = baseHeight;
</script>

<div bind:this={wrapper} class="heatmap-wrapper">
  <svg width={svgWidth} height={svgHeight}>
    <g bind:this={gy} transform="translate({leftMargin},5)" />
    <g bind:this={gx} transform="translate({leftMargin},{5 + contentHeight})" />

    {#each data as d}
      <rect
        class:highlight={selectedRegion === d.region}
        x={leftMargin}
        y={5 + (yScale(d.region) ?? 0)}
        width={xScale(d.value)}
        height={yScale.bandwidth() ?? barHeight}
        fill={d3.interpolateReds(d.value / maxVal)}
        rx="3"
      />
      <text
        x={leftMargin + xScale(d.value) + 5}
        y={5 + (yScale(d.region) ?? 0) + (yScale.bandwidth() ?? barHeight) / 2 + 4}
        font-size="10"
        fill="#333"
      >{d.value.toFixed(4)}</text>
    {/each}
  </svg>
</div>

<style>
  .heatmap-wrapper {
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: auto;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
  }
  rect.highlight {
    stroke: yellow;
    stroke-width: 5;
    filter: brightness(0.9);
  }
</style>
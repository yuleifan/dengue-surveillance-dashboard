<!-- src/lib/charts/AgeChart.svelte -->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import { appState } from '../stores/appState.svelte';

  let wrapper: HTMLDivElement;
  let gx: SVGGElement;
  let gy: SVGGElement;
  let tooltip: HTMLDivElement;
  let containerWidth = 600;

  $: meanRecs = appState.meanRecords;
  $: sdRecs = appState.sdRecords;
  $: ageGroups = appState.ageGroups;

  $: chartData = ageGroups.map(age => {
    const meanRec = meanRecs.find(r => 'age' in r && r.age === age.id) as any;
    const sdRec = sdRecs.find(r => 'age' in r && r.age === age.id) as any;
    return {
      ageLabel: age.label,
      mean: meanRec?.hospitalAdmissions ?? 0,
      sd: sdRec?.hospitalAdmissions ?? 0,
    };
  });

  
  const height = 400;
  const margin = { top: 20, right: 30, bottom: 80, left: 60 };

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

  $: innerWidth = Math.max(200, containerWidth - margin.left - margin.right);
  $: x = d3.scaleBand()
      .domain(ageGroups.map(g => g.label))
      .range([0, innerWidth])
      .padding(0.5);
  $: yMax = d3.max(chartData, d => d.mean + d.sd) || 1;
  $: y = d3.scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([height - margin.top - margin.bottom, 0]);

  $: lineGenerator = d3.line<{ mean: number }>()
      .x((_, i) => (x(chartData[i]?.ageLabel) ?? 0) + x.bandwidth() / 2)
      .y(d => y(d.mean))
      .curve(d3.curveLinear);

  $: if (gx) {
    d3.select(gx).call(d3.axisBottom(x));
    // Rotate 45 degrees and adjust the position.
    d3.select(gx)
      .selectAll('.tick text')
      .attr('transform', 'rotate(-45)')
      .attr('dx', '-0.5em')
      .attr('dy', '0.2em')
      .style('text-anchor', 'end');
  }
  $: if (gy) d3.select(gy).call(d3.axisLeft(y));
</script>

<div bind:this={wrapper} class="chart-wrapper">
  <svg width={containerWidth} height={height}>
    <g bind:this={gy} transform="translate({margin.left},{margin.top})" />
    <g bind:this={gx} transform="translate({margin.left},{height - margin.bottom})" />

    <!-- Shadow Rectangle means the range of the value mean-sd to mean+sd -->
    {#each chartData as d}
      {@const xPos = x(d.ageLabel)}
      {@const yLow = y(Math.max(0, d.mean - d.sd))}
      {@const yHigh = y(d.mean + d.sd)}
      {#if xPos !== undefined}
        <rect
          x={margin.left + xPos}
          y={margin.top + yHigh}
          width={x.bandwidth()}
          height={yLow - yHigh}
          fill="steelblue"
          opacity="0.2"
        />
      {/if}
    {/each}

    <!-- line -->
    <path
      d={lineGenerator(chartData.map(v => ({ mean: v.mean })))}
      fill="none"
      stroke="steelblue"
      stroke-width="2"
      transform="translate({margin.left},{margin.top})"
    />

    <!-- dot: mean value -->
    {#each chartData as d}
      {@const cx = margin.left + (x(d.ageLabel) ?? 0) + x.bandwidth() / 2}
      {@const cy = margin.top + y(d.mean)}
      <circle
        cx={cx}
        cy={cy}
        r="5"
        fill="steelblue"
        stroke="white"
        stroke-width="1.5"
        role="img"
        aria-label="Data point for {d.ageLabel}"
        on:mouseenter={(e) => {
          if (!tooltip) return;
          tooltip.style.display = 'block';
          tooltip.innerHTML = `<strong>${d.ageLabel}</strong><br/>Mean: ${d.mean.toFixed(2)}<br/>SD: ${d.sd.toFixed(2)}`;
          tooltip.style.left = (e.pageX + 12) + 'px';
          tooltip.style.top = (e.pageY - 28) + 'px';
        }}
        on:mousemove={(e) => {
          if (!tooltip) return;
          tooltip.style.left = (e.pageX + 12) + 'px';
          tooltip.style.top = (e.pageY - 28) + 'px';
        }}
        on:mouseleave={() => {
          if (tooltip) tooltip.style.display = 'none';
        }}
      />
    {/each}
  </svg>

  <div bind:this={tooltip} class="tooltip-internal"></div>
</div>

<style>
  .chart-wrapper {
    width: 100%;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow-x: auto;
    position: relative;
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
  }
  .tooltip-internal {
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
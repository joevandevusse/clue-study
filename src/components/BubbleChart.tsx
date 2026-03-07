import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { fetchBubbleData } from '../api/client';
import type { BubblePoint } from '../types';
import './BubbleChart.css';

interface Props {
  onExit:  () => void;
  onStudy: (topic: string) => void;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  point: BubblePoint | null;
}

function bubbleColor(accuracy: number | null): string {
  if (accuracy === null) return '#555';
  if (accuracy < 0.4)   return '#c0392b';
  if (accuracy < 0.7)   return '#d4af37';
  return '#27ae60';
}

export default function BubbleChart({ onExit, onStudy }: Props) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [data,    setData]    = useState<BubblePoint[]>([]);
  const [error,   setError]   = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, point: null });

  // Fetch data once
  useEffect(() => {
    fetchBubbleData()
      .then(setData)
      .catch(() => setError('Could not load bubble data. Is ClueApi running?'));
  }, []);

  // Draw chart whenever data or container size changes
  useEffect(() => {
    if (!data.length || !svgRef.current || !wrapRef.current) return;

    const svg  = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = wrapRef.current.getBoundingClientRect();
    const padding = { top: 40, right: 30, bottom: 60, left: 60 };

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Scales
    const maxValue = d3.max(data, (d) => d.meanValue) ?? 1000;
    const maxCount = d3.max(data, (d) => d.clueCount) ?? 1;

    const xScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([padding.left, width - padding.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height - padding.bottom, padding.top]);

    const rScale = d3.scaleSqrt()
      .domain([0, maxCount])
      .range([8, 38]);

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat((v) => `$${(v as number).toLocaleString()}`);

    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat((v) => `${Math.round((v as number) * 100)}%`);

    svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${height - padding.bottom})`)
      .call(xAxis);

    svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${padding.left},0)`)
      .call(yAxis);

    // Axis labels
    svg.append('text')
      .attr('class', 'axis-label')
      .attr('x', (padding.left + width - padding.right) / 2)
      .attr('y', height - 12)
      .attr('text-anchor', 'middle')
      .text('Mean Clue Value');

    svg.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -((padding.top + height - padding.bottom) / 2))
      .attr('y', 14)
      .attr('text-anchor', 'middle')
      .text('Accuracy');

    // Simulation nodes — clone data so D3 can mutate positions
    type SimNode = BubblePoint & d3.SimulationNodeDatum;
    const nodes: SimNode[] = data.map((d) => ({ ...d }));

    const sim = d3.forceSimulation(nodes)
      .force('x', d3.forceX<SimNode>((d) => xScale(d.meanValue)).strength(0.5))
      .force('y', d3.forceY<SimNode>((d) => yScale(d.accuracy ?? 0.5)).strength(0.5))
      .force('collide', d3.forceCollide<SimNode>((d) => rScale(d.clueCount) + 3))
      .stop();

    // Run sim synchronously (fast enough for this dataset size)
    for (let i = 0; i < 200; i++) sim.tick();

    // Circles
    const circles = svg.selectAll<SVGCircleElement, SimNode>('circle')
      .data(nodes)
      .join('circle')
      .attr('cx', (d) => d.x ?? 0)
      .attr('cy', (d) => d.y ?? 0)
      .attr('r',  (d) => rScale(d.clueCount))
      .attr('fill',   (d) => bubbleColor(d.accuracy))
      .attr('fill-opacity', 0.75)
      .attr('stroke', (d) => bubbleColor(d.accuracy))
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d) => d.accuracy === null ? '4 2' : null)
      .attr('cursor', 'pointer');

    circles
      .on('mouseover', (event: MouseEvent, d: SimNode) => {
        const rect = wrapRef.current!.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: event.clientX - rect.left + 12,
          y: event.clientY - rect.top  - 8,
          point: d,
        });
      })
      .on('mousemove', (event: MouseEvent) => {
        const rect = wrapRef.current!.getBoundingClientRect();
        setTooltip((prev) => ({
          ...prev,
          x: event.clientX - rect.left + 12,
          y: event.clientY - rect.top  - 8,
        }));
      })
      .on('mouseout', () => {
        setTooltip((prev) => ({ ...prev, visible: false }));
      })
      .on('click', (_event: MouseEvent, d: SimNode) => {
        onStudy(d.canonicalTopic);
      });

  }, [data, onStudy]);

  if (error) return <p className="error">{error}</p>;

  const { visible, x, y, point } = tooltip;

  return (
    <div className="bubble-chart">
      <div className="bubble-chart-header">
        <button className="btn-ghost" onClick={onExit}>← Back</button>
        <h2 className="bubble-chart-title">Knowledge Map</h2>
        <span />
      </div>

      <div className="bubble-svg-wrap" ref={wrapRef}>
        {data.length === 0 && (
          <p className="loading-msg">Loading…</p>
        )}
        <svg className="bubble-svg" ref={svgRef} />

        {visible && point && (
          <div
            className="bubble-tooltip"
            style={{ left: x, top: y }}
          >
            <div className="tooltip-topic">{point.canonicalTopic}</div>
            <div className="tooltip-row">
              Accuracy:{' '}
              <strong>
                {point.accuracy !== null
                  ? `${Math.round(point.accuracy * 100)}%`
                  : 'No data yet'}
              </strong>
            </div>
            <div className="tooltip-row">Attempts: <strong>{point.attemptCount}</strong></div>
            <div className="tooltip-row">Clues: <strong>{point.clueCount}</strong></div>
            <div className="tooltip-row">
              Mean value: <strong>${Math.round(point.meanValue).toLocaleString()}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

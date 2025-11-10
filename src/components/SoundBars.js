// src/components/SoundBars.jsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import StrudelCanvas from './StrudelCanvas';

const LABELS = ['Bass', 'Lead', 'Drums', 'FX'];

export default function SoundBars({ bands = [], canvasRef }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    const width = 360;
    const height = 160;
    const paddingTop = 10;
    const paddingBottom = 24;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const data = (bands.length ? bands : [0, 0, 0, 0]).map((v, i) => ({
      name: LABELS[i] ?? `Ch ${i + 1}`,
      value: Math.max(0, Math.min(1, v || 0)),
    }));

    // Clear previous content
    svg.selectAll('*').remove();

    // ---- Gradient definition: yellow (bottom) → orange (top) ----
    const defs = svg.append('defs');
    const grad = defs
      .append('linearGradient')
      .attr('id', 'warmBarGradient')
      .attr('x1', '0%')
      .attr('y1', '100%') // bottom
      .attr('x2', '0%')
      .attr('y2', '0%');  // top

    // Bottom: yellow, Top: orange
    grad.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#facc15'); // yellow

    grad.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f97316'); // orange
    // ------------------------------------------------------------

    // Background card area in SVG
    svg
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .attr('rx', 12)
      .attr('ry', 12)
      .attr('fill', '#0b0f17');

    // Scales
    const x = d3
      .scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.25);

    const y = d3
      .scaleLinear()
      .domain([0, 1])
      .range([height - paddingBottom, paddingTop]);

    const barGroup = svg.append('g');

    // Bars with warm gradient fill
    barGroup
      .selectAll('rect.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.name))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.value))
      .attr('height', d => y(0) - y(d.value))
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', 'url(#warmBarGradient)')
      .attr('opacity', d => 0.3 + d.value * 0.7); // stronger colour when bar is high

    // Optional glow “cap” on top of bars
    barGroup
      .selectAll('circle.cap')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'cap')
      .attr('cx', d => x(d.name) + x.bandwidth() / 2)
      .attr('cy', d => y(d.value))
      .attr('r', 4)
      .attr('fill', '#fed7aa'); // soft light orange

    // Labels
    const labelGroup = svg.append('g');

    labelGroup
      .selectAll('text.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.name) + x.bandwidth() / 2)
      .attr('y', height - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9cb0d2')
      .attr('font-size', 10)
      .text(d => d.name);
  }, [bands]);

  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title mb-1 text-light">Live Levels</h5>
        <p className="text-secondary small mb-2">
          Bars react to how busy your Strudel pattern is (bass / lead / drums / FX).
        </p>

        {/* D3 bar graph */}
        <svg
          ref={svgRef}
          style={{ width: '100%', height: '160px', display: 'block' }}
        />

        {/* Piano roll directly under graph, in SAME card */}
        <div className="mt-3 flex-grow-1 d-flex">
          <div className="w-100">
            <StrudelCanvas canvasRef={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

// src/components/SoundBars.jsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LABELS = ['Bass', 'Lead', 'Drums', 'FX'];

export default function SoundBars({ bands = [] }) {
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

    // Clear previous content
    svg.selectAll('*').remove();

    // Background
    svg
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .attr('rx', 12)
      .attr('ry', 12)
      .attr('fill', '#0b0f17');

    // Bars
    const barGroup = svg.append('g');

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
      .attr('fill', 'var(--accent)');

    // Value “caps” on top of bars (for a bit of flair)
    barGroup
      .selectAll('circle.cap')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'cap')
      .attr('cx', d => x(d.name) + x.bandwidth() / 2)
      .attr('cy', d => y(d.value))
      .attr('r', 4)
      .attr('fill', 'var(--success)');

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
      <div className="card-body">
        <h5 className="card-title mb-1">Live Levels</h5>
        <p className="text-secondary small mb-2">
          Bars react to how busy your Strudel pattern is (bass / lead / drums / FX).
        </p>
        <svg ref={svgRef} style={{ width: '100%', height: '160px', display: 'block' }} />
      </div>
    </div>
  );
}

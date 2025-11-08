// src/components/TempoGraph.jsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function TempoGraph({ data }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    const width = 420;
    const height = 200;

    svg.attr("viewBox", `0 0 ${width} ${height}`);
    svg.selectAll("*").remove();

    const margin = { top: 10, right: 10, bottom: 20, left: 30 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // use safe data
    const safeData = data?.length ? data : [120];

    // x scale (each bar)
    const x = d3
      .scaleBand()
      .domain(safeData.map((_, i) => i))
      .range([0, innerW])
      .padding(0.15);

    // y scale (tempo height)
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(safeData) || 200])
      .nice()
      .range([innerH, 0]);

    // Draw bars
    g.selectAll("rect")
      .data(safeData)
      .enter()
      .append("rect")
      .attr("x", (_, i) => x(i))
      .attr("y", (d) => y(d))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerH - y(d))
      .attr("fill", "var(--accent)") // matches your theme
      .attr("opacity", 0.85);

    // y axis (tempo)
    const yAxis = d3.axisLeft(y).ticks(4);

    g.append("g").call(yAxis);

    // x axis (no labels — just ticks for spacing)
    const xAxis = d3.axisBottom(x).ticks(5).tickFormat(() => "");

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(xAxis);
  }, [data]);

  return (
    <div className="card h-100">
      <div className="card-body">
        <h5 className="card-title mb-2">Tempo History (Bar Graph)</h5>
        <p className="text-secondary small mb-2">
          Shows the last tempo values (up to 100 samples).
        </p>
        <svg
          ref={svgRef}
          style={{ width: "100%", minHeight: "200px", display: "block" }}
        />
      </div>
    </div>
  );
}

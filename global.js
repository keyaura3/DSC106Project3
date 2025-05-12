import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

d3.json('./Data/temp_avg_combined.json').then(data => {
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const parseTime = d3.utcParse("%Y-%m-%dT%H:%M:%S.%L");

    data.forEach(d => {
        d.Time = parseTime(d.Time);
        d.Temperature = +d.Temperature;
    });

    const sexes = Array.from(new Set(data.map(d => d.Sex)));

    const svg = d3.select("#lineplot")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.Time))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.Temperature), d3.max(data, d => d.Temperature)])
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(sexes)
        .range(["#e377c2", "#1f77b4"]);

    const line = d3.line()
        .x(d => x(d.Time))
        .y(d => y(d.Temperature));

    sexes.forEach(sex => {
        const filtered = data.filter(d => d.Sex === sex);

        svg.append("path")
            .datum(filtered)
            .attr("fill", "none")
            .attr("stroke", color(sex))
            .attr("stroke-width", 1.5)
            .attr("d", line);
    });

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    //labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Time");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("Mean Temperature (°C)");

    //legend
    sexes.forEach((sex, i) => {
        svg.append("circle")
            .attr("cx", width - 90)
            .attr("cy", 10 + i * 20)
            .attr("r", 5)
            .attr("fill", color(sex));
        svg.append("text")
            .attr("x", width - 70)
            .attr("y", 15 + i * 20)
            .text(sex)
            .attr("alignment-baseline", "middle");
    });
});

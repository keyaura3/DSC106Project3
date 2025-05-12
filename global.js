import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const parseTime = d3.utcParse("%Y-%m-%dT%H:%M:%S.%L");

d3.json('./Data/all_mice_data.json').then(data => {
    data.forEach(d => {
        d.Time = parseTime(d.Time);
        d.Temperature = +d.Temperature;
    });
    const width = 900, height =500,margin={top:40, right:150, bottom:60,left:60};
    const svg =d3.select("#lineplot")
        .attr("width", width + margin.left+margin.right)
        .attr("height",height + margin.top+margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().range([0,width]);
    const y =d3.scaleLinear().range([height,0]);

    svg.append("g").attr("class","x-axis").attr("transform",`translate(0,${height})`);
    svg.append("g").attr("class","y-axis");

    const color = d3.scaleOrdinal(d3.schemeSet1);

    //dropdown
    const femIDs = Array.from(new Set(data.filter(d => d.Sex === "Female").map(d => d.Mouse))).sort();
    const maleIDs = Array.from(new Set(data.filter(d => d.Sex === "Male").map(d => d.Mouse))).sort();

    femIDs.forEach(id => {
        d3.select("#femaleMouse").append("option").attr("value", id).text(id);
    });
    maleIDs.forEach(id => {
        d3.select("#maleMouse").append("option").attr("value", id).text(id);
    });

    d3.selectAll("select").on("change", updateChart);

    //updating chart when mouse # is selected
    function updateChart() {
        const selectedFemale =d3.select("#femaleMouse").property("value");
        const selectedMale =d3.select("#maleMouse").property("value");

        let plotData = [];

        if (selectedFemale) {
            plotData.push({ id: selectedFemale, values: data.filter(d => d.Mouse === selectedFemale) });
        } else {
            const femAvg =d3.groups(data.filter(d=> d.Sex==="Female"), d=> +d.Time)
                .map(([time,entries]) =>({ Time:entries[0].Time, Temperature: d3.mean(entries, d=>d.Temperature)}));
            plotData.push({id:"Female (Mean)", values:femAvg});
        }

        if (selectedMale) {
            plotData.push({ id:selectedMale, values:data.filter(d => d.Mouse ===selectedMale)});
        } else {
            const maleAvg = d3.groups(data.filter(d => d.Sex === "Male"), d => +d.Time)
                .map(([time, entries]) => ({ Time: entries[0].Time, Temperature: d3.mean(entries, d =>d.Temperature) }));
            plotData.push({ id: "Male (Mean)", values: maleAvg });
        }

        x.domain(d3.extent(data, d=>d.Time));
        y.domain(d3.extent(data, d => d.Temperature));

        svg.select(".x-axis").call(d3.axisBottom(x));
        svg.select(".y-axis").call(d3.axisLeft(y));

        svg.selectAll(".line").remove();
        svg.selectAll(".legend").remove();

        const line = d3.line().x(d => x(d.Time)).y(d =>y(d.Temperature));

        svg.selectAll(".line")
            .data(plotData)
            .enter()
            .append("path")
            .attr("class","line")
            .attr("fill","none")
            .attr("stroke", d=>color(d.id))
            .attr("stroke-width",1.5)
            .attr("d", d=>line(d.values));

        //legend
        plotData.forEach((d, i)=>{
            svg.append("circle")
                .attr("class", "legend")
                .attr("cx", width+20)
                .attr("cy", 20+ i*20)
                .attr("r",5)
                .attr("fill",color(d.id));

            svg.append("text")
                .attr("class","legend")
                .attr("x",width +30)
                .attr("y", 25 +i*20)
                .text(d.id)
                .attr("alignment-baseline","middle");
        });
    }

    updateChart(); 
});

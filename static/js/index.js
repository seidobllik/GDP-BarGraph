const dataURL =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
const graphW = 800;
const graphH = 400;
const padding = 40;

const req = new XMLHttpRequest();
req.open("GET", dataURL, true);
req.send();
req.onload = function () {
  const json = JSON.parse(req.responseText);
  document.getElementById("title").innerText = json.name;
  document.getElementById("date-range").innerText =
    json.from_date + " to " + json.to_date;
  document.getElementById("description").innerText = json.description;

  //const dataset = json.data;
  const dataset = [];
  json.data.forEach((item) => {
    const year = item[0].substring(0, 4);
    const month = item[0].substring(5, 7);
    let quarter =
      month === "01"
        ? "Q1"
        : month === "04"
        ? "Q2"
        : month === "07"
        ? "Q3"
        : "Q4";

    dataset.push({
      rawDate: item[0],
      value: item[1],
      year: year,
      quarter: quarter,
      date: new Date(item[0])
    });
  });
  const minDate = d3.min(dataset.map((item) => item.date));
  const maxDate = d3.max(dataset.map((item) => item.date));
  const xScale = d3
    .scaleTime()
    .domain([minDate, maxDate])
    .range([padding, graphW]);
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.value)])
    .range([graphH - padding, padding]);
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);
  const svg = d3
    .select("#graph")
    .append("svg")
    .attr("width", graphW)
    .attr("height", graphH);

  d3.select("#graph").append("div").attr("id", "tooltip").style("opacity", 0);

  svg
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", (d, i) => xScale(d.date))
    .attr("y", (d, i) => yScale(d.value))
    .attr("width", graphW / dataset.length)
    .attr("height", (d, i) => graphH - padding - yScale(d.value))
    .attr("id", (d, i) => "bar-" + i)
    .attr("class", "bar")
    .attr("data-date", (d, i) => d.rawDate)
    .attr("data-gdp", (d, i) => d.value)
    .on("mouseover", (d, i) => {
      d3.select("#tooltip")
        .attr("data-date", d.rawDate)
        .html(
          "<p>" +
            d.year +
            " " +
            d.quarter +
            "</p><p>$" +
            d.value +
            " Billion</p>"
        )
        .style("opacity", 0.8)
        .style("top", graphH - 100 + "px")
        .style("left", i * (graphW / dataset.length) + 30 + "px");
    })
    .on("mouseout", (d, i) => {
      d3.select("#tooltip").style("opacity", 0);
    });

  svg
    .append("g")
    .attr("transform", "translate(0, " + (graphH - padding) + ")")
    .attr("id", "x-axis")
    .call(xAxis);

  svg
    .append("g")
    .attr("transform", "translate(" + padding + ", 0)")
    .attr("id", "y-axis")
    .call(yAxis);
};

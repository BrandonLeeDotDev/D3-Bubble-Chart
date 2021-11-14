const nodes_to_create = 65;

const axisXmaxLen = 1300;

const axisYmaxLen = 90;
const axisYminlen = 35;

const radiusMax = 36;
const radiusMin = 3;

const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50
  },
  width = 550 - margin.left - margin.right,
  height = 460 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear()
  .domain([0, axisXmaxLen])
  .range([0, width]);

svg.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x));

const y = d3.scaleLinear()
  .domain([axisYminlen, axisYmaxLen])
  .range([height, 0]);

svg.append("g")
  .call(d3.axisLeft(y));

const z = d3.scaleLinear()
  .domain([0, 100])
  .range([radiusMin, radiusMax]);

const color = d3.scaleLinear()
  .domain([0, 2, 3])
  .range(["green", "orange", "red"]);

const tooltip = d3.select("#tooltip")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "black")
  .style("border-radius", "5px")
  .style("padding", "10px")
  .style("color", "white")
  .style("width", "max-content")
  .style("position", "relative");

const moveTooltip = (event) => {
  tooltip
    .style("left", (event.pageX) + 25 + "px")
    .style("top", (event.pageY - width + 7) + "px");
}

const hideTooltip = (event) => {
  tooltip
    .transition()
    .duration(200)
    .style("opacity", 0);
}

const showTooltip = (event, node) => {
  tooltip
    .transition()
    .duration(200);

  tooltip
    .style("opacity", 1)
    .html("Info: " + node.name)
    .style("left", (event.pageX) + 25 + "px")
    .style("top", (event.pageY - width + 7) + "px");
}

var nodes = [];

var links = [];

function render() {
  d3.selectAll('.nodes').remove();
  d3.selectAll('.lines').remove();
  d3.selectAll('.y_label').remove();
  d3.selectAll('.x_label').remove();

  const lines = svg
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr("class", "lines");

  const circles = svg
    .selectAll('circle')
    .data(nodes)
    .enter()
    .append('circle')
    .attr("class", "nodes")
    .style("fill", node => color(node.x_axis / node.y_axis))
    .attr('r', node => node.radius)
    .attr("cx", node => node.x_axis)
    .attr("cy", node => node.y_axis)
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseleave", hideTooltip)
    .call(d3.drag().on("start", started));

  const simulation = d3.forceSimulation(nodes)
    .force('x', d3.forceX(node => node.x_axis).strength(0.2))
    .force('y', d3.forceY(node => node.y_axis).strength(0.2));

  function started(event) {
    const circle = d3.select(this).classed("dragging", true);

    event.on("drag", dragged).on("end", ended);

    function dragged(event, node) {
      simulation.force(
          'link',
          d3.forceLink(links).strength(1).distance(100)
        ).alpha(.4)
        .force('x', d3.forceX(node.x_axis).strength(0))
        .force('y', d3.forceY(node.y_axis).strength(0));

      circle.raise().attr("cx", node.x = event.x).attr("cy", node.y = event.y);
    }

    function ended() {
      simulation
        .force('x', d3.forceX(node => node.x_axis).strength(1))
        .force('y', d3.forceY(node => node.y_axis).strength(1));

      circle.classed("dragging", false);
    }
  }

  simulation.on('tick', () => {
    circles.attr('cx', node => node.x).attr('cy', node => node.y);

    lines
      .attr('x1', link => link.source.x)
      .attr('y1', link => link.source.y)
      .attr('x2', link => link.target.x)
      .attr('y2', link => link.target.y);
  });

  svg.append("text")
    .attr("class", "y_label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("axisY Label (numbers)")
    .attr("font-size", 13);

  svg.append("text")
    .attr("class", "x_label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("axisX Label (larger numebrs)")
    .attr("font-size", 13);

}

const xBuffer =  120;

const yBuffer = 40;

function randSize() {
  return Math.floor(Math.random() * (Math.floor(100) - Math.ceil(0)) + Math.ceil(0));
}

function randX() {
  return Math.floor(Math.random() * (Math.floor(axisXmaxLen - 200) - Math.ceil(xBuffer)) + Math.ceil(xBuffer));
}

function randY() {
  return Math.floor(Math.random() * (Math.floor(axisYmaxLen - 5) - Math.ceil(radiusMax + 10)) + Math.ceil(radiusMax + 10));
}

let first_iteration_complete = false;

function build_modify_JSON() {
  if (!first_iteration_complete) {
    for (let i = 0; i < nodes_to_create; i++) {
      const things = ['Impressive Stat', 'Im a Bubble!', 'Certainly', "Yep!", "Metric", "Wordzz"];

      const thing = things[Math.floor(Math.random() * things.length)];

      if (i % 2 == 0) {
        nodes.push({
          id: "node" + i,
          name: thing,
          x_axis: x(randX()),
          y_axis: y(randY()),
          radius: z(randSize())
        });
      } else {

        nodes.push({
          id: "node" + i,
          name: thing,
          x_axis: x(i * ((axisXmaxLen - (xBuffer + (radiusMax - radiusMin) / 2)) / nodes_to_create) + xBuffer + (randSize() / 10)),
          y_axis: y(i * ((axisYmaxLen - (axisYminlen + (radiusMax - radiusMin) / 2)) / nodes_to_create) + yBuffer + (randSize() / 10)),
          radius: z(randSize())
        });
      }
    }

    for (let i = 0; i < nodes_to_create - 1; i++) {
      links.push({
        source: nodes[i],
        target: nodes[i + 1]
      })
    }

    first_iteration_complete = true;
  } else {
    for (let i = 0; i < nodes_to_create; i++) {
      nodes[i].radius = z(randSize());
    }
  }

  render();
}

build_modify_JSON();

setInterval(function() {
  build_modify_JSON();
}, 3000);

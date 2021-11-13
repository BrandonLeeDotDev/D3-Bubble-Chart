  const margin = {
      top: 10,
      right: 20,
      bottom: 30,
      left: 50
    },
    width = 560 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

  const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, 1300])
    .range([0, width - 20]);

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  const y = d3.scaleLinear()
    .domain([35, 90])
    .range([height, 0]);

  svg.append("g")
    .call(d3.axisLeft(y));

  const z = d3.scaleLinear()
    .domain([10, 100])
    .range([10, 40]);

  const tooltip = d3.select("#my_tool")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("color", "white")
    .style("width", "max-content")
    .style("position", "relative")

  const moveTooltip = (event, d) => {
    tooltip
      .style("left", (event.pageX) + 25 + "px")
      .style("top", (event.pageY - width) + 25 + "px");
  }

  const hideTooltip = (event, d) => {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }

  const showTooltip = (event, d) => {
    tooltip
      .transition()
      .duration(200);

    tooltip
      .style("opacity", 1)
      .html("Info: " + d.name)
      .style("left", (event.pageX) + 20 + "px")
      .style("top", (event.pageY - width + 20) + "px");
  }

  var color = d3.scaleLinear()
    .domain([0, 1, 3])
    .range(["green", "orange", "red"]);

  var nodes = [];

  var links = [];

  function render() {
    d3.selectAll('.nodes').remove();
    d3.selectAll('.lines').remove();

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
      .style("fill", d => color(d.x_axis / d.y_axis))
      .attr('r', (node) => node.radius)
      .attr("cx", (node) => node.x_axis)
      .attr("cy", (node) => node.y_axis)
      .on("mouseover", showTooltip)
      .on("mousemove", moveTooltip)
      .on("mouseleave", hideTooltip)
      .call(d3.drag().on("start", started));

    const simulation = d3.forceSimulation(nodes)
      .force('x', d3.forceX(d => d.x_axis).strength(0.09))
      .force('y', d3.forceY(d => d.y_axis).strength(0.09)).alpha(1);

    function started(event) {
      const circle = d3.select(this).classed("dragging", true);

      event.on("drag", dragged).on("end", ended);

      function dragged(event, d) {
        simulation.force(
          'link',
          d3.forceLink(links).strength(1).distance(100)
        ).alpha(.5);
        circle.raise().attr("cx", d.x = event.x).attr("cy", d.y = event.y);
      }

      function ended(event, d) {
        simulation
          .force('x', d3.forceX(d => d.x_axis).strength(1))
          .force('y', d3.forceY(d => d.y_axis).strength(1))
        circle.classed("dragging", false)
      }
    }

    simulation.on('tick', () => {
      circles.attr('cx', (node) => node.x).attr('cy', (node) => node.y);

      lines
        .attr('x1', (link) => link.source.x)
        .attr('y1', (link) => link.source.y)
        .attr('x2', (link) => link.target.x)
        .attr('y2', (link) => link.target.y);
    });
  }

  function randSize() {
    return Math.floor(Math.random() * (Math.floor(95) - Math.ceil(4)) + Math.ceil(4));
  }

  function randX() {
    return Math.floor(Math.random() * (Math.floor(1100) - Math.ceil(130)) + Math.ceil(130));
  }

  function randY() {
    return Math.floor(Math.random() * (Math.floor(77) - Math.ceil(47)) + Math.ceil(47));
  }

  var first_iteration_complete = false;

  let iteration_count = 35;

  function run() {
    if (!first_iteration_complete) {
      for (let i = 0; i < iteration_count; i++) {
        var things = ['Impressive Stat', 'Im a Bubble!', 'Certainly', "Yep!", "Metric", "Wordzz"];

        var thing = things[Math.floor(Math.random() * things.length)];

        if (i % 3 == 0) {
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
            x_axis: x((i * 32 + 120 + (randSize() / 10))),
            y_axis: y(((i + (iteration_count / 30)) + 36) + (randSize() / 5)),
            radius: z(randSize())
          });
        }
      }

      for (let i = 0; i < iteration_count; i++) {
        if (i == iteration_count - 1) {
          break;
        }
        links.push({
          source: nodes[i],
          target: nodes[i + 1]
        })
      }

      first_iteration_complete = true;
    } else {
      for (let i = 0; i < iteration_count; i++) {
        nodes[i].radius = z(randSize());
      }
    }

    render();
  }

  run();

  setInterval(function() {
    run();
  }, 3000);

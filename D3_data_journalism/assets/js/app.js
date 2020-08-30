// @TODO: YOUR CODE HERE!
// SVG wrapper dimensions are determined by the current width and height of the browser window.

// var svgWidth = window.innerWidth  //850;
// var svgHeight = window.innerHeight  //500;

// This is the dimension of the plot container: width and height 
const svgWidth = window.innerWidth,
        svgHeight = window.innerHeight,
        margin = {
            top: 10, 
            right: 40, 
            bottom:200, 
            left: 100
        };  

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create the SVG element with its dimensions
const svg = d3.select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

// Chart group element
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Selected x-axis and y-axis
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function to update x-scale selection on x-axis label
function xScale(stateData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.9645,
      d3.max(stateData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;
}

// Function to update y-scale selection on y-axis label
function yScale(stateData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d =>d[chosenYAxis]) * 0.7,
      d3.max(stateData, d => d[chosenYAxis]) * 1.1
    ])
    .range([height, 0]);

  return yLinearScale;
}

// Update the x-axis
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Update the y-axis
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// Update the circles group
function renderCircles(circlesGroup, circleText, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  circleText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// Updating circles group new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "age") {
    var label = "Median Age:";
  }
  else if (chosenXAxis === "poverty") {
    var label = "Poverty (%):"
  }
  else {
    var label = "Median Income:";
  }
  if (chosenYAxis === "healthcare") {
    var yLabel = "Lacks Healthcare (%):";
  }
  else if (chosenYAxis === "smokes") {
    var yLabel = "Smokers (%):";
  }
  else {
    var yLabel = "Obese (%):";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup
    // Mouseover event
    .on("mouseover", toolTip.show)
    // Mouseout event
    .on("mouseout", toolTip.hide);

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(stateData, err) {
    if (err) throw err;
  console.log(stateData);

  // Parse the data
  stateData.forEach(function(data) {
    data.abbr = data.abbr;
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });
  console.log(stateData);

  // xLinearScale function above csv import
  var xLinearScale = xScale(stateData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(stateData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  var circleTextGroup = chartGroup.append("g");

  // append initial circles
  var circlesGroup = circleTextGroup.selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 13)
    .classed("stateCircle", true)
    .attr("opacity", ".5");

  var circleText = circleTextGroup.selectAll("text")
    .data(stateData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]) + 4)
    .text(d => d.abbr)
    .attr("font-size", "12px")
    .attr("stroke", "white")
    .attr("text-anchor", "middle");

  console.log(chartGroup);

  // Create group for x- axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") 
    .classed("active", true)
    .text("In Poverty (%)");

    var medianAgeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") 
    .classed("inactive", true)
    .text("Age (Median)");

  var medianIncomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") 
    .classed("inactive", true)
    .text("Household Income (Median)");


  // Create group for y- axis labels
  var yLabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height})`)
  .attr("transform", "rotate(-90)");

  var healthcareLabel = yLabelsGroup.append("text")
    .attr("y", 0 - (0.5 * margin.left))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare") 
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokersLabel = yLabelsGroup.append("text")
    .attr("y", 0 - (0.75 * margin.left))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes") 
    .classed("inactive", true)
    .text("Smokers (%)");

  var obeseLabel = yLabelsGroup.append("text")
    .attr("y", 0 - (1.00 * margin.left))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity") 
    .classed("inactive", true)
    .text("Obese (%)");

  // UpdateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // Event listener for x-axis
  xLabelsGroup.selectAll("text")
    .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            chosenXAxis = value;
            xLinearScale = xScale(stateData, chosenXAxis);
            xAxis = renderAxes(xLinearScale, xAxis);
            circlesGroup = renderCircles(circlesGroup, circleText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // Change the selection x-axis selection bold text
        if (chosenXAxis === "poverty") {
            povertyLabel.classed("active", true).classed("inactive", false);
            medianAgeLabel.classed("active", false).classed("inactive", true);
            medianIncomeLabel.classed("active", false).classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
            medianAgeLabel.classed("active", true).classed("inactive", false);
            povertyLabel.classed("active", false).classed("inactive", true);
            medianIncomeLabel.classed("active", false).classed("inactive", true);
        }
        else {
            medianIncomeLabel.classed("active", true).classed("inactive", false);
            povertyLabel.classed("active", false).classed("inactive", true);
            medianAgeLabel.classed("active", false).classed("inactive", true);
        }
    }
    });

    // Event listener for the y-axis
    yLabelsGroup.selectAll("text")
        .on("click", function() {
            // Value of y-axis selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                chosenYAxis = value;
                yLinearScale = yScale(stateData, chosenYAxis);
                yAxis = renderYAxis(yLinearScale, yAxis);
                circlesGroup = renderCircles(circlesGroup, circleText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
                healthcareLabel.classed("active", true).classed("inactive", false);
                smokersLabel.classed("active", false).classed("inactive", true);
                obeseLabel.classed("active", false).classed("inactive", true);
            }
            else if (chosenYAxis === "smokes") {
                healthcareLabel.classed("active", false).classed("inactive", true);
                smokersLabel.classed("active", true).classed("inactive", false);
                obeseLabel.classed("active", false).classed("inactive", true);
            }
            else {
                healthcareLabel.classed("active", false).classed("inactive", true);
                smokersLabel.classed("active", false).classed("inactive", true);
                obeseLabel.classed("active", true).classed("inactive", false);
            }
        }
    });
}).catch(function (error) {
    console.log(error);
});
  

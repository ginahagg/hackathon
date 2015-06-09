$(function(){
  
    function drawNewbornChart(){
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.ordinal()
        .range(["#98abc5", "red","#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00", "yellow", "green", "magenta", "steelblue"]);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    var svg = d3.select("chart1").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var diseaseNames = [
    "Other disorders",
    "Primary Congenital Hypothyroidism",
    "Sickle C Disease (Hb S/C Disease)",
    "Sickle Cell Anemia (Hb S/S disease)",
    "Cystic Fibrosis",
    "Hb S/Beta + thalassemia",
    "CAH –Congenital Adrenal Hyperplasia - Classical Salt Wasting",
    "Phenylketonuria (PKU)"];

    var races = ["American Indian","Asian Indian","Black","Chin/Jap/Korean","Hispanic",
      "Middle Eastern","Multiple","Other","White","Unknown"];

    d3.csv("newborn_disorders_by_race-2.csv", function(error, data) {
      //var ageNames = d3.keys(data[0]).filter(function(key) { return key !== "State"; });
      var ageNames = d3.keys(data[0]).filter(function(key) { return key !== "Race"; });

      data.forEach(function(d) {
        d.ages = ageNames.map(function(name) { return {name: name, value: +d[name]}; });
      });

      //x0.domain(data.map(function(d) { return d.State; }));
      //x0.domain(data.map(function(d) { return d.Year; }));
      x0.domain(races.map(function(d) { return d; }));
      x1.domain(diseaseNames).rangeRoundBands([0, x0.rangeBand()]);
      y.domain([0, d3.max(data, function(d) { return d3.max(d.ages, function(d) { return d.value; }); })]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("per hundred thousand");

      //var state = svg.selectAll(".state")
      var state = svg.selectAll(".race")
          .data(data)
        .enter().append("g")
          .attr("class", "g")
          //.attr("transform", function(d) { return "translate(" + x0(d.State) + ",0)"; });
          .attr("transform", function(d) { return "translate(" + x0(d.Race) + ",0)"; });


      state.selectAll("rect")
          .data(function(d) { return d.ages; })
        .enter().append("rect")
          .attr("width", x1.rangeBand())
          .attr("x", function(d) { return x1(d.name); })
          .attr("y", function(d) { return y(d.value); })
          .attr("height", function(d) { return height - y(d.value); })
          .style("fill", function(d) { return color(d.name); });

      var legend = svg.selectAll(".legend")
          .data(ageNames.slice().reverse())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d; });

    });
}
 

//Generate some nice data.
function exampleData() {
  return stream_layers(3,10+Math.random()*100,.1).map(function(data, i) {
    return {
      key: 'Stream #' + i,
      values: data
    };
  });
}

        PjaxApp.onResize(drawSparkLines);


        // Notification link click handler.
        // JUST FOR DEMO.
        // Can be removed.

        function close(e){
            var $settings = $("#settings"),
                $popover = $settings.siblings(".popover");
            if(!$.contains($popover[0], e.target)){
                $settings.popover('hide');
                $(document).off("click", close);
            }
        }
        $("#notification-link").click(function(){
            if ( $(window).width() > 767){
                $("#settings").popover('show');
                $(document).on("click", close);
                return false;
            }
        });

        $("#feed").slimscroll({
            height: 'auto',
            size: '5px',
            alwaysVisible: true,
            railVisible: true
        });

        $("#chat-messages").slimscroll({
            height: '240px',
            size: '5px',
            alwaysVisible: true,
            railVisible: true
        });

        $('.widget').widgster();
        drawNewbornChart();
    

    
    
    PjaxApp.onPageLoad(drawNewbornChart);
});


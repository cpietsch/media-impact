var RadarChart = {
  g: null,
  draw: function(id, d, options){
    var self = this;
    var cfg = {
     radius: 5,
     w :200, 
     h: 200, 
     factor: 1, 
     factorLegend:.85,
     total: 4,
     levels: 1,
     maxValue: 1000,
     radians: 2 * Math.PI, 
     minDistance : 50,
     opacityArea: 0.9
   }
    if(options != undefined){
      for(var i in options){
        cfg[i] = options[i];
      }
    }
    cfg.maxValue = d3.max(d, function(i){return Math.max.apply(Math,i.map(function(o){return o.value;}))});
    var allAxis = (d[0].map(function(i, j){return i.axis}));
    total = allAxis.length;
    var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
    d3.select(id).select("svg").remove();
    var g = d3.select(id).append("svg").attr("width", cfg.w).attr("height", cfg.h).append("g");

    for(var j=0; j<cfg.levels; j++){
      var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
      g.selectAll(".levels").data(allAxis).enter().append("svg:line")
       .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
       .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
       .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
       .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
       .attr("class", "line").style("stroke", "grey").style("stroke-width", "0.5px").attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");;

    }

    var color = d3.scale.category10();

    series = 0;

    var axis = g.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");

    axis.append("line")
        .attr("x1", cfg.w/2)
        .attr("y1", cfg.h/2)
        .attr("x2", function(j, i){return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
        .attr("y2", function(j, i){return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
        .attr("class", "line").style("stroke", "grey").style("stroke-width", "0.5px");

    axis.append("text").attr("class", "legend")
        .text(function(d){return d}).style("font-family", "Courier New").style("font-size", "10px").style("background-color", "white").attr("transform", function(d, i){return "translate(-25, 5)"})
        .attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))+15*Math.sin(i*cfg.radians/total);})
        .attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))+10*Math.cos(i*cfg.radians/total);});

 
    for(x in d){
      dataValues = [];
      y = d[x];
      d3.select(id+" g").selectAll(".nodes")
        .data(y, function(j, i){
          dataValues.push([
            cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)), 
            cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
          ]);
        });
      dataValues.push(dataValues[0]);
      g.select(id+" g").selectAll(".area")
                     .data([dataValues])
                     .enter()
                     .append("polygon")
                     .attr("class", "black")
                     .style("stroke-width", "2px")
					 .style("stroke-linejoin", "round")
                     .style("stroke", "#9B7757")
                     .attr("points",function(d) {
                         var str="";
                         for(var pti=0;pti<d.length;pti++){
                             str=str+d[pti][0]+","+d[pti][1]+" ";
                         }
                         return str;
                      })
                     .style("fill", function(j, i){return "#9B7757"})
                     .style("fill-opacity", cfg.opacityArea)
                     
      series++;
    }
    series=0;


    for(x in d){
      y = d[x];
      

      series++;
    }
    //Tooltip
    tooltip = g.append('text').style('opacity', 0).style('font-family', 'Courier New').style('font-size', 15).style('background-color', '#f00');
  }
}



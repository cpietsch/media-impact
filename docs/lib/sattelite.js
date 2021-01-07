// oh boy,... need to write propper code.... next time, i swear!


var width = window.innerWidth,
    height = 800;

var poi = [52.50,13.38];

// var projection = clippedSatellite()
//     .distance(1.1)
//     .scale(8000)
//     .rotate([76.00, -34.50, -22.12])
//     .center([-4, 8])
//     .tilt(40)
//     .clipExtent([[0, 0], [width, height]])
//     .precision(.1);

var projection = d3.geo.satellite()
    .distance(1.1)
    .scale(4500)
    .rotate([76.00, -34.50, -22.12])
    //.center([-4, 7])
    .center([-4, 7])
    .tilt(20)
    .clipAngle(Math.acos(1 / 1.1) * 180 / Math.PI + 1e-6)
    .clipExtent([[0, 0], [width, height]])
    .precision(.1);

function mapTo(poi,mass,impact){
  projection.rotate([poi[1]*-1, (poi[0]-7)*-1, 32.12]);
  impactCircle.angle(impact);
  massCircle.angle(mass);

  svg.selectAll('path.circle').remove();
  
  if(mass>impact){
    svg.append("path")
      .datum(massCircle(poi[1],poi[0]))
      .attr("class", "circle")
      .attr("id", "mass")
      .attr("d", path);

    svg.append("path")
    .datum(impactCircle(poi[1],poi[0]))
    .attr("id", "impact")
    .attr("class", "circle")
    .attr("d", path);

  } else {


    svg.append("path")
    .datum(impactCircle(poi[1],poi[0]))
    .attr("id", "impact")
    .attr("class", "circle")
    .attr("d", path);


        svg.append("path")
      .datum(massCircle(poi[1],poi[0]))
      .attr("class", "circle")
      .attr("id", "mass")
      .attr("d", path);

  }
  
  


  svg.selectAll('path').attr("d", path);
}

var graticule = d3.geo.graticule()
    //.extent([[poi[1]*-1, poi[0]*-1], [poi[1] + 1e-6, poi[0] + 1e-6]])
    .step([3, 3]);

var xz = d3.range(-180, 181, 30),
    yz = d3.range(-60, 61, 30),
    impactCircle = d3.geo.circle().angle(1).origin(function(x, y) { return [x, y]; }),
    massCircle = d3.geo.circle().angle(1).origin(function(x, y) { return [x, y]; })

var fill = d3.scale.log()
    .domain([10, 500])
    .range(["brown", "grey"]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select($("#sattelite")[0]).append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

svg.append("path")
    .datum(impactCircle(poi[1],poi[0]))
    .attr("id", "impact")
    .attr("class", "circle")
    .attr("d", path);

svg.append("path")
    .datum(massCircle(poi[1],poi[0]))
    .attr("class", "circle")
    .attr("id", "mass")
    .attr("d", path);

// svg.append("path")
//       .datum(circle(poi[1],poi[0]))
//       .attr("d", path.pointRadius(10));


d3.json("data/world-50m.json", function(error, world) {
  svg.append("path")
      .datum(topojson.feature(world, {type: "GeometryCollection", geometries: world.objects.countries.geometries/*.filter(function(d) { return d.id == 840 || d.id == 124; })*/}))
      .attr("class", "countries")
      .attr("d", path);
  // svg.append("g")
  //     .selectAll("path")
  //     .data(topojson.object(world, world.objects.countries).geometries)
  //     .enter().append("path")
  //     .attr("d", path)
  //     .attr("class", "countries")

});

//d3.select(self.frameElement).style("height", height + "px");

function clippedSatellite() {
  var projection = d3.geo.satellite();

  var clipAngle = projection.clipAngle,
      distance = projection.distance,
      degrees = 180 / Math.PI,
      radians = Math.PI / 180,
      tilt = projection.tilt,
      projectionStream = projection.stream,
      rotate = [0, 0, 0],
      rotation = d3.geo.rotation(rotate),
      tiltRotate,
      alpha;

  // Special projection instance for additional clipping.
  var clip = d3.geo.projection(function(λ, φ) {
    return [λ, -φ];
  }).scale(degrees).translate([0, 0]);

  delete projection.clipAngle;

  projection.distance = function(_) {
    if (!arguments.length) return distance.call(projection);
    distance.call(projection, _);
    clipAngle.call(projection, Math.acos(1 / +_) * degrees - 1e-6);
    return projection;
  };

  projection.rotate = function(_) {
    if (!arguments.length) return rotate;
    rotation = d3.geo.rotation(rotate = [+_[0], +_[1], _.length > 2 && +_[2]]);
    return projection;
  };

  projection.tilt = function(angle) {
    if (!arguments.length) return tilt.call(projection);
    tilt.call(projection, angle);
    alpha = Math.acos(projection.distance() * Math.cos(angle * radians) * .99) * degrees;
    clip.clipAngle(180 - alpha).rotate([0, 180 + angle]);
    tiltRotate = d3.geo.rotation([0, 180 + projection.tilt()]);
    return projection;
  };

  projection.stream =  function(stream) {
    var pstream = projectionStream.call(projection, stream),
        circle = d3.geo.circle().angle(clipAngle.call(projection) - 1e-6),
        clipStream = alpha ? clip.stream({
          point: function(λ, φ) {
            var point = tiltRotate.invert([λ, φ]);
            pstream.point(point[0], point[1]);
          },
          lineStart: function() { pstream.lineStart(); },
          lineEnd: function() { pstream.lineEnd(); },
          polygonStart: function() { pstream.polygonStart(); },
          polygonEnd: function() { pstream.polygonEnd(); }
        }) : pstream;
    return {
      point: function(λ, φ) {
        var point = rotation([λ, φ]);
        clipStream.point(point[0], point[1]);
      },
      lineStart: function() { clipStream.lineStart(); },
      lineEnd: function() { clipStream.lineEnd(); },
      polygonStart: function() { clipStream.polygonStart(); },
      polygonEnd: function() { clipStream.polygonEnd(); },
      sphere: function() {
        d3.geo.stream(circle(), clipStream);
      }
    };
  };

  return projection.distance(projection.distance());
}
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
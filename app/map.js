var MapView = Backbone.View.extend({

  id: 'page',
  tagName: 'div',
  events: {
    'submit #nav': 'update_args'
  },

  initialize: function(opts) {
    if (opts) {
      this.center = opts.center;
      this.zoom = opts.zoom;
      this.container = opts.container;
    }
  },

  update_args: function(e) {
    e.preventDefault();
    if (this.flightPath) {
      this.flightPath.setMap(null);
    }
    var src = e.target[0].value,
        dest = e.target[1].value,
        speed = parseFloat(e.target[2].value, 10),
        interval = parseFloat(e.target[3].value, 10);

    src = src.split(',');
    dest = dest.split(',');
    src = {
      lat:  parseFloat(src[0]),
      lng:  parseFloat(src[1])
    };
    dest = {
      lat:  parseFloat(dest[0]),
      lng:  parseFloat(dest[1])
    };

    var flightPathCoords = [
      new google.maps.LatLng(src.lat, src.lng),
      new google.maps.LatLng(dest.lat, dest.lng)
    ];
    var points = this.get_points(
        flightPathCoords[0], flightPathCoords[1], speed, interval);
    this.flightPath = new google.maps.Polyline({
      path: points,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    _.each(points, function(point) {
      new google.maps.Marker({
          position: point,
          map: this.g_map,
          tooltip: 'Interval'
      });
    }, this);
    this.flightPath.setMap(this.g_map);
    this.g_map.setCenter(src);
  },

  get_points: function(src, dest, speed, interval) {
    var distance = google.maps.geometry.spherical.computeDistanceBetween(
        src, dest, 3959);
    var interval_speed = speed * interval;
    var steps = parseInt(distance / interval_speed, 10);
    var points = [src];
    var start = src;
    for(var i=0; i<steps; i++) {
      var heading = google.maps.geometry.spherical.computeHeading(start, dest);
      var point = google.maps.geometry.spherical.computeOffset(
          start, interval_speed, heading, 3959);
      start = point;
      points.push(point);
    }
    points.push(dest);
    return points;
  },

  render: function() {
    var mapOptions = {
      center: this.center,
      zoom: this.zoom
    };
    var container = this.$('#map-canvas')[0];
    this.g_map = new google.maps.Map(container, mapOptions);
  }
});

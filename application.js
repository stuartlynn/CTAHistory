$( document ).ready(function(){

  d3.csv("data/CTAtrain.csv", function(data){
    
    // var lines = d3.nest()
    //               .key(function(d) { return d.line; })
    //               .key(function(d) { return d.branch; })
    //               .entries(data);
    // console.log(lines);
    // marker array
    var markers = []; 

    //polylines
    var polylines = [];

    // map setup
    var map = L.map('map', {
      center: [41.881369, -87.629076],
      minZoom: 2,
      zoom: 13
    });

    L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
      attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo( map );


    var months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    var margin = {top: 200, right: 50, bottom: 200, left: 50},
                  width = 960 - margin.left - margin.right,
                  height = 500 - margin.bottom - margin.top;

    var customTimeFormat = d3.time.format.multi([
      ["%Y", function() { return true; }]
    ]);

    var x = d3.time.scale()
        .domain([new Date(1892, 0, 1), new Date(2016, 0, 1)])
        .range([0, width])
        .clamp(true);

    var brush = d3.svg.brush()
        .x(x)
        .on("brush", brushSlide)
        .on("brushend", onBrushUp);

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("float", "left")
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height / 2 + ")")
          .call(d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(10)
            .tickSize(0)
            .tickFormat(customTimeFormat)
            .tickPadding(12))
        .select(".domain")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); });

        var dateText = svg.append("text")
            .attr("id", "date")
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("transform", "translate(0, -100)");

        var textDive = d3.select("body")
                        .append("div")
                        .attr("id", "text-info")
                        .attr("float", "right");

        var stationText = d3.select("#text-info")
            .append("ul")
              .attr("id", "stations");

      var slider = svg.append("g")
          .attr("class", "slider")
          .call(brush);

      slider.selectAll(".extent,.resize")
          .remove();

      slider.select(".background")
          .attr("height", height);

      var handle = slider.append("circle")
          .attr("class", "handle")
          .attr("transform", "translate(0," + height / 2 + ")")
          .attr("r", 9);

      slider
          .call(brush.event);

      
      function brushSlide() {
        var value = brush.extent()[0];


        if (d3.event.sourceEvent) { // not a programmatic event
          value = x.invert(d3.mouse(this)[0]);
          brush.extent([value, value]);
        }

        handle.attr("cx", x(value));

      }

      function onBrushUp(){

        removeMarkers(markers);

        var value = brush.extent()[0];

        var stations = data.filter(function(station){
            return (openedStations(station.dateOpened, station.dateClosed, value));
        });

        updateDate(value,dateText);
        // if there are stations update the appropriate items
        if (stations.length > 0) {
          pinMarkers(stations);
          createPolyline([]);
        }
        
      }

      function createMarker(location){
        var newMarker = L.marker( [location.coords[0], location.coords[1]] )
          .bindPopup( location.stationName + "<br> opened " + location.dateOpened)
        .addTo( map );
        return newMarker;
      }

      function removeMarkers (markers) {
        markers.forEach(function(marker){
          removeMarker(marker);
        });
      }

      function removeMarker (marker) {
        map.removeLayer(marker);
      }

      function pinMarkers (stations) {
        stations.forEach(function (station) {
          markers.push(createMarker(station));
        });
      }

      // function createPolyline (points){
        // var pointOne = new L.LatLng(parseFloat(pointA.coords[0]), parseFloat(pointA.coords[1]));
        // var pointTwo = new L.LatLng(parseFloat(pointB.coords[0]), parseFloat(pointB.coords[1]));
        // var points = points;

        // var polyline = new L.Polyline(points, {
        //                             color: 'green',
        //                             weight: 8,
        //                             opacity: 1,
        //                             smoothFactor: 1
        //                           }).addTo(map);

        // console.log(polyline);

      // }


      function updateDate(value,node){

        var year = value.getFullYear();
        var month = months[value.getMonth()];

        var textLabels = node
                          .text(month +" "+ year);

      }

      function stationFormat (station) {
        return "name:"+station.stationName+" Location:"+ station.coords ;
      }



      function openedStations(opened, closed, date){
        if(closed){
          return (date > opened && date < closed);
        }else{
          return (date > opened);
        }
      }

  })
  .row(function(d){

    function parseDateString(dateString){
      if (dateString.length){
          return new Date(dateString);
      }else{
        return dateString;
      }
    }

    function parseCoords (coordString) {
      return coordString.split(', ').map(function(coord){ return parseFloat(coord); });
    }

    return {
      line:          d["Line"]
      ,branch:       d["Branch"]
      ,stationName:  d["Station Name"]
      ,dateOpened:   parseDateString(d["Date Opened"])
      ,dateClosed:   parseDateString(d["Date Closed"])
      ,coords:       parseCoords(d["Coordinates"])
    };

  });

});
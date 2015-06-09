// This example shows how to use the bounding box of a leaflet view to create a
// SODA within_box query, pulling data for the current map view from a Socrata dataset

  //initialize the leaflet map, set options, view, and basemap
  //UC Davis = 38.538561, -121.761893
  //SF civic center = 37.779185, -122.419564


(function($) {
'use strict';
  var map = L.map('map', {
      zoomControl: false,
      scrollWheelZoom: false
    }).setView([37.779185, -122.419564], 8);
    //.setView([40.705008, -73.995581], 15);

  L.tileLayer(
    'http://openmapsurfer.uni-hd.de/tiles/roadsg/x={x}&y={y}&z={z}', {
      minZoom: 0,
      maxZoom: 19,
      attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

  var markers = new L.FeatureGroup();

  //figure out what the date was 7 days ago
  var sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  //show the "since" date in the title box
  $('#startDate').html(sevenDaysAgo.toDateString());

  //create a SODA-ready date string for 7 days ago that looks like: YYYY-mm-dd
  sevenDaysAgo = sevenDaysAgo.getFullYear() + '-' 
    + cleanDate((sevenDaysAgo.getMonth() + 1)) + '-' 
    + cleanDate((sevenDaysAgo.getDate() + 1));

  //call getData() and show spinner when the map is dragged
  map.on('dragend', function(e) {
    $('#spinnerBox').fadeIn();
    getInfectionData();
  });

  //call getData() once
  //getData();
  getInfectionData();

  function getData() {
    //clear markers before getting new ones
    markers.clearLayers();

    //get map bounds from Leaflet.  getBounds() returns an object
    var bbox = map.getBounds();
    console.log(bbox);

    //within_box() expects a bounding box that looks like: topLeftLat,topLeftLon,bottomRightLat,bottomRightLon, so we need to reorder the coordinates leaflet returned
    var sodaQueryBox = [
      bbox._northEast.lat, 
      bbox._southWest.lng, 
      bbox._southWest.lat, 
      bbox._northEast.lng
    ];

    //use jQuery's getJSON() to call the SODA API for NYC 311
    $.getJSON(buildQuery(sevenDaysAgo, sodaQueryBox), function(data) {

      //iterate over each 311 complaint, add a marker to the map
      for (var i = 0; i < data.length; i++) {

        var marker = data[i];
        var markerItem = L.circleMarker(
          [marker.location.latitude,marker.location.longitude], {
            radius: 5,
            fillColor: "steelblue",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          });

        markerItem.bindPopup(
          '<h4>' + marker.complaint_type + '</h4>' 
          + (new Date(marker.created_date)).toDateString() 
          + ((marker.incident_address != null) ? '<br/>' + marker.incident_address : '')
        );

        markers.addLayer(markerItem);
      }
      //.addTo(map);
      map.addLayer(markers);

      //fade out the loading spinner
      $('#spinnerBox').fadeOut();
    })
  }


  function getInfectionData() {
    //clear markers before getting new ones
    markers.clearLayers();

    //get map bounds from Leaflet.  getBounds() returns an object
    var bbox = map.getBounds();
    console.log(bbox);

    //within_box() expects a bounding box that looks like: topLeftLat,topLeftLon,bottomRightLat,bottomRightLon, so we need to reorder the coordinates leaflet returned
    var sodaQueryBox = [
      bbox._northEast.lat, 
      bbox._southWest.lng, 
      bbox._southWest.lat, 
      bbox._northEast.lng
    ];
    
    $.getJSON("california-non-topo.json",function(hoodData){
    L.geoJson( hoodData, {
      style: function(feature){
        var fillColor,
            density = feature.properties.POP12_SQMI;
        if ( density > 80 ) fillColor = "#006837";
        else if ( density > 40 ) fillColor = "#31a354";
        else if ( density > 20 ) fillColor = "#78c679";
        else if ( density > 10 ) fillColor = "#c2e699";
        else if ( density > 0 ) fillColor = "#ffffcc";
        else fillColor = "#f7f7f7";  // no data
        return { color: "#999", weight: 1, fillColor: fillColor, fillOpacity: .5 };
      },
      onEachFeature: function( feature, layer ){
        layer.bindPopup( "<strong>" + feature.properties.NAME + "</strong><br/>" + feature.properties.POP12_SQMI + " people per square mile." )
      }
    }).addTo(map);
  });

//cluster hospitals
    /*$.getJSON("california-non-topo.json",function(data){
    var ratIcon = L.icon({
      iconUrl: 'http://andywoodruff.com/maptime-leaflet/rat.png',
      iconSize: [60,50]
    });
    var rodents = L.geoJson(data,{
      pointToLayer: function(feature,latlng){
        var marker = L.marker(latlng,{icon: ratIcon});
        marker.bindPopup(feature.properties.NAME + '<br/>' + feature.properties.POP2010);
        return marker;
      }
    });
    var clusters = L.markerClusterGroup();
    clusters.addLayer(rodents);
    map.addLayer(clusters);
  });*/




  /* $.getJSON(getPICMortalityRate(), function(data) {

      //iterate over each 311 complaint, add a marker to the map
      for (var i = 0; i < data.length; i++) {
        //console.log(marker);
        var marker = data[i];
        var radius = 5;
        if ( marker.of_deaths > 80 ) fillColor = "#006837";
        else if ( marker.of_deaths > 40 ) radius = 25;
        else if ( marker.of_deaths > 20 ) radius =20;
        else if ( marker.of_deaths > 10 ) radius = 10;
        else if ( marker.of_deaths > 0 )  radius =5;
        
        var markerItem = L.circleMarker(
          [marker.latitute,marker.longitute], {
            radius: radius,
            fillColor: "red",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.5,
          });

        markerItem.bindPopup(
          '<h4>' + marker.hospital + '</h4>' 
          + ": " + (marker.of_deaths ) + " PCI deaths.");
         // + ((marker.facility_name != null) ? '<br/>' + facility_name : '')
        

        markers.addLayer(markerItem);
      }
      //.addTo(map);
        map.addLayer(markers);

        //fade out the loading spinner
        $('#spinnerBox').fadeOut();
    });*/
     
  var coffeeIcon = L.AwesomeMarkers.icon({
    icon: 'coffee',
    markerColor: 'purple'
  });
  var ratIcon = L.icon({
      iconUrl: 'http://andywoodruff.com/maptime-leaflet/rat.png',
      iconSize: [60,50]
    });
    
    

  }

  //add leading zero if month or day is less than 10
  function cleanDate(input) {
    return (input < 10) ? '0' + input : input;
  }


  function getVancomycinData(){
    var url = 'https://cdph.data.ca.gov/resource/3dx8-ezkz.json?$select="facid1","county","facility_name1","cases","patient_days","incidence_rate"&$where="cases">0&$order="cases" desc';
  }


  function getMethicillinData(){
    var name = "Methicillin-Resistant Staphylococcus Aureus (MRSA) Bloodstream Infections"
    //rehab hospitals (acutecare) 0 incidents

    //long term acute care
    var acuteurl = 'https://cdph.data.ca.gov/resource/bnzh-iyt4.json?$select="facid","county","facility_name","cases","patient_days","incidence_rate"&$where="cases">0&$order="cases" desc'
    var hospurl = 'https://cdph.data.ca.gov/resource/x6ev-sgxq.json?$select="facid1","county","facility_name1","infection_count","patient_days"&$where="infection_count">0&$order="infection_count"%20desc'
  }

 function getCDifficileData(){
     var name = "Clostridium Difficile Infections (CDI)"
     var rehaburl = 'https://cdph.data.ca.gov/resource/fbuc-iadw.json?$select="facid","county","facility_name","hospital_onset_cases","patient_days"&$where="hospital_onset_cases">0&$order="hospital_onset_cases" desc'
     var hospurl = 'https://cdph.data.ca.gov/resource/swz5-nhqr.json?$select="facid1","county","facility_name1","hospital_onset_cases","patient_days"&$where="hospital_onset_cases">0&$order="hospital_onset_cases" desc'

     var acuteurl = 'https://cdph.data.ca.gov/resource/x39i-9t72.json?$select="facid","county","facility_name","hospital_onset_cases","patient_days"&$where="hospital_onset_cases">0&$order="hospital_onset_cases" desc'
     return hospurl;
}

  function getHospitalLocData(){
    var url = 'https://chhs.data.ca.gov/resource/ctx4-usgb.json?$select=facility_name,facility_nbr,location_1';
    return url;
  }

  function getPICMortalityRate(){
    var url = 'https://chhs.data.ca.gov/resource/qr4k-tk9d.json?$select="county","hospital","of_deaths","of_cases","longitute","latitute"&$where="of_deaths" > 0'
    return url;
  }

  function getAsthmaEmergencyByZipcode(){
    var url = 'https://cdph.data.ca.gov/resource/cz35-fdam.json?$select="zipcode","count_visits_kids","count_visits_adults","count_visits_all"'
  }

})(jQuery);
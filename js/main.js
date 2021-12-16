  // const tot_color = '#343332'
  const tot_color = '#efe5dc'
    
  const map = L.map('map').setView([48.5, 32.08], 6);

  const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXZnZXNoYWRyb3pkb3ZhIiwiYSI6ImNqMjZuaGpkYTAwMXAzMm5zdGVvZ2c0OHYifQ.s8MMs2wW15ZyUfDhTS_cdQ'
  const mapbox_STYLE = `https://api.mapbox.com/styles/v1/evgeshadrozdova/cjsqjh1to30c81ftn8jnuikgj/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`

  const map_STYLE__2 = 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'
  const map_STYLE__3 = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'

  // load a tile layer
   L.tileLayer(map_STYLE__3,
   {
       attribution: 'Tiles &copy; Esri',
       maxZoom: 17,
       minZoom: 6
   }).addTo(map);
   
   var myStyle = {
       "color": "red",
       "weight": 1,
       "opacity": 0.8
   };

   function onEachFeatureClosure(defaultColor, weightValue) {
       return function onEachFeature(feature, layer) {
           layer.on('click', function (e) { 
               console.log(feature.properties.Name)
           });        
       }
   }


   $.getJSON("data/tot_teritory.json",function(military){
       var geoJsonLayer = L.geoJson(military,  { fill:'url(img/image.gif)', weight: 0, color: tot_color}   );
           
           map.addLayer(geoJsonLayer);
   });

   //приклад кластерізації полігонів взятий тут: https://js.do/code/166021
   $.getJSON("data/bases.geojson",function(polygons){

       var polygonArray = []
           for (i = 0; i < polygons.features.length; i++) {
               polygonArray.push(polygons.features[i]);            
           }
           
           // Compute a polygon "center", use your favorite algorithm (centroid, etc.)
           L.Polygon.addInitHook(function () {	this._latlng = this._bounds.getCenter(); });
           
           // Provide getLatLng and setLatLng methods for Leaflet.markercluster to be able to cluster polygons.
           L.Polygon.include({
               getLatLng: function () { return this._latlng; },
               setLatLng: function () {} // Dummy method.
           });

           var markers = L.markerClusterGroup({
              /*  disableClusteringAtZoom:14 */
           }).addTo(map);

           var geoJsonLayer = L.geoJson(polygonArray,  { style: myStyle, onEachFeature: onEachFeatureClosure()  }  );
           
           markers.addLayer(geoJsonLayer);

          /*  map.fitBounds(markers.getBounds()); */
   });
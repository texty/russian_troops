  // const tot_color = '#343332'
  const API_ROOT = 'https://old.texty.org.ua'

  const tot_color = '#efe5dc'
    
  const map = L.map('map').setView([48.5, 32.08], 6);

  const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXZnZXNoYWRyb3pkb3ZhIiwiYSI6ImNqMjZuaGpkYTAwMXAzMm5zdGVvZ2c0OHYifQ.s8MMs2wW15ZyUfDhTS_cdQ'

  /* Варіанти тайлів  */
  const mapbox_STYLE = `https://api.mapbox.com/styles/v1/evgeshadrozdova/cjsqjh1to30c81ftn8jnuikgj/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`
  const map_STYLE__2 = 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'
  const map_STYLE__3 = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'

  
  // load a tile layer
   L.tileLayer(map_STYLE__3,
   {
       attribution: 'Tiles &copy; Esri',
       maxZoom: 17,
       minZoom: 5
   }).addTo(map);
   

   /* стиль полігонів */
   var myStyle = {
       "color": "red",
       "weight": 1,
       "opacity": 0.8
   };


   //слайдер-горталка
   var splide = new Splide( '.splide', {    
        perPage: 4,
        perMove: 1,
        direction: 'rtl',
        breakpoints: {
        640: {
        perPage: 2,
        }},
        width: '100%',          
  });

  var bar = splide.root.querySelector( '.my-slider-progress-bar' );
  splide.on( 'mounted refresh move', function () {
    var end = splide.Components.Controller.getEnd() + 1;
    bar.style.width = String( 100 * ( splide.index + 1 ) / end ) + '%';
  });

  splide.mount();

  /* по кліку показуємо модальне вікно з comparison slider */
  splide.on( 'click', function (e) {
      
      let clicked_image = e.slide.childNodes[0].getAttribute("src");      
     
      let last_image = document.querySelector('#splide01-slide01 > img').getAttribute("src");
      document.getElementById('before').setAttribute('src', clicked_image)
      document.getElementById('after').setAttribute('src', last_image)
      document.getElementById('comparison-wrapper').style.display = "flex";
  });


  /* По кліку на полігон міняємо перелік картинок у горталці*/
   function onEachFeatureClosure(defaultColor, weightValue) {
       return function onEachFeature(feature, layer) {     
           
            var polygonCenter = layer.getBounds().getCenter();

            // e.g. using Leaflet.label plugin
                L.marker(polygonCenter, { opacity: 0 })
                    //.bindTooltip(feature.properties['Name'], { permanent: true})
                    .bindTooltip('2021.12.06', { permanen: true, noHide: true})
                    .addTo(map);

                    
        
            
           layer.on('click', function (e) { 
               console.log(feature.properties.Name);                            
               while(splide.length > 0){
                    splide.remove( splide.length - 1 );
               }                             
               splide.add( '<li class="splide__slide"><img class="item" src="img/2.jpg"/></li>' );
               splide.add( '<li class="splide__slide"><img class="item" src="img/1.jpg"/></li>' );
               splide.add( '<li class="splide__slide"><img class="item" src="img/1.jpg"/></li>' );
               splide.add( '<li class="splide__slide"><img class="item" src="img/2.jpg"/></li>' );
               splide.add( '<li class="splide__slide"><img class="item" src="img/1.jpg"/></li>' );
               splide.add( '<li class="splide__slide"><img class="item" src="img/2.jpg"/></li>' );
               splide.add( '<li class="splide__slide"><img class="item" src="img/1.jpg"/></li>' );
               splide.add( '<li class="splide__slide"><img class="item" src="img/2.jpg"/></li>' );

               var end = splide.Components.Controller.getEnd() + 1;
               bar.style.width = String( 100 * ( splide.index + 1 ) / end ) + '%';

            }
           )
                
       }
   }

   /* полігон з окупованими територіями */
   $.getJSON("data/tot_teritory.json",function(military){
       var geoJsonLayer = L.geoJson(military,  { fill:'url(img/image.gif)', weight: 0, color: tot_color, opacity: 0.4}   );           
           map.addLayer(geoJsonLayer);
   });


    $.getJSON(API_ROOT + "/api/v1/zones/",function(polygons){  


        /* переформатовуємо дані у geojson */
        var geojson_file = {"type": "FeatureCollection", "features": []}

        for(var i =0; i < polygons.length; i++){       
            for(var n = 0; n < polygons[i].geometry.length; n++ ){
                
                let feature = { 
                    "type": "Feature", 
                    "properties": { "id": polygons[i].id, "Name": polygons[i].name }, 
                    "geometry": { "type": "MultiPolygon", 
                                  "coordinates": polygons[i].geometry[n].geometry.coordinates 
                                } 
                            };   
    
                geojson_file.features.push(feature)
             }  
        }
    
       var polygonArray = geojson_file.features.filter(function(d){
            return d.geometry.coordinates.length > 0
        }) 

       
      
        //приклад кластерізації полігонів взятий тут: https://js.do/code/166021        
        // Compute a polygon "center"
        L.Polygon.addInitHook(function () {	   
            this._latlng = this._bounds.getCenter();
         });
        
        // Provide getLatLng and setLatLng methods for Leaflet.markercluster to be able to cluster polygons.
        L.Polygon.include({
            getLatLng: function () { return this._latlng; },
            setLatLng: function () {} // Dummy method.
        });

        function hasProperty(element, index, array) {
           return element.feature.properties.Name === "Kamensk-Shakhtinsky";
          }

        var markers = L.markerClusterGroup({
               iconCreateFunction: function (cluster) {  
                   
                var isNew;
            
                if(cluster.getAllChildMarkers().some(hasProperty)) {       
                    isNew = "green"             
                } else {
                    isNew = "red"
                }  

                return L.divIcon({ className: 'marker-cluster' +  
                ' marker-cluster-' + isNew, html: '<div><span>' + cluster.getChildCount() + '<br>'+
                `<span style="color:${isNew}">21.12.2021</span>`+
                '</div></span>' })

                
                
               
            }       
         }).addTo(map);       

             
        

        var geoJsonLayer = L.geoJson(polygonArray,  { style: myStyle, onEachFeature: onEachFeatureClosure()  }  );        
        markers.addLayer(geoJsonLayer);

        if(window.innerWidth < 800){
            map.fitBounds(markers.getBounds());
        } 
          
   });
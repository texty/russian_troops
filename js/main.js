  // const tot_color = '#343332'
  const API_ROOT = 'https://old.texty.org.ua'

  const tot_color = '#efe5dc'
    
  const map = L.map('map').setView([48.5, 32.08], 6);

  const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXZnZXNoYWRyb3pkb3ZhIiwiYSI6ImNqMjZuaGpkYTAwMXAzMm5zdGVvZ2c0OHYifQ.s8MMs2wW15ZyUfDhTS_cdQ'

  /* Варіанти тайлів  */
  const mapbox_STYLE = `https://api.mapbox.com/styles/v1/evgeshadrozdova/cjsqjh1to30c81ftn8jnuikgj/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`
  const map_STYLE__2 = 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'
  const map_STYLE__3 = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'


  var default_lat = 54.60600330049135;
  var default_lng = 33.157733220304166;
  
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
      
     let timestamp = e.slide.childNodes[0].getAttribute("timestamp");
     let toTime = timestamp.replace('T00:00:00Z', 'T23:59:59Z')

     let URL = `https://apps.sentinel-hub.com/eo-browser/?zoom=15&lat=${default_lat}&lng=${default_lng}&themeId=DEFAULT-THEME&visualizationUrl=https%3A%2F%2Fservices.sentinel-hub.com%2Fogc%2Fwms%2Ff2068f4f-3c75-42cf-84a1-42948340a846&datasetId=S1_AWS_IW_VVVH&fromTime=${timestamp}&toTime=${toTime}&layerId=7_SAR-URBAN`

     window.open(URL, '_blank');
     
     /*  let last_image = document.querySelector('#splide01-slide01 > img').getAttribute("src");
      document.getElementById('before').setAttribute('src', clicked_image)
      document.getElementById('after').setAttribute('src', last_image)
      document.getElementById('comparison-wrapper').style.display = "flex"; */
  });


  


    //дефолті знімки в слайдер
    $.getJSON(API_ROOT + "/api/v1/zones/44/", function(images){ 
        var satelites = images.geometry.filter(function(d){
            return d.id === 103;
        })

        satelites[0].images.forEach(function(image){
            let date = new Date(image.timestamp)
            splide.add( `<li class="splide__slide"><p>`+ date.getDate()  + "." + (date.getMonth()+1) + "." + date.getFullYear() + `</p><img class="item" src=${image.image_url} timestamp=${image.timestamp}></li>` );
        })  
    }); 


  /* По кліку на полігон міняємо перелік картинок у горталці*/
   function onEachFeatureClosure(defaultColor, weightValue) {
       return function onEachFeature(feature, layer) {  
           
           
            var polygonCenter = layer.getBounds().getCenter();

            

            // e.g. using Leaflet.label plugin
               /*  L.marker(polygonCenter, { opacity: 0 })
                    //.bindTooltip(feature.properties['Name'], { permanent: true})
                    .bindTooltip(feature.properties['date'], { permanen: true, noHide: true})
                    .addTo(map); */

            
           layer.on('click', function (e) { 
               while(splide.length > 0){
                    splide.remove( splide.length - 1 );
               }   
               
                $.getJSON(API_ROOT + "/api/v1/zones/" + feature.properties.id + "/", function(images){                    
                    var satelites = images.geometry.filter(function(d){
                       return d.id === feature.properties.polygon_id;
                   })

                   satelites[0].images.forEach(function(image){
                       let date = new Date(image.timestamp)
                        splide.add( `<li class="splide__slide"><p>`+ date.getDate()  + "." + (date.getMonth()+1) + "." + date.getFullYear() + `</p><img class="item" src=${image.image_url} timestamp=${image.timestamp}></li>` );
                   })

                   default_lat = polygonCenter.lat;
                   default_lng = polygonCenter.lng;


                   document.getElementById('clicked_place').innerHTML = images.name;
                   document.getElementById('clicked_lnglat').innerHTML = `<b>Координати:</b>: ${polygonCenter.lat}, ${polygonCenter.lng}`;

                });              

               var end = splide.Components.Controller.getEnd() + 1;
               bar.style.width = String( 100 * ( splide.index + 1 ) / end ) + '%';

               

            }
           )
                
       }
   }

   /* полігон з окупованими територіями */
   $.getJSON("data/tot_teritory.json",function(military){
       var geoJsonLayer = L.geoJson(military,  {fill:'url(img/image.gif)', weight: 0, color: tot_color, fillOpacity: 0.1}   );           
           map.addLayer(geoJsonLayer);
   });


    $.getJSON(API_ROOT + "/api/v1/zones/",function(polygons){  


        /* переформатовуємо дані у geojson */
        var geojson_file = {"type": "FeatureCollection", "features": []}

        for(var i =0; i < polygons.length; i++){       
            for(var n = 0; n < polygons[i].geometry.length; n++ ){                
                let feature = { 
                    "type": "Feature", 
                    "properties": { "id": polygons[i].id, "polygon_id": polygons[i].geometry[n].id, "Name": polygons[i].name, "date": polygons[i].last_satellite_image_date }, 
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
               showCoverageOnHover: false,
               iconCreateFunction: function (cluster) {  
                   
                var clusterColor;
                var spanColor;
                var lastDate;
            
                /* if(cluster.getAllChildMarkers().some(hasProperty)) {       
                    clusterColor = "green"             
                } else {
                    clusterColor = "red"
                }   */

                clusterColor = "red";
                spanColor = "#ff5a7b";

                //беремо максимальну дату з кожного кластера
                var dates = [];
                cluster.getAllChildMarkers().forEach(function(k){                                
                    if(!!k.feature.properties.date) {
                        dates.push(new Date(k.feature.properties.date))
                    }                     
                })  

                if(dates.length > 0){
                    formattedDated = new Date(Math.max.apply(null,dates));                    
                    lastDate = formattedDated.getDate()  + "." + (formattedDated.getMonth()+1) + "." + formattedDated.getFullYear();                 

                } else {
                    lastDate = ""
                }

                return L.divIcon({ className: 'marker-cluster' +  
                ' marker-cluster-' + clusterColor, html: '<div><span>' + cluster.getChildCount() + '<br>'+
                `<span style="color:${spanColor}">` + lastDate  +`</span>`+
                '</div></span>' })

                
                
               
            }       
         }).addTo(map);       

             
        

        var geoJsonLayer = L.geoJson(polygonArray,  { style: myStyle, onEachFeature: onEachFeatureClosure()  }  );        
        markers.addLayer(geoJsonLayer);


        map.fitBounds(markers.getBounds());
        /* if(window.innerWidth < 800){
            map.fitBounds(markers.getBounds());
        }  */
          
   });
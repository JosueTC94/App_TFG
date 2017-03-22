
"use strict";
console.log("Archivo main.js");

var initMap = (() => {
  // var uluru = {lat: -25.363, lng: 131.044};
  console.log("initMap");
  $.get('/geo_waspmotes',{},(datos)=>
  {
    console.log("Client geo_waspmotes:"+JSON.stringify(datos));
    console.log("Numero de waspmotes:"+datos.waspmotes.length);
    $("#response_geoWaspmotes").html('<p>Disponibles en el sistema '+datos.waspmotes.length+' Waspmotes.');
    
    var map;
    var data = datos.waspmotes;
    
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 2,
      center: {lat: 10.123, lng: -10.123} //Lo suyo es ponerlo fija
    });
    
    if(datos != null)
    {
      for(var i=0;i<data.length;i++)
      {
          var info = `
            <b>Información general de dispositivo</b>:
            <br><br><b>MAC:</b> ${data[i].MAC}
            <br><br><b>Latitud:</b> ${data[i].Latitud}, <b>Longitud:</b> ${data[i].Longitud}
            <br><br><b>Nivel de Batería:</b> ${data[i].LevelBattery}
            <br><br><b>Descripción:</b> ${data[i].Comentarios}
            <br><br><a class="btn btn-primary pull-right" style="margin-top:10px;" href="/borrar/${data[i]._id}">Eliminar</a>
          `;
          setMarker(data[i].Latitud,data[i].Longitud, info, map);
      }
    }
    else
    {
      $("#map").css("display","none");
    }
  });
});

var setMarker = ((latitud,longitud, descripcion, mapa)=>
{
  var aux = {lat: latitud, lng: longitud};

  var infowindow = new google.maps.InfoWindow({
    content: descripcion
  });


  var marker = new google.maps.Marker({
    position: aux,
    draggable: false, //Que pueda moverse el marker
    map: mapa
  });

  marker.addListener('click', function() {
    mapa.setZoom(8);
    mapa.setCenter(marker.getPosition());
    infowindow.open(mapa, marker);
  });
});

exports.initMap = initMap;

"use strict";

const path = require('path');
const estructura = require(path.join(__dirname,'../models','bd.js'));

const Waspmote = estructura.Waspmote;
const Medida = estructura.Medida;

//Compruebo que la Waspmote está registrada previamente
var siregistrada = ((MACaddress,cb)=>
{
    Waspmote.findOne({MAC: MACaddress}, (err,datos)=>
    {
      if(err)
        return cb(err,null);

      if(datos)
      {
        console.log("------------------------------");
        console.log("Waspmote válida");
        console.log("Infor de la Waspmote:"+JSON.stringify(datos));
        return cb(null,datos._id);
      }
      else
      {
          console.log("Waspmote no registrada en el sistema...");
          console.log("No se ha introducido una nueva medida.");
          //Capturar MAC y dejar registrada en la vista del administrador
          return cb(`Dispositivo con MAC: ${MACaddress} ha intentado registrar una medida.`, null);
      }
    });
});

var eliminar = ((id, cb)=>
{
  Waspmote.remove({_id: id}, (err, datos) =>
  {
      return cb(err,datos);
  });
})

var insertar = ((datos,cb)=>
{
  console.log("Datos1:"+JSON.stringify(datos));

  let waspmote = new Waspmote({
    Latitud: datos.waspmote_latitud,
    Longitud: datos.waspmote_longitud,
    LevelBattery: datos.waspmote_bateria,
    Estado: datos.waspmote_estado,
    FechaAlta: new Date('07.03.2017'),
    Comentarios: datos.waspmote_comentarios,
    MAC: datos.waspmote_mac
  });

  waspmote.save((err)=>
  {
    console.log("ERROR:"+err);
    if(err)
      return cb(err,null);

    return cb(null,waspmote);
  });
});

var geolocalizacion = ((cb)=>
{
  Waspmote.find({}, (err,datos)=>
  {
      if(err)
        return cb(err,null);

      if(datos!=null)
      {
        return cb(null,datos);
      }
  });
});

exports.siregistrada = siregistrada;
exports.eliminar = eliminar;
exports.insertar = insertar;
exports.geolocalizacion = geolocalizacion;

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
    FechaAlta: Date.now(),
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

var getData = ((cb)=>
{
  console.log("Function geolocalizacion");
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

var actualizar = ((data,cb)=>
{
  Waspmote.findOne({_id: data.id},(err,doc)=>
  {
    if(err)
      throw err;

    console.log("Documento:"+JSON.stringify(doc));
    console.log("yeah:"+JSON.stringify(data));
    try {
      doc.FechaAlta = new Date(data.fecha);
      doc.Estado = data.estado;
      doc.Comentarios = data.comentarios;
      doc.save();
      return cb("Actualización realizada con éxito");
    } catch (e) {
      console.log("eaeaea");
      return cb("Error:"+e);
    }
  });
});


exports.siregistrada = siregistrada;
exports.eliminar = eliminar;
exports.insertar = insertar;
exports.getData = getData;
exports.actualizar = actualizar;

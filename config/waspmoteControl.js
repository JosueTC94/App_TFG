"use strict";

const path = require('path');
const estructura = require(path.join(__dirname,'../models','bd.js'));

var mongoose = require('mongoose');
const Waspmote = estructura.Waspmote;
const Medida = estructura.Medida;

//Compruebo que la Waspmote está registrada previamente
var verificarWaspmote = ((data,cb)=>
{
    Waspmote.findOne({MAC: data.MAC}, (err,waspmote)=>
    {
      if(err)
        return cb(err,null);

      if(waspmote != null)
      {
        console.log("------------------------------");
        console.log("Waspmote válida");
        console.log("Infor de la Waspmote:"+JSON.stringify(waspmote));

        
        // //Actualizamos información de la Waspmote en el caso de que se hayan producido cambios 
        if(data.Lat != null && data.Lat != waspmote.Latitud)
        {
          waspmote.Latitud = data.Lat;
          console.log("Actualizando Latitud");
        }
          
        
        if(data.Lon != null && data.Lon != waspmote.Longitud)
        {
          waspmote.Longitud = data.Lon;
          console.log("Actualizando Longitud");
        }
          
        if(data.Bat != waspmote.LevelBattery)
        {
          waspmote.LevelBattery = data.Bat;
          console.log("Actualizando LevelBattery");
        }
        
        //Guardamos cambios
        waspmote.save();
        
        return cb(null,waspmote._id);
      }
      else
      {
          console.log("Waspmote no registrada en el sistema...");
          console.log("No se ha introducido una nueva medida.");
          
          //Capturar MAC y dejar registrada en la vista del administrador
          return cb(`Dispositivo con MAC: ${data.MAC} ha intentado registrar una medida.`, null);
      }
    });
});

var insertarMedida = ((data, cb)=>
{
    verificarWaspmote(data,(err,id)=>
    {
      if(err)
      {
        console.error(err);
        return cb(err,null);
      }
      
      //Comunicar al administrador del sistema.
      console.log("Registrando medida para Waspmote:"+id);
      
      if(id != null)
      {
        let med = new Medida({
          Temperatura: data.T,
          Humedad: data.H,
          Presion: data.P,
          ContaminantesAire: data.AP1,
          COLevel: data.CO,
          Fecha: Date.now(),
          CO2Level: data.CO2,
          _creator: id
        });
        med.save((err)=>
        {
          if(err)
          {
            console.error("Error:"+err);
            return cb(err,null);
          }
          console.log(`Guardada ${med}`);
        }).then(()=>
        {
          Medida
            .findOne({
                Temperatura: data.T,
                Humedad: data.H,
                Presion: data.P,
                ContaminantesAire: data.AP1,
                COLevel: data.CO,
                CO2Level: data.CO2
            })
            .populate('_creator')
            .exec((err,medida)=>
            {
              if(err)
              {
                console.log(err);
                return cb(err,null);
              }
              return cb(null,medida);
            }).then(()=>{
                
            });
        });
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

var getMedidas = ((id,cb)=>
{
  var _id = mongoose.Types.ObjectId(id);
  console.log("Id:"+id);
  console.log("Object ID:"+_id);
  Medida.find({_creator:_id}, (err,medidas)=>
  {
    if(err)
    {
      console.log("Error:"+err);
      return cb(err,null);
    }
    
    if(medidas != null)
    {
      console.log("Medidas:"+JSON.stringify(medidas));
      return cb(null,medidas);
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
      return cb("Error:"+e);
    }
  });
});


// exports.siregistrada = siregistrada;
exports.insertarMedida = insertarMedida;
exports.eliminar = eliminar;
exports.insertar = insertar;
exports.getData = getData;
exports.actualizar = actualizar;
exports.getMedidas = getMedidas;
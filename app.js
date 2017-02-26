"use strict";

var express = require('express');
var app = express();
var path = require('path');
var basePath = process.cwd();
var estructura = require(path.join(__dirname,'models','bd.js'));

const Waspmote = estructura.Waspmote;
const Medida = estructura.Medida;

const controlWaspmote = require(path.join(__dirname,'config','waspmoteControl.js'));

app.get('/', function (req, res, next) {
    console.log('Hello World! Waspmote with MAC:'+req.query.MAC);
    res.render('index');
});

app.get('/insertar_medida',function(req,res)
{
  //Verificar waspmote
// http://localhost:3000/insertar_medida?Temperatura=21&Humedad=1&Presion=2&ContaminantesAire=3&COLevel=4&CO2Level=5
  controlWaspmote.siregistrada(req.query.MAC, (err,id)=>
  {
    if(err)
    {
      console.error(err);
      //Comunicar al administrador del sistema.
    }

    let med = new Medida({
      Temperatura: req.query.Temperatura,
      Humedad: req.query.Humedad,
      Presion: req.query.Presion,
      ContaminantesAire: req.query.ContaminantesAire,
      COLevel: req.query.COLevel,
      CO2Level: req.query.CO2Level,
      _creator: id
    });
    med.save((err)=>
    {
      if(err) console.error("Error:"+err);
      console.log(`Guardada ${med}`);
    }).then(()=>
    {
      Medida
        .findOne({Temperatura: req.query.Temperatura,
        Humedad: req.query.Humedad,
        Presion: req.query.Presion,
        ContaminantesAire: req.query.ContaminantesAire,
        COLevel: req.query.COLevel,
        CO2Level: req.query.CO2Level,
        Fecha: req.query.Fecha
        })
        .populate('_creator')
        .exec((err,medida)=>
        {
          if(err) return console.log(err);
        }).then(()=>{});
    });
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

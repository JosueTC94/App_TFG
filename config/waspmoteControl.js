"use strict";

var estructura = require(path.join(__dirname,'models','bd.js'));

const Waspmote = estructura.Waspmote;
const Medida = estructura.Medida;

//Compruebo que la Waspmote está registrada previamente
var siregistrada = ((MACaddress,cb)=>
{
    Waspmote.findOne({MAC: MACaddress}, (err,datos)=>
    {
      if(err)
        cb(err,null);

      if(datos)
      {
        console.log("------------------------------");
        console.log("Waspmote válida");
        console.log("Insertando medidas");
        console.log("Infor de la Waspmote:"+JSON.stringify(datos));
        cb(datos._id);
      }
      else
      {
          console.log("Waspmote no registrada en el sistema...");
          console.log("No se ha introducido una nueva medida.");
          //Capturar MAC y dejar registrada en la vista del administrador
          cb(`Dispositivo con MAC: ${MACaddress} ha intentado registrar una medida.`, null);
      }
    });
});

exports.siregistrada = siregistrada;

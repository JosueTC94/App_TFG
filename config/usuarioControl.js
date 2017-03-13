"use strict";

const path = require('path');
const bcrypt = require('bcrypt-nodejs');
const estructura = require(path.join(__dirname,'../models','bd.js'));
const Usuario = estructura.Usuario;


var verifyUser = ((username, password, cb) =>
{
  console.log("Accedi");
  console.log("Username:"+username);
  console.log("Password:"+password);
  Usuario.findOne({Usuario: username}, (err,datos)=>
  {
    console.log("Datos:"+JSON.stringify(datos));
    if(err)
    {
      console.log("7");
      return cb(err, false);
    }

    if(datos != null)
    {
      if(bcrypt.compareSync(password, datos.Password))
      {
        return cb(null, datos);
      }
      else
      {
        return cb("Password incorrecto", null);
      }
    }
    else
    {
        console.log("ea");
        return cb("No se ha encontrado usuario", null);
    }
  });
});

var getData = ((cb)=>
{
    Usuario.find({},(err,datos)=>
    {
      if(err)
        return cb(err,null);
      return cb(null,datos);
    });
});

var registrarse = ((datos,cb)=>
{
    console.log("User controler registrarse:"+JSON.stringify(datos));
    let usuario = new Usuario(
    {
      Nombre: datos.Nombre,
      Apellidos: datos.Apellidos,
      Usuario: datos.Usuario,
      Password: datos.Password,
      Admin: false,
      Creado: Date.now()
    });

    console.log("ea");

    usuario.save((err)=>
    {
      if(err)
      {
        console.log("Errorrr:"+err);
        return cb(err, "Usuario no creado");
      }

      console.log("Usuario creado con éxito");
      return cb(null, "Usuario creado con éxito");
    });
});

var eliminar = ((id, cb)=>
{
  Usuario.remove({_id: id}, (err,datos)=>
  {
    console.log("ERR:"+err);
    console.log("Datos:"+datos);
    return cb(err,datos);
  });
});

exports.verifyUser = verifyUser;
exports.getData = getData;
exports.registrarse = registrarse;
exports.eliminar = eliminar;

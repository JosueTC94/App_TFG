// "use strict";
//     "mongoose": "^4.8.2",

// const path = require('path');
// const bcrypt = require('bcrypt-nodejs');
// const estructura = require(path.join(__dirname,'../models','bd.js'));
// const Usuario = estructura.Usuario;
//
//
// var verifyUser = ((username, password, cb) =>
// {
//   console.log("Accedi");
//   console.log("Username:"+username);
//   console.log("Password:"+password);
//   Usuario.findOne({Usuario: username}, (err,datos)=>
//   {
//     console.log("Datos:"+JSON.stringify(datos));
//     if(err)
//     {
//       console.log("7");
//       return cb(err, false);
//     }
//
//     if(datos != null)
//     {
//       if(bcrypt.compareSync(password, datos.Password))
//       {
//         return cb(null, datos);
//       }
//       else
//       {
//         return cb("Password incorrecto", null);
//       }
//     }
//     else
//     {
//         console.log("ea");
//         return cb("No se ha encontrado usuario", null);
//     }
//   });
// });
//
// exports.verifyUser = verifyUser;

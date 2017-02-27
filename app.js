"use strict";

var express = require('express');
var app = express();
var path = require('path');
var basePath = process.cwd();
var passport = require('passport');
var expressLayouts = require('express-ejs-layouts');

var LocalStrategy = require('passport-local').Strategy;

var estructura = require(path.join(__dirname,'models','bd.js'));
const Waspmote = estructura.Waspmote;
const Medida = estructura.Medida;
const Usuario = estructura.Usuario;

const controlWaspmote = require(path.join(__dirname,'config','waspmoteControl.js'));
const controlUsuario = require(path.join(__dirname,'config','usuarioControl.js'));

//passport-local
passport.use(new LocalStrategy(
  function(username, password, cb) {
    console.log("Identificando usuario:");
    console.log("User->"+username);
    console.log("Password->"+password);

    controlUsuario.verifyUser(username, password, (err, user) =>
    {
        if(err)
        {
          console.log("error");
          return cb(null,false);
        }

        if(user)
        {
          console.log("Usuario logueado:"+JSON.stringify(user));
          return cb(null, user);
        }
        else
        {
          console.log("Usuario no verificado");
          return cb(null,null);
        }
    });
  }
));

//sessions
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null,obj);
});

// Configure view engine to render EJS templates.
app.use(express.static(path.join(__dirname,'public/')));
app.set("views", __dirname+'/views');
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res, next) {
    console.log('Hello World!');
    // res.render('index');
});

app.get('/login',
  passport.authenticate('local', {failureRedirect: '/error'}),
  function(req,res) {
    console.log("Login exitoso");
    res.render('home');
});



app.get('/insertar_medida',function(req,res)
{
  //Verificar waspmote
// http://localhost:3000/insertar_medida?Temperatura=21&Humedad=1&Presion=2&ContaminantesAire=3&COLevel=4&CO2Level=5
  console.log("Insertando medida...");
  // controlWaspmote.siregistrada(req.query.MAC, (err,id)=>
  // {
  //   if(err)
  //   {
  //     console.error(err);
  //     res.redirect('/');
  //     //Comunicar al administrador del sistema.
  //   }
  //
  //   console.log("Registrando medida para Waspmote:"+id);
  //
  //   if(id != null)
  //   {
  //     let med = new Medida({
  //       Temperatura: req.query.Temperatura,
  //       Humedad: req.query.Humedad,
  //       Presion: req.query.Presion,
  //       ContaminantesAire: req.query.ContaminantesAire,
  //       COLevel: req.query.COLevel,
  //       CO2Level: req.query.CO2Level,
  //       _creator: id
  //     });
  //     med.save((err)=>
  //     {
  //       if(err) console.error("Error:"+err);
  //       console.log(`Guardada ${med}`);
  //     }).then(()=>
  //     {
  //       Medida
  //         .findOne({Temperatura: req.query.Temperatura,
  //         Humedad: req.query.Humedad,
  //         Presion: req.query.Presion,
  //         ContaminantesAire: req.query.ContaminantesAire,
  //         COLevel: req.query.COLevel,
  //         CO2Level: req.query.CO2Level,
  //         Fecha: req.query.Fecha
  //         })
  //         .populate('_creator')
  //         .exec((err,medida)=>
  //         {
  //           if(err) return console.log(err);
  //         }).then(()=>{
  //             res.redirect('/');
  //         });
  //     });
  //   }
  //
  // });
});

app.get('/error', (req,res)=>
{
    res.render('error');
});

app.listen(80, function () {
  console.log('Example app listening on port 3000!');
});

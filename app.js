"use strict";

var express = require('express');
var app = express();
var path = require('path');
var basePath = process.cwd();
var passport = require('passport');
var expressLayouts = require('express-ejs-layouts');
var underscore = require('underscore');
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
   res.render('index', {response_login: null,  response_registro: null});
});

app.get('/login',
  passport.authenticate('local', {failureRedirect: '/error'}),
  function(req,res) {
    console.log("Login exitoso");
    console.log("Req.admin:"+req.user.Admin);
    if(req.user.Admin == true)
    {
        res.redirect('/administracion');
    }
    else
    {
      console.log("Usuario del montón");
      res.render('home');
    }
  }
);

app.post('/registro', function(req,res)
{
  console.log("/registro");
  controlUsuario.registrarse(
  {
    Nombre: req.body.nombreRegistro,
    Apellidos: req.body.apellidosRegistro,
    Usuario: req.body.usernameRegistro,
    Password: req.body.passwordRegistro
  }, (err, response)=>
  {
    if(err)
      throw err;

    res.render('index', {response_login: null,  response_registro: response});
  });
});

app.get('/administracion',function(req,res)
{
  console.log("Administración");

  // Waspmote.find({},(err,datos)=>
  // {
  //     if(err)
  //       throw err;
  //
  //     console.log("Waspmotes del sistema:"+JSON.stringify(datos));
  //     // console.log("Template:"+-underscore.template(waspmotesTemplate,{waspmotes: datos}));
  //
  // });
  var dataWaspmotes;
  var dataUsers;
  controlWaspmote.getData((err,datos)=>
  {
    if(err)
      throw err;
    dataWaspmotes = datos;
    controlUsuario.getData((err,datos)=>
    {
      if(err)
        throw err;
      dataUsers = datos;
      res.render("administracion.ejs", { admin: req.user, waspmotes: dataWaspmotes, usuarios: dataUsers});
    });

  });
});

app.get('/geo_waspmotes', function(req,res)
{
  console.log("Server geo_waspmotes:");
  controlWaspmote.getData((err,datos)=>
  {
    if(err)
      throw err;
    if(datos != null)
      res.send({waspmotes: datos});
  });
});

app.get('/borrar/:id',function(req,res)
{
  console.log("Borrando Waspmote con id:"+req.params.id);
  controlWaspmote.eliminar(req.params.id, (err, res)=>
  {
        console.log("Err:"+err);
        console.log("Datos:"+res);

        if(err)
          throw err;
  });
  res.redirect('/administracion');
});

app.get('/borrarUser/:id',function(req,res)
{
  console.log("Borrando User con id:"+req.params.id);
  controlUsuario.eliminar(req.params.id, (err, res)=>
  {
        console.log("Err:"+err);
        console.log("Datos:"+res);

        if(err)
          throw err;
  });
  res.redirect('/administracion');
});

app.post('/insertar_waspmote', function(req, res)
{
    console.log("Insertando Waspmote...");
    console.log("Mac:"+req.body.waspmote_mac);
    console.log("Latitud:"+req.body.waspmote_latitud);
    console.log("Longitud:"+req.body.waspmote_longitud);
    console.log("Comentarios:"+req.body.waspmote_comentarios);
    console.log("Estado:"+req.body.optradio);

    var new_waspmote = new Object(
    {
      waspmote_mac: req.body.waspmote_mac,
      waspmote_latitud: req.body.waspmote_latitud,
      waspmote_longitud: req.body.waspmote_longitud,
      waspmote_comentarios: req.body.waspmote_comentarios,
      waspmote_bateria: req.body.waspmote_bateria,
      waspmote_estado: req.body.optradio
    });

    controlWaspmote.insertar(new_waspmote, (err,nueva_waspmote)=>
    {
        if(err)
          throw err;

        console.log("Nueva waspmote:"+JSON.stringify(nueva_waspmote));
        res.redirect('/administracion');
    });
});

app.get('/insertar_medida',function(req,res)
{
  //Verificar waspmote
// http://localhost:3000/insertar_medida?Temperatura=21&Humedad=1&Presion=2&ContaminantesAire=3&COLevel=4&CO2Level=5
  console.log("Insertando medida...");
  controlWaspmote.siregistrada(req.query.MAC, (err,id)=>
  {
    if(err)
    {
      console.error(err);
      res.redirect('/');
    }
      //Comunicar al administrador del sistema.
    console.log("Registrando medida para Waspmote:"+id);

    if(id != null)
    {
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
          }).then(()=>{
              res.redirect('/');
          });
      });
    }
    });
});

app.get('/error', (req,res)=>
{
    res.render('error');
});

app.get('/actualizar_waspmote', (req,res)=>
{
  console.log("Server actualizar_waspmote");
  console.log("Datos recibidos:"+JSON.stringify(req.query.data));
  controlWaspmote.actualizar(req.query.data, (response)=>
  {
    res.send(response);
  });

});

app.get('/logout',function(req,res){
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

app.get('/registro', function(req,res)
{
    let usu = new Usuario({
      Usuario: req.query.Usuario,
      Password: req.query.Password
    });
    usu.save((err)=>
    {
      if(err)
        throw err;
      console.log(`Creado ${usu}`);
    });
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

"use strict";

var express = require('express');
var app = express();
var path = require('path');
// var basePath = process.cwd();
var passport = require('passport');
var expressLayouts = require('express-ejs-layouts');
var LocalStrategy = require('passport-local').Strategy;

var estructura = require(path.join(__dirname,'models','bd.js'));
// const Waspmote = estructura.Waspmote;
// const Medida = estructura.Medida;
// const Usuario = estructura.Usuario;

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
//Promesas

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

app.get('/get_mediciones', function(req,res)
{
  console.log("Server: /geo_mediciones");
  controlWaspmote.getMedidas(req.query.id,(err,data)=>
  {
    if(err)
      throw err;
    if(data!=null)
    {
      console.log("Server data:"+JSON.stringify(data));
      res.send({medidas:data});
    }
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
  
  var url = require('url');
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;

  console.log("url:"+req.url);
  console.log("query:"+JSON.stringify(query));
  
  controlWaspmote.insertarMedida(query, (err,nuevaMedida)=>
  {
    if(err)
    {
      console.error("Medida no guardada correctamente. Error:"+err);
      return res.status(500).send(err);
    }
      
    if(nuevaMedida != null)
    {
      console.log("Medida guardada correctamente:"+JSON.stringify(nuevaMedida));
      res.status(200).send("Medida guardada correctamente...");
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

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

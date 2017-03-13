
"use strict";

var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Test');

var db=mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
  console.log("We are connected!");
});

const Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
    Nombre: String,
    Apellidos: String,
    Usuario: { type: String, required: true, unique: true },
    Password: { type: String, required: true , set: password => bcrypt.hashSync(password)},
    Admin: Boolean,
    Creado: Date
}, {collection: "usuarios"});

// UsuarioSchema.pre('save',(next) => {
//     console.log("preeee");
//     var user = this;
//
//     var hash = bcrypt.hashSync(user.Password);
//     console.log("hash:"+hash);
//     user.Password = hash;
//
//     console.log("User new:"+JSON.stringify(user));
//     return next();
// });

// UsuarioSchema.methods.verifyUser = ((username, password, cb) =>
// {
//   console.log("Accedi");
//   Usuario.find({Usuario: username}, (err,datos)=>
//   {
//     if(err)
//       return cb(err, null);
//
//     if(bcrypt.compareSync(password, datos.Password))
//     {
//       return cb(null, datos);
//     }
//     else
//     {
//       return cb("Password incorrecto", null);
//     }
//   });
// });

const WaspmoteSchema = new Schema({
    Latitud: Number,
    Longitud: Number,
    Estado: Boolean,
    LevelBattery: {
      type: Number,
      min: 0,
      max: 100
    },
    FechaAlta: Date,
    Comentarios: String,
    MAC: { type: String, required: true, unique: true, dropDups: true }
},{collection:"waspmotes"});

const MedidaSchema = new Schema({
    Temperatura: Number,
    Humedad: Number,
    Presion: Number,
    ContaminantesAire: Number,
    COLevel: Number,
    CO2Level: Number,
    Fecha: Date,
    _creator: [{type: Schema.Types.ObjectId, ref: "Waspmote"}]
}, {collection:"medidas"});

const Usuario = mongoose.model('Usuario', UsuarioSchema);
const Waspmote = mongoose.model('Waspmote', WaspmoteSchema);
const Medida = mongoose.model('Medida', MedidaSchema);

//Provisional pa testeo
Usuario.remove({}, (err)=>
{
    let admin = new Usuario({
      Nombre: "Josue",
      Apellidos: "Toledo Castro",
      Usuario: "JosueTC94",
      Password: "Cacahuete",
      Admin: true,
      Creado: Date.now()
    });

    admin.save((err) =>    // admin.save((err) =>
    {
      if(err)
        throw err;

      console.log(`Creado ${admin}`);
    });
});

Waspmote.remove({}, (err)=>
{
  Medida.remove({}, (err)=>
  {
    let wasp1 = new Waspmote(
    {
        Latitud: -25.363,
        Longitud: 131.044,
        LevelBattery: 58,
        Estado: true,
        FechaAlta: new Date('07.03.2017'),
        Comentarios: "El dispositivo se encuentra en un ambiente muy activo y tormentoso",
        MAC: "MAC1"
    });

    wasp1.save((err)=>
    {
      if(err)
      {
        throw err;
      }

      console.log(`Creado ${wasp1}`);
      console.log(`Id: ${wasp1._id}`);

      let med1 = new Medida({
          Temperatura: 22,
          Humedad: 1111111,
          Presion: 2222222,
          ContaminantesAire: 33333333,
          COLevel: 4444444,
          CO2Level:55555555,
          _creator: wasp1._id
      });

      med1.save((err)=>
      {
        if(err) console.log("Error:"+err);
        console.log(`Creado por ${med1}`);
      }).then(()=>
      {
          Medida
            .findOexports.Usuario = UsuarioSchemane({
              Temperatura: 22,
              Humedad: 1111111,
              Presion: 2222222,
              ContaminantesAire: 33333333,
              COLevel: 4444444,
              CO2Level:55555555,
              Fecha: new Date('01.02.2012')
            })
            .populate('_creator')
            .exec((err,medida)=>
            {
              if(err) return console.log(err);
            }).then(()=>{});
      });
    });
  });
});

exports.Usuario = Usuario;
exports.Waspmote = Waspmote;
exports.Medida = Medida;

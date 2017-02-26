
"use strict";

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Test');

var db=mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
  console.log("We are connected!");
});

const Schema = mongoose.Schema;
const WaspmoteSchema = new Schema({
    Latitud: Number,
    Longitud: Number,
    LevelBattery: {
      type: Number,
      min: 0,
      max: 100
    },
    MAC: String
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

const Waspmote = mongoose.model('Waspmote', WaspmoteSchema);
const Medida = mongoose.model('Medida', MedidaSchema);

let wasp1 = new Waspmote(
  {
      Latitud: -17.345788,
      Longitud: -20.463736,
      LevelBattery: 58,
      MAC: "MAC1"
  }
);

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
          .findOne({Temperatura: 22,
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

exports.Waspmote = Waspmote;
exports.Medida = Medida;

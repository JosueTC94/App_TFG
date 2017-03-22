/*
 *   ------------  [Ga_v30_01] - Temperature, Humidty and Pressure  --------------
 *
 *   Explanation: This example read the temperature, humidity and
 *   pressure values from BME280 sensor
 *
 *   Copyright (C) 2016 Libelium Comunicaciones Distribuidas S.L.
 *   http://www.libelium.com
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *   Version:           3.0
 *   Design:            David Gascón
 *   Implementation:    Ahmad Saad
*/

// Library include
#include <WaspSensorGas_v30.h>
#include <WaspFrame.h>
#include <Wasp4G.h>


// APN settings
///////////////////////////////////////
char apn[] = "orangeworld";
char login[] = "orange";
char password[] = "orange";
///////////////////////////////////////


// SERVER settings
///////////////////////////////////////
char host[] = "tfg2016-2017-josuetc94.c9users.io";
uint16_t port = 8080;
char resource[1];
///////////////////////////////////////

uint8_t error;

/////////////////////////////////////////////////
// GPS Variables
uint8_t errorGPS;
uint8_t gps_status;
float gps_latitude;
float gps_longitude;
uint32_t previous;

APSensorClass APPSensor(SOCKET_7); //  Conectamos en el Socket 7

float Temperature; // Stores the temperature in ºC
float Humidity;     // Stores the realitve humidity in %RH
float Pressure;    // Stores the pressure in Pa


//Acelerometro
uint8_t status;
int x_acc;
int y_acc;
int z_acc;

char node_ID[] = "Probando Sensores";

// CO Sensor must be connected physically in SOCKET_4
COSensorClass COSensor; 
CO2SensorClass CO2Sensor;

// Concentratios used in calibration process
#define POINT1_PPM_CO 100.0   // <--- Ro value at this concentration
#define POINT2_PPM_CO 300.0   // 
#define POINT3_PPM_CO 1000.0  // 

// Calibration resistances obtained during calibration process
#define POINT1_RES_CO 230.30 // <-- Ro Resistance at 100 ppm. Necessary value.
#define POINT2_RES_CO 40.665 //
#define POINT3_RES_CO 20.300 //

float concentrationsCO[] = { POINT1_PPM_CO, POINT2_PPM_CO, POINT3_PPM_CO };
float resValuesCO[] =      { POINT1_RES_CO, POINT2_RES_CO, POINT3_RES_CO };

// Concentratios used in calibration process (PPM Values)
#define POINT1_PPM_CO2 350.0  //   <-- Normal concentration in air
#define POINT2_PPM_CO2 1000.0
#define POINT3_PPM_CO2 3000.0

// Calibration vVoltages obtained during calibration process (Volts)
#define POINT1_VOLT_CO2 0.300
#define POINT2_VOLT_CO2 0.350
#define POINT3_VOLT_CO2 0.380

float concentrationsCO2[] = { POINT1_PPM_CO2, POINT2_PPM_CO2, POINT3_PPM_CO2 };
float voltagesCO2[] =       { POINT1_VOLT_CO2, POINT2_VOLT_CO2, POINT3_VOLT_CO2 };

void setup()
{

  //////////////////////////////////////////////////
  // 1. sets operator parameters
  //////////////////////////////////////////////////
  _4G.set_APN(apn, login, password);

  //////////////////////////////////////////////////
  // 2. Show APN settings via USB port
  //////////////////////////////////////////////////
  _4G.show_APN();

  
  // Concentratios used in calibration process (in PPM)
  APPSensor.concentrations[POINT_1] = 10.0;  // <--- Ro value at this concentration
  APPSensor.concentrations[POINT_2] = 50.0 ;  
  APPSensor.concentrations[POINT_3] = 100.0; 
  
//  // Calibration resistances obtained during calibration process (in Kohms)
  APPSensor.values[POINT_1] = 45.25; // <-- Ro Resistance at 100 ppm. Necessary value.
  APPSensor.values[POINT_2] = 25.665;  
  APPSensor.values[POINT_3] = 2.300;
  
  // Define the number of calibration points
  APPSensor.numPoints = 3;
//  
  COSensor.setCalibrationPoints(resValuesCO, concentrationsCO, 3);
//  
  APPSensor.setCalibrationPoints();

  CO2Sensor.setCalibrationPoints(voltagesCO2, concentrationsCO2, 3);
  
  USB.ON();

//  // Estableciendo ID de Waspmote
//  frame.setID(node_ID);  
  
  USB.println(F("Calculando los siguientes parametros:"));
  USB.print("1.-Temperatura, humedad y presión atmosférica.\n");
  USB.print("2.-Contaminantes del aire.\n");
  USB.print("3.-Acelerometro.\n");
  
  ///////////////////////////////////////////
  // 1. Turn on the board
  ///////////////////////////////////////////     
  Gases.ON(); //Activando Gases Board
  ACC.ON(); //Activando Acelerómetro
  APPSensor.ON(); //Activando sensor de Air Pollutions
  COSensor.ON(); //ACtivando sensor de CO
  CO2Sensor.ON();
  
  delay(100);   
}

void loop()
{

  //PRIMERO CAPTURAMOS LOS DATOS
  // Temperatura, Presión y Humedad
  Temperature = Gases.getTemperature();
  Humidity = Gases.getHumidity();
  Pressure = Gases.getPressure();

  //Impresión de resultados
  USB.print(F("Temperature: "));
  USB.print(Temperature);
  USB.print(F(" Celsius Degrees |"));
  
  USB.print(F(" Humidity : "));
  USB.print(Humidity);
  USB.print(F(" %RH"));

  USB.print(F(" Pressure : "));
  USB.print(Pressure);
  USB.print(F(" Pa"));
  
  USB.println();
  USB.println();
//  
  //Sensor AP1: Air Pollutions
  float APPVol = APPSensor.readVoltage();         // Voltage value of the sensor
  float APPRes = APPSensor.readResistance();      // Resistance of the sensor
  float APP_PPM = APPSensor.readConcentration();  // PPM value of AP1

  // Impresión de resultados
  USB.print(F("Air Pollutans Sensor Voltage: "));
  USB.print(APPVol);
  USB.print(F(" V |"));

//  // Print of the results
  USB.print(F(" Air Pollutans Sensor Resistance: "));
  USB.print(APPRes);
  USB.print(F(" Ohms |"));

  USB.print(F(" Air Pollutans concentration Estimated: "));
  USB.print(APP_PPM);
  USB.println(F(" ppm"));
  
  USB.println();
//  
  float COVol = COSensor.readVoltage();          // Voltage value of the sensor
  float CORes = COSensor.readResistance();       // Resistance of the sensor
  float COPPM = COSensor.readConcentration(); // PPM value of CO

  
//  // Print of the results
  USB.print(F("CO Sensor Voltage: "));
  USB.print(COVol);
  USB.print(F(" mV |"));

  // Print of the results
  USB.print(F(" CO Sensor Resistance: "));
  USB.print(CORes);
  USB.print(F(" Ohms |"));

  USB.print(F(" CO concentration Estimated: "));
  USB.print(COPPM);
  USB.println(F(" ppm"));

  USB.println();

//  // Voltage value of the sensor
  float CO2Vol = CO2Sensor.readVoltage();
  // PPM value of CO2
  float CO2PPM = CO2Sensor.readConcentration();

  // Print of the results
  USB.print(F("CO2 Sensor Voltage: "));
  USB.print(CO2Vol);
  USB.print(F("volts |"));
  
  USB.print(F(" CO2 concentration estimated: "));
  USB.print(CO2PPM);
  USB.println(F(" ppm"));

  
  USB.println();
//  
  int levelBattery = PWR.getBatteryLevel();
  int voltageBattery = PWR.getBatteryVolts();
  USB.print(F("Nivel de Bateria: "));
  USB.print(levelBattery);
  USB.print(F("% |"));
  USB.print(F(" Battery Voltage: "));
  USB.print(voltageBattery);
  USB.println(F(" volts"));
  USB.println();

  //ENVIAMOS LOS DATOS
  error = _4G.ON();


//    float Temperatura = 21;
//    float Humedad = 100.1234;
//    float Presion = 100.1234;
//    float AP1 = 100.1234;
//    float COLevel = 100.1234;
//    float CO2Level = 100.1234;
    float Latitud = 17.123;
    float Longitud = 17.123;
    
    char Temp[20];
    char Hum[20];
    char Pres[20];
    char MAC[] = "MAC1";
    char Ap1[20];
    char CONivel[20];
    char CO2Nivel[20];
    char Lat[20];
    char Lon[20];
    
    Utils.float2String(Temperature,Temp,2);
    Utils.float2String(Humidity, Hum, 5);
    Utils.float2String(Pressure, Pres, 5);     
    Utils.float2String(APP_PPM,Ap1,5);
    Utils.float2String(COPPM, CONivel, 5);
    Utils.float2String(CO2PPM,CO2Nivel, 5);
    Utils.float2String(Latitud,Lat,5);
    Utils.float2String(Longitud,Lon,5);
    
    sprintf(resource,"/insertar_medida?T=%s&H=%s&P=%s&MAC=%s&Bat=%d&AP1=%s&CO=%s&CO2=%s&Lat=%s&Lon=%s",Temp,Hum,Pres,MAC,levelBattery,Ap1,CONivel,CO2Nivel,Lat,Lon);
//  delay(2000);

  if (error == 0)
  {
    USB.println(F("1. 4G module ready..."));
    error = _4G.enterPIN("1572");
    USB.println(error,DEC);
    USB.println("Pin entered. Now Checking connenction");
    error = _4G.checkConnection(240);
    USB.println(error,DEC);
    USB.println("Connection checked");
    
    ////////////////////////////////////////////////
    // 2. HTTP GET
    ////////////////////////////////////////////////

    USB.print(F("2. Getting URL with GET method..."));

    // send the request
    error = _4G.http( Wasp4G::HTTP_GET, host, port, resource);

    // Check the answer
    if (error == 0)
    {
      USB.print(F("Done. HTTP code: "));
      USB.println(_4G._httpCode);
      USB.print("Server response: ");
      USB.println(_4G._buffer, _4G._length);
    }
    else
    {
      USB.println(error);
      USB.print(F("Failed. Error code: "));
      USB.println(error, DEC);
    }
    
  }
  else
  {
    // Problem with the communication with the 4G module
    USB.println(F("1. 4G module not started"));
    USB.print(F("Error code: "));
    USB.println(error, DEC);
  }
  
  delay(2000);
}
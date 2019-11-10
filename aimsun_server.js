var AIMSUN_TMS_PROTO_PATH = __dirname + '/proto/aimsun_tms.proto';

var testDataFactory = require('./modules/test_data_factory.js');
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');

  var extendedClockTime = {
    time: '15004515',
	detailedTime : '1558930090238'
  };

// folder for our mock data
var sensorDataFile =  'D:/aimsun-gitlab/aimsun-adapter/Concert-Life/data/sensorData1.json';
var kpiFile        =  'D:/aimsun-gitlab/aimsun-adapter/Concert-Life/data/sensorData1.json';
var d =20; 

var livePackageDefinition = protoLoader.loadSync(
  AIMSUN_TMS_PROTO_PATH,
  {keepCase: true,
   longs: String,
   enums: String,
   defaults: true,
   oneofs: true
  });

var aimsun_controller_proto = grpc.loadPackageDefinition(livePackageDefinition).AimsunController;

/**Login method implemented to update proto
*/
function login(call , callback){
  var request = call.request;
  console.log('request:', request);
  var response = 'fb339152-d2e8-11e9-bb65-2a2ae2dbcce4';	
  callback(null, response);
}

/**Logout method implemented to update proto
*/	
function logout(call , callback){
  var request = call.request;
  console.log('request:', request);
  var response = 'Success';	
  callback(null, response);
}
	

//#region rpc methods
 /**
 * Implements the latestSimulationPrediction  RPC method
 * Returns the date of the latest simulation prediction (stored in LatestPredictionReply)
 */
  function  latestSimulationPrediction(call, callback){
    var response = dateTimeNowResponse();
    callback(null, response);
  }

   /**
 * Implements the simulationPrediction  RPC method
 * Returns the simulation prediction for a given date (streamed in SensorData)
 */
  function simulationPrediction(call)
  {
    sendSensorDataResponseByTime(call);
  }

 /**
 * Implements the latestAnalyticalPrediction  RPC method
 * Returns the date of the latest analytical prediction (stored in LatestPredictionReply)
 */
function  latestAnalyticalPrediction(call, callback){
  var response = dateTimeNowResponse();
  callback(null, response);
}


    /**
 * Implements the analyticalPrediction  RPC method
 * Returns the analytical prediction for a given date (streamed in SensorData)
 */
function analyticalPrediction (call){
  sendSensorDataResponseByTime(call);
}

/**
 * Implements the simulationPredictionKPIs  RPC method
 * Returns the KPIs for an simulation prediction for the requested time
 */
function simulationPredictionKPIs(call, callback) {
  var when = call.request.time;
  console.log('When:', when);
  sendKpisResponse(callback);
}


/**
 * Implements the analyticalPredictionKPIs  RPC method
 * Returns the KPIs for an analytical prediction for the requested time
 */
function analyticalPredictionKPIs(call, callback) {
  var when = call.request.when;
  console.log('When:', when);
  sendKpisResponse(callback);
}


/**
 * Implements the startEvaluation  RPC method
 * Starts the evaluation of several Response plans (with a collection of scenarios and an optional do nothing.)
 * Returns the evaluation information: 
 * ( StartEvaluationRequest : The pack id containing all the simulations, StartEvaluationReply: Ids and associated response plan for each simulation)
*/
function startEvaluation(call, callback) {
  var request = call.request;
  console.log('request:', request);
  var response  ={ StartEvaluationReply: "packId", EvaluationSim: ["simulationId","scenarioId"] };
  var simulations = [];
  simulations.push({simulationId:"1",scenarioId:"1"});
  var StartEvaluationReply  ={ packId: "1", simulations};
  console.log(StartEvaluationReply);
  callback(null, StartEvaluationReply);
}


/**
 * Implements the evaluationStatus  RPC method
 * Returns the status of all the evaluations under a pack: 
 * ( EvaluationStatusReply : the simulation id, the percentage of the task from 0 to 100 (completed) )
*/
function evaluationStatus(call, callback) {
  var packId = call.request.packId;
  console.log('packId:', packId);
   var simulations = [];
   d = d +10;
   
 // simulations.push({simulationId:"1_1",percentage:"30", status:"Failed",errorMessage : "Response Plan not found"});
  simulations.push({simulationId:"2",percentage: d});
  var EvaluationStatusReply  = { packId: "1", simulations};
  callback(null, EvaluationStatusReply);
};
	
  
/**
 * Implements the cancelEvaluation  RPC method
 * Cancels all the evaluations under a pack
*/
function cancelEvaluation(call, callback) {
  var packId = call.request.packId;
  console.log('cancelled  packId:', packId);
callback(null, '');
}


/**
 * Implements the simulatedEvaluation  RPC method
 * Returns the simulated data for an evaluation (streamed in SensorData)
 * 	SimulatedEvaluationRequest : simulationId , VariableType	, ObjectType
*/
function simulatedEvaluation(call, callback) {
  var simulationId = call.request.simulationId;
  var variableType = call.request.variable;
  var objectType = call.request.objectType;

  console.log('simulationId:', simulationId);
  console.log('VariableType:', variableType);
  console.log('ObjectType:', objectType);

  var sensorDataList = new testDataFactory().readDataFromJson(sensorDataFile);
	console.log("no valid sensor data", sensorDataList);

  for (var i = 0; i < sensorDataList.length; i++) {
    var sensorData = sensorDataList[i];
    //if (sensorData.when >= startTime) { //only write the sensors from start_time on
      call.write(sensorData);
   // }
    //else{
    //  console.log("no valid sensor data", sensorData);
    //}
  }
  call.end();

}


/**
 * Implements the simulatedEvaluationKPIs  RPC method
 * Returns the KPIs for requested evalutaion
 * SimulatedEvaluationRequest : simulationId , VariableType	, ObjectType
 */
function simulatedEvaluationKPIs(call, callback) {
	console.log('Close');
  var simulationId = call.request.simulationId;
  var variableType = call.request.variable;
  var objectType = call.request.objectType;
console.log('call.request.variable: ' ,call.request.variable);
  console.log('simulationId:', simulationId);
  console.log('VariableType:', variableType);
  console.log('ObjectType:', objectType);

  sendKpisResponse(callback);
}


	/*! Sets the now time, for testing
  */
 function setNowTime(call, callback) {
  var when = call.request.when;
   extendedClockTime = {
    time: when,
	detailedTime : when
  };
  
  console.log('when:', extendedClockTime);
 }

 
	/*! Get the current time, for testing
  */
 function getNowTime(call, callback) {
  console.log("called time get now");
  callback(null, extendedClockTime);
 }
 
 	/*!  Check if the server is running.
  */
function ping(call, callback) {
     console.log("client called ping");
 //   return callback({
//  code: 400,
//  message: "invalid input",
 // status: grpc.status.INTERNAL
//});
callback(null, "");
 }


 
//#endregion

//#region responses
 /*returns the current time
 */
 function dateTimeNowResponse()
 {
  var time = Date.now();
  console.log('when:', time);
  var response  = {when: time};
  return response;
 }

 
 /*returns the current time
 */
function sendKpisResponse(callback)
{
 var response  = { kpis: new testDataFactory().readDataFromJson(kpiFile)};
 callback(null, response);
}

 /*sends the sensorData as stream for the requested time
 */
function sendSensorDataResponseByTime(call)
{
  var startTime = call.request.when;
  var sensorDataList = new testDataFactory().readDataFromJson(sensorDataFile);
	console.log("no valid sensor data", sensorDataList);

  for (var i = 0; i < sensorDataList.length; i++) {
    var sensorData = sensorDataList[i];
    //if (sensorData.when >= startTime) { //only write the sensors from start_time on
      call.write(sensorData);
   // }
    //else{
    //  console.log("no valid sensor data", sensorData);
    //}
  }
  call.end();
}


//#endregion

//#region server setup

/**
 * Get a new server with the handler functions in this file bound to the methods
 * it serves.
* @return {Server} The new server object
 */
function getServer() {
  var server = new grpc.Server();
  server.addService(aimsun_controller_proto.Live.service,
    {
      latestSimulationPrediction : latestSimulationPrediction,
      simulationPrediction : simulationPrediction,
      latestAnalyticalPrediction: latestAnalyticalPrediction,
      analyticalPrediction: analyticalPrediction,
      simulationPredictionKPIs: simulationPredictionKPIs,
      analyticalPredictionKPIs: analyticalPredictionKPIs,
      startEvaluation: startEvaluation,
      evaluationStatus: evaluationStatus,
      cancelEvaluation: cancelEvaluation,
      simulatedEvaluation,simulatedEvaluation,
      simulatedEvaluationKPIs, simulatedEvaluationKPIs,
      setNowTime, setNowTime,
      getNowTime, getNowTime,
      ping,ping,
	  login,login,
	  logout,logout
      });
  return server;
}
//#endregion

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
if (require.main === module) {
  // If this is run as a script, start a server on an unused port
  var server = getServer();
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
  console.log ("Server started...");
}

exports.getServer = getServer;



 

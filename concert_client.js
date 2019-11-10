
var GOOGLE_PROTO_PATH = __dirname + '/proto/google/protobuf/empty.proto';
var AIMSUN_LIVE_PROTO_PATH = __dirname + '/proto/aimsun_tms.proto';

let grpc = require('grpc');
let protoLoader = require('@grpc/proto-loader');

var livePackageDefinition = protoLoader.loadSync(
  AIMSUN_LIVE_PROTO_PATH,
      {keepCase: true,
       longs: String,
       enums: String,
       defaults: true,
       oneofs: true
      });

      
var goolePackageDefinition = protoLoader.loadSync(
  GOOGLE_PROTO_PATH,
      {keepCase: true,
       longs: String,
       enums: String,
       defaults: true,
       oneofs: true
      });

var live_package = grpc.loadPackageDefinition(livePackageDefinition);
var google_package = grpc.loadPackageDefinition(goolePackageDefinition);
var aimsun_controller_package = live_package.AimsunController;

var client = new aimsun_controller_package.Live('localhost:50051', grpc.credentials.createInsecure());  
var empty = google_package.google.protobuf.Empty;



function latestSimulationPrediction() {
  client.latestSimulationPrediction(empty, function(err, response) {
    if (err) {
      console.log('latestSimulationPrediction error:', err);
    }
    else {
      var time = parseInt(response.when);
      var date_time = new Date(time).toString();
      console.log('latestSimulationPrediction response:', response);
      console.log('latestSimulationPrediction When:', date_time);
    }
  })
};


function simulationPrediction() {
 
  var startTime = 1552030800000; // 08.03.2019
  console.log("start time: ", new Date(startTime).toString());
  var call = client.simulationPrediction(startTime);  
  // todo: simulationPrediction(call, startTime);
};



function analyticalPredictionKPIs() {
  
  var startTime = 1552030800000; // 08.03.2019
  console.log("start time: ", new Date(startTime).toString());
  var when = {when: startTime};

  client.analyticalPredictionKPIs(when, function(err, response) {
  if (err) {
    console.log('analyticalPredictionKPIs error:', err);
  } else {
    console.log('analyticalPredictionKPIs success:');}
    for (var i = 0; i < response.kpis.length; i++) {
      var kpi = response.kpis[i];
      console.log('kpi name:', kpi.name);
      console.log('kpi name:', kpi.indicator);
    }
  });
}

/**
 * Run all of the demos in order
 */
function main() {
    latestSimulationPrediction(),
    simulationPrediction()
      // latestAnalyticalPrediction(),
      // analyticalPrediction()
      // simulationPredictionKPIs(),
      analyticalPredictionKPIs()
      // startEvaluation(),
      // evaluationStatus(),
      // cancelEvaluation(),
      // simulatedEvaluation(),
      // simulatedEvaluationKPIs(),
      // setNowTime(),
      // getNowTime(),
      // ping()
}

if (require.main === module) {
  main();
}


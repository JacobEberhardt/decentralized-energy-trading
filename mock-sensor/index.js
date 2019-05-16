const { host, port, sensorInterval } = require("../household-server-config");
const https = require("https");

console.log(
  `Starting Mock-Sensor\nSending to http://${host}:${port} with an interval of ${sensorInterval}ms`
);

const data = (samples, min, max) => {
  let mockData = [];
  for (let i = 0; i < samples; i++) {
    let rndm = Math.random() * (max - min) + min;
    // rounding the samples
    rndm = Math.round(rndm * 100) / 100;
    mockData.push(rndm);
  }
  return mockData;
};

const options = {
  hostname: host,
  port: port,
  method: "PUT",
  headers: {
    "Content-Type": "application/json"
  }
};

setInterval((host, port) => {
  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on("data", d => {
      process.stdout.write(d);
    });
  });

  req.on("error", error => {
    console.error(error);
  });
  console.log("Sending data");
  req.write(JSON.stringify(data(2, 0, 100)));
  req.end();
}, 5000);

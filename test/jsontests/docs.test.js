const net = require("net");
const request = require("supertest");
const constants = require("./constants.json");
const fs = require('fs');

const results = [];

//set up tests 
beforeAll(done => {
    //create server
    var server = net.createServer();

    //confirm jar is working
    server.once('error', function(err) {
        if (err.code === 'EADDRINUSE') {
          server.close();
          done();
        }
      });
      
      //make sure server is listening and indicate failure
      server.once('listening', function() {
        server.close();
        throw new Error("No instance running")
      });
      
      //tell server to listen
      server.listen(constants.PORT);
});

describe("/docs", () => {

    describe("GET", () => {
        it("returns nothing with no entries", async() => {

          const startTime = new Date();
          const response = await request(constants.HOST).get("/docs").send();
          const endTime = new Date();

          results.push({
            testName: "GET Return Nothing",
            duration: endTime - startTime,
            statusCode: response.statusCode,
            objectCount: 1
          });

          expect(response.statusCode).toEqual(200);
           
          expect(response.type).toEqual("text/html");
        });
    });
});

afterAll(() => {
  let csvContent = "Test Name,Duration (ms),Status Code,Object Count\n" +
      results.map(e => `${e.testName},${e.duration},${e.statusCode},${e.objectCount}`).join("\n");

  fs.writeFileSync('performance_results_docs.test.csv', csvContent);
});

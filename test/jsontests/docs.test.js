const net = require("net");
const request = require("supertest");
const constants = require("./constants.json");

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
           const response = await request(constants.HOST).get("/docs").send();
           expect(response.statusCode).toEqual(200);
           
           expect(response.type).toEqual("text/html");
        });
    });
});

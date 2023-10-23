const net = require("net");
const request = require("supertest");
const constants = require("./constants.json");

let ourTodo;
let ourProject;

// set up tests 
beforeAll(done => {
    // create server to listen to ports
    var server = net.createServer();

    // we actually want this error because it means that something is running at the port
    // that we want to listen to
    server.once('error', function(err) {
        if (err.code === 'EADDRINUSE') {
          // close the server
          server.close();
          // callback to end beforeAll method, we have confirmed jar is working
          done();
        }
      });
      
      // if server is able to listen at the port that means there's nothing running there
      server.once('listening', function() {
        // close the server
        server.close();
        // throw error so this file of tests is cancelled, error will print and jest will
        // indicate failure
        throw new Error("No instance running")
      });
      
      // tell server to listen at port that should be running api
      server.listen(constants.PORT);
});


beforeEach(async() => {
    
    const validTodoTitle = "TODO TITLE";
    const validTodoDoneStatus = false;
    const validTodoDescription = "DESCRIPTION OF TODO"

    const todoResponse = await request(constants.HOST).post("/todos").send({
        title: validTodoTitle,
        doneStatus: validTodoDoneStatus,
        description: validTodoDescription
    });

    ourTodo = todoResponse.body;

    const validProjectTitle = "PROJECT";
    const validProjectCompleted = false;
    const validProjectActive= false;
    const validProjectDescription = "DESCRIPTION OF PROJECT"

    const projectResponse = await request(constants.HOST).post("/projects").send({
        title: validProjectTitle,
        completed: validProjectCompleted,
        active: validProjectActive,
        description: validProjectDescription
    });

    ourProject = projectResponse.body;

    const postResponse = await request(constants.HOST).post(`/todos/${ourTodo.id}/tasksof`).send({
                id: ourProject.id
            });
});

afterEach(async() => { 
    
    
    await request(constants.HOST).delete(`/todos/${ourTodo.id}/tasksof/${ourProject}`);
    await request(constants.HOST).delete(`/projects/${ourProject.id}`).send();
    await request(constants.HOST).delete(`/todos/${ourTodo.id}`).send();
});


describe("/todos/:id/tasksof/:id", () => {
    describe("DELETE", () => {
        it("should delete the taskof relationship between a valid todo id and project id", async() => {
            const deleteResponse = await request(constants.HOST).delete(`/todos/${ourTodo.id}/tasksof/${ourProject.id}`);
            expect(deleteResponse.statusCode).toEqual(200);
            
            // check that relationship is actually gone
            const response = await request(constants.HOST).get(`/todos/${ourTodo.id}/tasksof`).send();
            expect(response.statusCode).toEqual(200);
            expect(response.body.projects.length).toEqual(0);
        });

        it("should not delete the taskof relationship between a valid todo id and invalid project id", async() => {
            const invalidId = -1; 

            const expectedError = `Could not find any instances with todos/${ourTodo.id}/tasksof/${invalidId}`;

            const response = await request(constants.HOST).delete(`/todos/${ourTodo.id}/tasksof/${invalidId}`).send();

            expect(response.statusCode).toEqual(404);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should delete the taskof relationship between an invalid todo id and a valid project id", async() => {
            const invalidId = -1; 

            const response = await request(constants.HOST).delete(`/todos/${invalidId}/tasksof/${ourProject.id}`).send();

            expect(response.statusCode).toEqual(400);
            expect(response.body).toEqual({});
        });
    });    
});

const net = require("net");
const request = require("supertest");
const constants = require("./constants.json");
const fs = require('fs');

const results = [];

let ourTodo;
let ourProject;

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

beforeEach(async() => {
    
    const validTodoTitle = "TODO TITLE";
    const validTodoDoneStatus = false;
    const validTodoDescription = "DESCRIPTION OF TODO"

    const todoResponse = await request(constants.HOST).post("/projects").send({
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

    await request(constants.HOST).post(`/projects/${ourProject.id}/tasksof`).send({ id: ourProject.id });
});

afterEach(async() => { 
    await request(constants.HOST).delete(`/projects/${ourProject.id}/tasks/${ourTodo}`);
    await request(constants.HOST).delete(`/projects/${ourProject.id}`).send();
    await request(constants.HOST).delete(`/todos/${ourTodo.id}`).send();
});


describe("/todos/:id/tasksof/:id", () => {
    describe("DELETE", () => {
        it("delete the instance of the relationship named tasks between project and todo using the :id", async() => {
            const startTime = new Date();
            const deleteResponse = await request(constants.HOST).delete(`/projects/${ourProject.id}/tasks/${ourTodo.id}`);
            const endTime = new Date();
            expect(deleteResponse.statusCode).toEqual(404);

            results.push({
                testName: "DELETE relationship instance tasks between project and todo",
                duration: endTime - startTime,
                statusCode: deleteResponse.statusCode,
                objectCount: 1
            });
            
            // check that relationship is actually gone
            const startTime2 = new Date();
            const response = await request(constants.HOST).get(`/projects/${ourProject.id}/tasks`).send();
            const endTime2 = new Date();

            results.push({
                testName: "GET created project",
                duration: endTime2 - startTime2,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(200);
        });

        it("should not delete the instance of the relationship named tasks between project and todo using the :id", async() => {
            const invalidId = -1; 

            const expectedError = `Could not find any instances with projects/${ourTodo.id}/tasksof/${invalidId}`;
            const startTime = new Date();

            const response = await request(constants.HOST).delete(`/projects/${ourProject.id}/tasks/${invalidId}`).send();
            const endTime = new Date();

            results.push({
                testName: "DELETE relationship instance tasks invalid",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(404);
            expect(response.body.errorMessages[0]).not.toEqual(expectedError);
        });

        it("should delete the taskof relationship between an invalid todo id and a valid project id", async() => {
            const invalidId = -1; 
            const startTime = new Date();

            const response = await request(constants.HOST).delete(`/projects/${invalidId}/tasks/${ourTodo.id}`).send();
            const endTime = new Date();

            results.push({
                testName: "DELETE task when invalid todo ID and valid project ID",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(404);
            expect(response.body).not.toEqual({});
        });
    });    
});

afterAll(() => {
    let csvContent = "Test Name,Duration (ms),Status Code,Object Count\n" +
        results.map(e => `${e.testName},${e.duration},${e.statusCode},${e.objectCount}`).join("\n");

    fs.writeFileSync('performance_results_projectsidtasksid.test.csv', csvContent);
});
const net = require("net");
const request = require("supertest");
const constants = require("./constants.json");

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

    console.time("createTodoBeforeEachTime");
    const todoResponse = await request(constants.HOST).post("/projects").send({
        title: validTodoTitle,
        doneStatus: validTodoDoneStatus,
        description: validTodoDescription
    });
    console.timeEnd("createTodoBeforeEachTime");

    ourTodo = todoResponse.body;

    const validProjectTitle = "PROJECT";
    const validProjectCompleted = false;
    const validProjectActive= false;
    const validProjectDescription = "DESCRIPTION OF PROJECT"

    console.time("createProjectBeforeEachTime");
    const projectResponse = await request(constants.HOST).post("/projects").send({
        title: validProjectTitle,
        completed: validProjectCompleted,
        active: validProjectActive,
        description: validProjectDescription
    });
    console.timeEnd("createProjectBeforeEachTime");

    ourProject = projectResponse.body;

    console.time("postTaskOfBeforeEachTime");
    await request(constants.HOST).post(`/projects/${ourProject.id}/tasksof`).send({ id: ourProject.id });
    console.timeEnd("postTaskOfBeforeEachTime");
});

afterEach(async() => { 
    console.time("deleteProjectTaskAfterEachTime");
    await request(constants.HOST).delete(`/projects/${ourProject.id}/tasks/${ourTodo}`);
    console.timeEnd("deleteProjectTaskAfterEachTime");

    console.time("deleteProjectAfterEachTime");
    await request(constants.HOST).delete(`/projects/${ourProject.id}`).send();
    console.timeEnd("deleteProjectAfterEachTime");

    console.time("deleteTodoAfterEachTime");
    await request(constants.HOST).delete(`/todos/${ourTodo.id}`).send();
    console.timeEnd("deleteTodoAfterEachTime");
});


describe("/todos/:id/tasksof/:id", () => {
    describe("DELETE", () => {
        it("delete the instance of the relationship named tasks between project and todo using the :id", async() => {
            console.time("deleteTaskOfTime");
            const deleteResponse = await request(constants.HOST).delete(`/projects/${ourProject.id}/tasks/${ourTodo.id}`);
            console.timeEnd("deleteTaskOfTime");            
            expect(deleteResponse.statusCode).toEqual(404);
            
            // check that relationship is actually gone
            console.time("verifyDeleteTaskOfTime");
            const response = await request(constants.HOST).get(`/projects/${ourProject.id}/tasks`).send();
            console.timeEnd("verifyDeleteTaskOfTime");            
            expect(response.statusCode).toEqual(200);
        });

        it("should not delete the instance of the relationship named tasks between project and todo using the :id", async() => {
            const invalidId = -1; 

            const expectedError = `Could not find any instances with projects/${ourTodo.id}/tasksof/${invalidId}`;

            console.time("deleteTaskOfInvalidTime");
            const response = await request(constants.HOST).delete(`/projects/${ourProject.id}/tasks/${invalidId}`).send();
            console.timeEnd("deleteTaskOfInvalidTime");

            expect(response.statusCode).toEqual(404);
            expect(response.body.errorMessages[0]).not.toEqual(expectedError);
        });

        it("should delete the taskof relationship between an invalid todo id and a valid project id", async() => {
            const invalidId = -1; 

            console.time("deleteInvalidTodoTaskOfTime");
            const response = await request(constants.HOST).delete(`/projects/${invalidId}/tasks/${ourTodo.id}`).send();
            console.timeEnd("deleteInvalidTodoTaskOfTime");

            expect(response.statusCode).toEqual(404);
            expect(response.body).not.toEqual({});
        });
    });    
});

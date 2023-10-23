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
    
    const validTodoTitle = "Todo title";
    const validTodoDoneStatus = false;
    const validTodoDescription = "Description of todo"

    const todoResponse = await request(constants.HOST).post("/todos").send({
        title: validTodoTitle,
        doneStatus: validTodoDoneStatus,
        description: validTodoDescription
    });

    ourTodo = todoResponse.body;

    const validProjectTitle = "Project";
    const validProjectCompleted = false;
    const validProjectActive= false;
    const validProjectDescription = "Description of project"

    const projectResponse = await request(constants.HOST).post("/projects").send({
        title: validProjectTitle,
        completed: validProjectCompleted,
        active: validProjectActive,
        description: validProjectDescription
    });

    ourProject = projectResponse.body;
});

afterEach(async() => { 
    
    
    await request(constants.HOST).delete(`/projects/${ourProject.id}`).send();
    await request(constants.HOST).delete(`/todos/${ourTodo.id}`).send();
});

describe("/projects/:id/tasks", () => {
    describe("GET", () => {

        it("return all the todo items related to project, with given id, by the relationship named tasks", async() => {
             
            const postResponse = await request(constants.HOST).post(`/projects/${ourProject.id}/tasks`).send({
                id: ourProject.id
            });
            expect(postResponse.statusCode).toEqual(201);

            const response = await request(constants.HOST).get(`/projects/${ourProject.id}/tasks`).send();
            expect(response.statusCode).toEqual(200);
            expect(response.body.projects[0].id).toEqual(ourTodo[0].id);
            expect(response.body.projects[0].title).toEqual(ourTodo[0].title);
            expect(response.body.projects[0].completed).toEqual(ourTodo[0].doneStats.toString());
            expect(response.body.projects[0].description).toEqual(ourTodo[0].description);
			expect(response.body.projects[1].id).toEqual(ourTodo[1].id);
            expect(response.body.projects[1].title).toEqual(ourTodo[1].title);
            expect(response.body.projects[1].completed).toEqual(ourTodo[1].doneStats.toString());
            expect(response.body.projects[1].description).toEqual(ourTodo[1].description);
        });

        it("returns no tasks for unrelated project and todo", async() => {
            const response = await request(constants.HOST).get(`/projects/${ourProject.id}/tasks`).send();
            expect(response.statusCode).toEqual(200);
            expect(response.body.projects.length).toEqual(0);
        });

    });

    describe("HEAD", () => {
        it("returns JSON as default", async() => {
            const response = await request(constants.HOST).head(`/projects/${ourProject.id}/tasks`).send();

            expect(response.statusCode).toEqual(200);
            expect(response.headers["content-type"]).toEqual("application/json");
        });
    });

    describe("POST", () => {

        it("create an instance of a relationship named tasks between project instance :id and the todo instance represented by the id in the body of the message", async() => {

            const postResponse = await request(constants.HOST).post(`/projects/${ourProject.id}/tasks`).send({
                id: ourProject.id
            });

            expect(postResponse.statusCode).toEqual(201);
            // there is no response for this
            expect(postResponse.body).toEqual("");

            // use get to check if it's there
            const getResponse = await request(constants.HOST).get(`/projects/${ourProject.id}/tasks`).send();
            expect(getResponse.statusCode).toEqual(200);
			expect(response.statusCode).toEqual(200);
            expect(response.body.projects[0].id).toEqual(ourTodo[0].id);
            expect(response.body.projects[0].title).toEqual(ourTodo[0].title);
            expect(response.body.projects[0].completed).toEqual(ourTodo[0].doneStats.toString());
            expect(response.body.projects[0].description).toEqual(ourTodo[0].description);
			expect(response.body.projects[1].id).toEqual(ourTodo[1].id);
            expect(response.body.projects[1].title).toEqual(ourTodo[1].title);
            expect(response.body.projects[1].completed).toEqual(ourTodo[1].doneStats.toString());
            expect(response.body.projects[1].description).toEqual(ourTodo[1].description);
			
        });

        it("should not create tasks relation with invalid project id", async() => {
            const invalidId = -1;

            const expectedError = "Could not find thing matching value for id";

            const response = await request(constants.HOST).post(`/projects/${ourProject.id}/tasks`).send({
                id: invalidId
            });

            expect(response.statusCode).toEqual(404);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not create tasks relation with invalid project id", async() => {
            const invalidId = -1;

            const expectedError = "Could not find parent thing for relationship projects/-1/tasks";

            const response = await request(constants.HOST).post(`/projects/${invalidId}/tasks`).send({
                id: ourProject.id
            });

            expect(response.statusCode).toEqual(404);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });
    });
});

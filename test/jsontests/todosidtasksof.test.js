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

describe("/todos/:id/tasksof", () => {
    describe("GET", () => {

        it("returns tasks for related project and todo", async() => {
             
            const postResponse = await request(constants.HOST).post(`/todos/${ourTodo.id}/tasksof`).send({
                id: ourProject.id
            });
            expect(postResponse.statusCode).toEqual(201);

            const response = await request(constants.HOST).get(`/todos/${ourTodo.id}/tasksof`).send();
            expect(response.statusCode).toEqual(200);
            expect(response.body.projects[0].id).toEqual(ourProject.id);
            expect(response.body.projects[0].title).toEqual(ourProject.title);
            expect(response.body.projects[0].completed).toEqual(ourProject.completed.toString());
            expect(response.body.projects[0].active).toEqual(ourProject.active.toString());
            expect(response.body.projects[0].description).toEqual(ourProject.description);
        });

        it("returns no tasks for unrelated project and todo", async() => {
            const response = await request(constants.HOST).get(`/todos/${ourTodo.id}/tasksof`).send();
            expect(response.statusCode).toEqual(200);
            expect(response.body.projects.length).toEqual(0);
        });

    });
});

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

    console.time("postTodoBeforeEach");
    const todoResponse = await request(constants.HOST).post("/todos").send({
        title: validTodoTitle,
        doneStatus: validTodoDoneStatus,
        description: validTodoDescription
    });
    console.timeEnd("postTodoBeforeEach");
    ourTodo = todoResponse.body;

    ourTodo = todoResponse.body;

    const validProjectTitle = "Project";
    const validProjectCompleted = false;
    const validProjectActive= false;
    const validProjectDescription = "Description of project"

    console.time("postProjectBeforeEach");
    const projectResponse = await request(constants.HOST).post("/projects").send({
        title: validProjectTitle,
        completed: validProjectCompleted,
        active: validProjectActive,
        description: validProjectDescription
    });
    console.timeEnd("postProjectBeforeEach");

    ourProject = projectResponse.body;
});

afterEach(async() => { 
    console.time("deleteProjectAfterEach");
    await request(constants.HOST).delete(`/projects/${ourProject.id}`).send();
    console.timeEnd("deleteProjectAfterEach");

    console.time("deleteTodoAfterEach");
    await request(constants.HOST).delete(`/todos/${ourTodo.id}`).send();
    console.timeEnd("deleteTodoAfterEach");
});

describe("/todos/:id/tasksof", () => {
    describe("GET", () => {

        it("returns tasks for related project and todo", async() => {
             
            console.time("postTasksof");
            const postResponse = await request(constants.HOST).post(`/todos/${ourTodo.id}/tasksof`).send({
                id: ourProject.id
            });
            console.timeEnd("postTasksof");
            expect(postResponse.statusCode).toEqual(201);

            console.time("getTasksofRelated");
            const response = await request(constants.HOST).get(`/todos/${ourTodo.id}/tasksof`).send();
            console.timeEnd("getTasksofRelated");            
            expect(response.statusCode).toEqual(200);
            expect(response.body.projects[0].id).toEqual(ourProject.id);
            expect(response.body.projects[0].title).toEqual(ourProject.title);
            expect(response.body.projects[0].completed).toEqual(ourProject.completed.toString());
            expect(response.body.projects[0].active).toEqual(ourProject.active.toString());
            expect(response.body.projects[0].description).toEqual(ourProject.description);
        });

        it("returns no tasks for unrelated project and todo", async() => {
            console.time("getTasksofUnrelated");
            const response = await request(constants.HOST).get(`/todos/${ourTodo.id}/tasksof`).send();
            console.timeEnd("getTasksofUnrelated");
            expect(response.statusCode).toEqual(200);
            expect(response.body.projects.length).toEqual(0);
        });

    });
});

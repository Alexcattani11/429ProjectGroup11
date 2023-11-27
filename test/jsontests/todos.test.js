const net = require("net");
const request = require("supertest");
const constants = require("./constants.json");

let ourTodo;

//system constants when it is booting up
const DEFAULTTODO = {
    "todos": [
        {
            "id": "1",
            "title": "scan paperwork",
            "doneStatus": "false",
            "description": "",
            "tasksof": [
                {
                    "id": "1"
                }
            ],
            "categories": [
                {
                    "id": "1"
                }
            ]
        },
        {
            "id": "2",
            "title": "file paperwork",
            "doneStatus": "false",
            "description": "",
            "tasksof": [
                {
                    "id": "1"
                }
            ]
        }
    ]
};

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
    
    const validTitle = "Title";
    const validDoneStatus = false;
    const validDescription = "Description"

    console.time("createTodoBeforeEachTime");
    const response = await request(constants.HOST).post("/todos").send({
        title: validTitle,
        doneStatus: validDoneStatus,
        description: validDescription
    });
    console.timeEnd("createTodoBeforeEachTime");

    ourTodo = response.body;
});

afterEach(async() => { 
    console.time("deleteTodoAfterEachTime");
    await request(constants.HOST).delete(`/todos/${ourTodo.id}`).send();
    console.timeEnd("deleteTodoAfterEachTime");
});

describe("/todos", () => {
    describe("GET", () => {

        it("returns at least the default entry", async() => {
            console.time("getTodosDefaultEntryTime");
            const response = await request(constants.HOST).get("/todos").send();
            console.timeEnd("getTodosDefaultEntryTime");
            expect(response.statusCode).toEqual(200);
            expect(response.body.todos.includes(DEFAULTTODO.todos[0]));
            expect(response.body.todos.includes(DEFAULTTODO.todos[1]));
        });

        it("returns an entry that we put into the data", async() => {
            console.time("getTodosEntryTime");
            const response = await request(constants.HOST).get("/todos").send();
            console.timeEnd("getTodosEntryTime");            
            expect(response.statusCode).toEqual(200);
            expect(response.body.todos.includes(ourTodo));
        });
    });

    describe("POST", () => {

        it("should create todo with just title", async() => {
            const validTitle = "Title";

            console.time("createPOSTTodoJustTitleTime");
            const response = await request(constants.HOST).post("/todos").send({
                title: validTitle
            });
            console.timeEnd("createPOSTTodoJustTitleTime");

            expect(response.statusCode).toEqual(201);
            expect(response.body.id);
            expect(response.body.id > 0);
            expect(response.body.doneStatus).toEqual("false");
            expect(!response.body.decsription);

            console.time("deletePOSTTodoAfterJustTitleTime");
            await request(constants.HOST).delete(`/todos/${response.body.id}`).send();
            console.timeEnd("deletePOSTTodoAfterJustTitleTime");
        });

        it("should create todo with all params", async() => {
            const validTitle = "Title";
            const validDoneStatus = false;
            const validDescription = "Description"

            console.time("createPOSTTodoAllParamsTime");
            const response = await request(constants.HOST).post("/todos").send({
                title: validTitle,
                doneStatus: validDoneStatus,
                description: validDescription
            });
            console.timeEnd("createPOSTTodoAllParamsTime");

            expect(response.statusCode).toEqual(201);
            expect(response.body.id);
            expect(response.body.id > 0);
            expect(response.body.doneStatus).toEqual(validDoneStatus.toString());
            expect(response.body.description).toEqual(validDescription);

            console.time("deletePOSTTodoAfterAllParamsTime");
            await request(constants.HOST).delete(`/todos/${response.body.id}`).send();
            console.timeEnd("deletePOSTTodoAfterAllParamsTime");
        });

        it("should not create todo with an ID", async() => {
            const id = 99;
            const validTitle = "Title";
            const validDoneStatus = false;
            const validDescription = "Description"

            const expectedError = "Invalid Creation: Failed Validation: Not allowed to create with id";

            console.time("createPOSTTodoWithIdTime");
            const response = await request(constants.HOST).post("/todos").send({
                id,
                title: validTitle,
                doneStatus: validDoneStatus,
                description: validDescription
            });
            console.timeEnd("createPOSTTodoWithIdTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not create todo with invalid doneStatus", async() => {
            const validTitle = "Title";
            const invalidDoneStatus = 1.0;
            const validDescription = "Description";

            const expectedError = "Failed Validation: doneStatus should be BOOLEAN";

            console.time("createPOSTTodoInvalidDoneStatusTime");
            const response = await request(constants.HOST).post("/todos").send({
                title: validTitle,
                doneStatus: invalidDoneStatus,
                description: validDescription
            });
            console.timeEnd("createPOSTTodoInvalidDoneStatusTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should update the title of a todo", async() => {
            const validTitle = "New test";

            console.time("createPOSTTodoTitleTime");
            const response = await request(constants.HOST).post("/todos").send({
                title: validTitle
            });
            console.timeEnd("createPOSTTodoTitleTime");

            expect(response.statusCode).toEqual(201);
            expect(response.body.id).not.toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(ourTodo.doneStatus);
            expect(response.body.description).not.toEqual(ourTodo.description);

            console.time("deletePOSTTodoAfterTitleTime");
            await request(constants.HOST).delete(`/todos/${response.body.id}`).send();
            console.timeEnd("deletePOSTTodoAfterTitleTime");
        });

        it("should update the donestatus of a todo", async() => {
            const validStatus = true;

            console.time("updatePOSTTodoDoneStatusTime");
            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                doneStatus: validStatus
            });
            console.timeEnd("updatePOSTTodoDoneStatusTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(ourTodo.title);
            expect(response.body.doneStatus).toEqual(validStatus.toString());
            expect(response.body.description).toEqual(ourTodo.description);
        });

        it("should update the description of a todo", async() => {
            const validDescription = "New description";

            console.time("updatePOSTTodoDescriptionTime");
            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                description: validDescription
            });
            console.timeEnd("updatePOSTTodoDescriptionTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(ourTodo.title);
            expect(response.body.doneStatus).toEqual(ourTodo.doneStatus);
            expect(response.body.description).toEqual(validDescription);
        });

        it("should update a todo's id with a valid id", async() => {
            const validId = 12345567;

            console.time("updatePOSTTodoIdWithNewIdTime");
            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                id: validId
            });
            console.timeEnd("updatePOSTTodoIdWithNewIdTime");

            expect(response.statusCode).toEqual(200);
            !expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(ourTodo.title);
            expect(response.body.doneStatus).toEqual(ourTodo.doneStatus);
            expect(response.body.description).toEqual(ourTodo.description);
        });

        it("should not update todo with invalid id", async() => {
            const invalidId = true; 

            const expectedError = "Failed Validation: id should be ID";

            console.time("updatePOSTTodoIdWithInvalidIdTime");
            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                id: invalidId
            });
            console.timeEnd("updatePOSTTodoIdWithInvalidIdTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update todo with invalid title", async() => {
            const invalidTitle = ""; 

            const expectedError = "Failed Validation: title : can not be empty";

            console.time("updatePOSTTodoWithInvalidTitleTime");
            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                title: invalidTitle
            });
            console.timeEnd("updatePOSTTodoWithInvalidTitleTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update todo with invalid done status", async() => {
            const invalidDoneStatus = 1; 

            const expectedError = "Failed Validation: doneStatus should be BOOLEAN";

            console.time("updatePOSTTodoWithInvalidDoneStatusTime");
            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                doneStatus: invalidDoneStatus
            });
            console.timeEnd("updatePOSTTodoWithInvalidDoneStatusTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should update multiple fields when all valid for a given todo", async() => {
            const validTitle = "Title";
            const validStatus = false;
            const validDescription = "New description";

            console.time("updatePOSTTodoWithMultipleValidTime");
            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                title: validTitle,
                doneStatus: validStatus,
                description: validDescription
            });
            console.timeEnd("updatePOSTTodoWithMultipleValidTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(validStatus.toString());
            expect(response.body.description).toEqual(validDescription);
        });
    });

    describe("PUT", () => {

        const defaultDoneStatus = false;
        const defaultDescription = "";

        it("should update the title of a todo given a valid title, all others to default", async() => {
            const validTitle = "New title";

            console.time("updatePUTNewTitleTime");
            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                title: validTitle
            });
            console.timeEnd("updatePUTNewTitleTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(defaultDoneStatus.toString());
            expect(response.body.description).toEqual(defaultDescription);
        });

        it("should update the doneStatus of a todo given a valid status", async() => {
            const validStatus = true;
            const validTitle = "New title";

            console.time("updatePUTNewDoneStatusTime");
            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                doneStatus: validStatus,
                title: validTitle
            });
            console.timeEnd("updatePUTNewDoneStatusTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(validStatus.toString());
            expect(response.body.description).toEqual(defaultDescription);
        });

        it("should update the description of a todo", async() => {
            const validDescription = "New description";
            const validTitle = "New title";

            console.time("updatePUTNewDescriptionTime");
            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                description: validDescription,
                title: validTitle
            });
            console.timeEnd("updatePUTNewDescriptionTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(defaultDoneStatus.toString());
            expect(response.body.description).toEqual(validDescription);
        });

        it("should update a todo's id with a valid id", async() => {
            const validId = 999;
            const validTitle = "New title";

            console.time("updatePUTNewIdTime");
            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                id: validId,
                title: validTitle
            });
            console.timeEnd("updatePUTNewIdTime");

            expect(response.statusCode).toEqual(200);
            !expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(defaultDoneStatus.toString());
            expect(response.body.description).toEqual(defaultDescription);
        });

        it("should not update todo with invalid id", async() => {
            const invalidId = true; 

            const expectedError = "Failed Validation: id should be ID";

            console.time("updatePUTInvalidIdTime");
            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                id: invalidId
            });
            console.time("updatePUTInvalidIdTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update todo with invalid title", async() => {
            const invalidTitle = ""; 

            const expectedError = "Failed Validation: title : can not be empty";

            console.time("updatePUTInvalidTitleTime");
            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                title: invalidTitle
            });
            console.time("updatePUTInvalidTitleTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update other fields without a title", async() => {
            const validId = 99;
            const validStatus = true;
            const validDescription = "New description";

            const expectedError = "title : field is mandatory";

            console.time("updatePUTEmptyTitleTime");
            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                id: validId,
                doneStatus: validStatus,
                description: validDescription
            });
            console.timeEnd("updatePUTEmptyTitleTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update todo with invalid done status", async() => {
            const invalidDoneStatus = 1; 

            const expectedError = "Failed Validation: doneStatus should be BOOLEAN";

            console.time("updatePUTInvalidDoneStatusTime");
            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                doneStatus: invalidDoneStatus
            });
            console.timeEnd("updatePUTInvalidDoneStatusTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should update multiple fields when all valid for a given todo", async() => {
            const validTitle = "Title";
            const validStatus = true;
            const validDescription = "New description";

            console.time("updatePUTMultipleValidTime");
            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                title: validTitle,
                doneStatus: validStatus,
                description: validDescription
            });
            console.timeEnd("updatePUTMultipleValidTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(validStatus.toString());
            expect(response.body.description).toEqual(validDescription);
        });
    });

    describe("DELETE", () => {

        it("deletes a todo with an id", async() => {
            console.time("deleteTodoWithValidIdTime");
            const deleteResponse = await request(constants.HOST).delete(`/todos/${ourTodo.id}`);
            console.timeEnd("deleteTodoWithValidIdTime");
            expect(deleteResponse.statusCode).toEqual(200);
    
            const expectedError = `Could not find an instance with todos/${ourTodo.id}`;
    
            console.time("getDeletedTodoTime");
            const getResponse = await request(constants.HOST).get(`/todos/${ourTodo.id}`).send();
            console.timeEnd("getDeletedTodoTime");
    
            expect(getResponse.statusCode).toEqual(404);
            expect(getResponse.body.errorMessages[0]).toEqual(expectedError);
        });
    
        it("returns an error when given an invalid id", async() => {
            const invalidId = -1;
    
            const expectedError = "Could not find any instances with todos/-1";
    
            console.time("deleteTodoWithInvalidIdTime");
            const response = await request(constants.HOST).delete(`/todos/${invalidId}`).send();
            console.timeEnd("deleteTodoWithInvalidIdTime");
    
            expect(response.statusCode).toEqual(404);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });
    });    
});

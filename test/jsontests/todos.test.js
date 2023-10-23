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

    const response = await request(constants.HOST).post("/todos").send({
        title: validTitle,
        doneStatus: validDoneStatus,
        description: validDescription
    });

    ourTodo = response.body;
});

afterEach(async() => { 
    
    await request(constants.HOST).delete(`/todos/${ourTodo.id}`).send();
});

describe("/todos", () => {
    describe("GET", () => {

        it("returns at least the default entry", async() => {
            const response = await request(constants.HOST).get("/todos").send();
            expect(response.statusCode).toEqual(200);
            expect(response.body.todos.includes(DEFAULTTODO.todos[0]));
            expect(response.body.todos.includes(DEFAULTTODO.todos[1]));
        });

        it("returns an entry that we put into the data", async() => {
            const response = await request(constants.HOST).get("/todos").send();
            expect(response.statusCode).toEqual(200);
            expect(response.body.todos.includes(ourTodo));
        });
    });

    describe("POST", () => {

        it("should create todo with just title", async() => {
            const validTitle = "Title";

            const response = await request(constants.HOST).post("/todos").send({
                title: validTitle
            });

            expect(response.statusCode).toEqual(201);
            expect(response.body.id);
            expect(response.body.id > 0);
            expect(response.body.doneStatus).toEqual("false");
            expect(!response.body.decsription);
            await request(constants.HOST).delete(`/todos/${response.body.id}`).send();
        });

        it("should create todo with all params", async() => {
            const validTitle = "Title";
            const validDoneStatus = false;
            const validDescription = "Description"

            const response = await request(constants.HOST).post("/todos").send({
                title: validTitle,
                doneStatus: validDoneStatus,
                description: validDescription
            });

            expect(response.statusCode).toEqual(201);
            expect(response.body.id);
            expect(response.body.id > 0);
            expect(response.body.doneStatus).toEqual(validDoneStatus.toString());
            expect(response.body.description).toEqual(validDescription);
            await request(constants.HOST).delete(`/todos/${response.body.id}`).send();
        });

        it("should not create todo with an ID", async() => {
            const id = 99;
            const validTitle = "Title";
            const validDoneStatus = false;
            const validDescription = "Description"

            const expectedError = "Failed Validation: Not allowed to create todos with id";

            const response = await request(constants.HOST).post("/todos").send({
                id,
                title: validTitle,
                doneStatus: validDoneStatus,
                description: validDescription
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not create todo with invalid doneStatus", async() => {
            const validTitle = "Title";
            const invalidDoneStatus = 1.0;
            const validDescription = "Description";

            const expectedError = "Failed Validation: doneStatus should be BOOLEAN";

            const response = await request(constants.HOST).post("/todos").send({
                title: validTitle,
                doneStatus: invalidDoneStatus,
                description: validDescription
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });
    });

    describe("POST", () => {

        it("should update the title of a todo given a valid title", async() => {
            const validTitle = "NEW TITLE";

            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                title: validTitle
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(ourTodo.doneStatus);
            expect(response.body.description).toEqual(ourTodo.description);
        });

        it("should update the donestatus of a todo given a valid status", async() => {
            const validStatus = true;

            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                doneStatus: validStatus
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(ourTodo.title);
            expect(response.body.doneStatus).toEqual(validStatus.toString());
            expect(response.body.description).toEqual(ourTodo.description);
        });

        it("should update the description of a todo", async() => {
            const validDescription = "NEW DESCRIPTION";

            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                description: validDescription
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(ourTodo.title);
            expect(response.body.doneStatus).toEqual(ourTodo.doneStatus);
            expect(response.body.description).toEqual(validDescription);
        });

        // TODO actual check here
        it("should update a todo's id with a valid id, but should not be the same if id already exists", async() => {
            const validId = 12345567;

            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                id: validId
            });

            expect(response.statusCode).toEqual(200);
            !expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(ourTodo.title);
            expect(response.body.doneStatus).toEqual(ourTodo.doneStatus);
            expect(response.body.description).toEqual(ourTodo.description);
        });

        it("should not update todo with invalid id", async() => {
            const invalidId = true; 

            const expectedError = "Failed Validation: id should be ID";

            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                id: invalidId
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update todo with invalid title", async() => {
            const invalidTitle = ""; 

            const expectedError = "Failed Validation: title : can not be empty";

            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                title: invalidTitle
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update todo with invalid done status", async() => {
            const invalidDoneStatus = 1; 

            const expectedError = "Failed Validation: doneStatus should be BOOLEAN";

            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                doneStatus: invalidDoneStatus
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should update multiple fields when all valid for a given todo", async() => {
            const validTitle = "TITLE";
            const validStatus = true;
            const validDescription = "NEW DESCRIPTION";

            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                title: validTitle,
                doneStatus: validStatus,
                description: validDescription
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(validStatus.toString());
            expect(response.body.description).toEqual(validDescription);
        });

        it("should return an error when given an invalid id", async() => {
            const invalidId = -1; 

            const expectedError = "No such todo entity instance with GUID or ID -1 found";

            const response = await request(constants.HOST).post(`/todos/${invalidId}`).send();

            expect(response.statusCode).toEqual(404);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });
    });

    describe("PUT", () => {

        const defaultDoneStatus = false;
        const defaultDescription = "";

        it("should update the title of a todo given a valid title, all others to default", async() => {
            const validTitle = "NEW TITLE";

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                title: validTitle
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(defaultDoneStatus.toString());
            expect(response.body.description).toEqual(defaultDescription);
        });

        it("should update the donestatus of a todo given a valid status if there is a valid title, description to default", async() => {
            const validStatus = true;
            const validTitle = "NEW TITLE";

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                doneStatus: validStatus,
                title: validTitle
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(validStatus.toString());
            expect(response.body.description).toEqual(defaultDescription);
        });

        it("should update the description of a todo if there is a valid title, doneStatus to default", async() => {
            const validDescription = "NEW DESCRIPTION";
            const validTitle = "NEW TITLE";

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                description: validDescription,
                title: validTitle
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(defaultDoneStatus.toString());
            expect(response.body.description).toEqual(validDescription);
        });

        // TODO actual check here
        it("should update a todo's id with a valid id, but should not be the same if id already exists, with title, default status and description", async() => {
            const validId = 12345567;
            const validTitle = "NEW TITLE";

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                id: validId,
                title: validTitle
            });

            expect(response.statusCode).toEqual(200);
            !expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(defaultDoneStatus.toString());
            expect(response.body.description).toEqual(defaultDescription);
        });

        it("should not update todo with invalid id", async() => {
            const invalidId = true; 

            const expectedError = "Failed Validation: id should be ID";

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                id: invalidId
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update todo with invalid title", async() => {
            const invalidTitle = ""; 

            const expectedError = "Failed Validation: title : can not be empty";

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                title: invalidTitle
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update other fields without a title", async() => {
            const validId = 123;
            const validStatus = true;
            const validDescription = "NEW DESCRIPTION";

            const expectedError = "title : field is mandatory";

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                id: validId,
                doneStatus: validStatus,
                description: validDescription
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update todo with invalid done status", async() => {
            const invalidDoneStatus = 1; 

            const expectedError = "Failed Validation: doneStatus should be BOOLEAN";

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                doneStatus: invalidDoneStatus
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should update multiple fields when all valid for a given todo", async() => {
            const validTitle = "TITLE";
            const validStatus = true;
            const validDescription = "NEW DESCRIPTION";

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                title: validTitle,
                doneStatus: validStatus,
                description: validDescription
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(validStatus.toString());
            expect(response.body.description).toEqual(validDescription);
        });

        it("should return an error when given an invalid id", async() => {
            const invalidId = -1; 

            const expectedError = "Invalid GUID for -1 entity todo";

            const response = await request(constants.HOST).put(`/todos/${invalidId}`).send();

            expect(response.statusCode).toEqual(404);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });
    });

    describe("DELETE", () => {

        it("deletes a todo with a valid id", async() => {
            const deleteResponse = await request(constants.HOST).delete(`/todos/${ourTodo.id}`);
            expect(deleteResponse.statusCode).toEqual(200);
            
            // check that id is actually gone
            const expectedError = `Could not find an instance with todos/${ourTodo.id}`;

            const getResponse = await request(constants.HOST).get(`/todos/${ourTodo.id}`).send();

            expect(getResponse.statusCode).toEqual(404);
            expect(getResponse.body.errorMessages[0]).toEqual(expectedError);
        });

        it("returns an error when given an invalid id", async() => {
            const invalidId = -1; 

            const expectedError = "Could not find any instances with todos/-1";

            const response = await request(constants.HOST).delete(`/todos/${invalidId}`).send();

            expect(response.statusCode).toEqual(404);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });
    });
});

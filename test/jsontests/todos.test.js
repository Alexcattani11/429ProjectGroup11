const net = require("net");
const request = require("supertest");
const constants = require("./constants.json");
const fs = require('fs');

const results = [];

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
            const startTime = new Date();
            const response = await request(constants.HOST).get("/todos").send();
            const endTime = new Date();

            results.push({
                testName: "GET all todos",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.todos.includes(DEFAULTTODO.todos[0]));
            expect(response.body.todos.includes(DEFAULTTODO.todos[1]));
        });

        it("returns an entry that we put into the data", async() => {
            const startTime = new Date();
            const response = await request(constants.HOST).get("/todos").send();
            const endTime = new Date();

            results.push({
                testName: "GET created todo",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.todos.includes(ourTodo));
        });
    });

    describe("POST", () => {

        it("should create todo with just title", async() => {
            const validTitle = "Title";
            const startTime = new Date();

            const response = await request(constants.HOST).post("/todos").send({
                title: validTitle
            });
            const endTime = new Date();

            results.push({
                testName: "POST new todo",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
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
            const validDescription = "Description";
            const startTime = new Date();

            const response = await request(constants.HOST).post("/todos").send({
                title: validTitle,
                doneStatus: validDoneStatus,
                description: validDescription
            });
            const endTime = new Date();

            results.push({
                testName: "POST todo with all params",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
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

            const expectedError = "Invalid Creation: Failed Validation: Not allowed to create with id";
            const startTime = new Date();

            const response = await request(constants.HOST).post("/todos").send({
                id,
                title: validTitle,
                doneStatus: validDoneStatus,
                description: validDescription
            });
            const endTime = new Date();

            results.push({
                testName: "POST invalid ID todo",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not create todo with invalid doneStatus", async() => {
            const validTitle = "Title";
            const invalidDoneStatus = 1.0;
            const validDescription = "Description";

            const expectedError = "Failed Validation: doneStatus should be BOOLEAN";
            const startTime = new Date();

            const response = await request(constants.HOST).post("/todos").send({
                title: validTitle,
                doneStatus: invalidDoneStatus,
                description: validDescription
            });
            const endTime = new Date();

            results.push({
                testName: "POST invalid done status TODO",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should update the title of a todo", async() => {
            const validTitle = "New test";
            const startTime = new Date();

            const response = await request(constants.HOST).post("/todos").send({
                title: validTitle
            });
            const endTime = new Date();

            results.push({
                testName: "POST update TODO title",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(201);
            expect(response.body.id).not.toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(ourTodo.doneStatus);
            expect(response.body.description).not.toEqual(ourTodo.description);

            await request(constants.HOST).delete(`/todos/${response.body.id}`).send();
        });

        it("should update the donestatus of a todo", async() => {
            const validStatus = true;
            const startTime = new Date();

            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                doneStatus: validStatus
            });
            const endTime = new Date();

            results.push({
                testName: "POST update TODO done status",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(ourTodo.title);
            expect(response.body.doneStatus).toEqual(validStatus.toString());
            expect(response.body.description).toEqual(ourTodo.description);
        });

        it("should update the description of a todo", async() => {
            const validDescription = "New description";
            const startTime = new Date();

            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                description: validDescription
            });
            const endTime = new Date();

            results.push({
                testName: "POST update TODO description",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(ourTodo.title);
            expect(response.body.doneStatus).toEqual(ourTodo.doneStatus);
            expect(response.body.description).toEqual(validDescription);
        });

        it("should update a todo's id with a valid id", async() => {
            const validId = 12345567;
            const startTime = new Date();

            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                id: validId
            });
            const endTime = new Date();

            results.push({
                testName: "POST update TODO ID",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
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
            const startTime = new Date();

            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                id: invalidId
            });
            const endTime = new Date();

            results.push({
                testName: "POST not update TODO ID",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update todo with invalid title", async() => {
            const invalidTitle = ""; 

            const expectedError = "Failed Validation: title : can not be empty";
            const startTime = new Date();

            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                title: invalidTitle
            });
            const endTime = new Date();

            results.push({
                testName: "POST not update TODO title",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update todo with invalid done status", async() => {
            const invalidDoneStatus = 1; 

            const expectedError = "Failed Validation: doneStatus should be BOOLEAN";
            const startTime = new Date();

            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                doneStatus: invalidDoneStatus
            });
            const endTime = new Date();

            results.push({
                testName: "POST not update TODO done status",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should update multiple fields when all valid for a given todo", async() => {
            const validTitle = "Title";
            const validStatus = false;
            const validDescription = "New description";
            const startTime = new Date();

            const response = await request(constants.HOST).post(`/todos/${ourTodo.id}`).send({
                title: validTitle,
                doneStatus: validStatus,
                description: validDescription
            });
            const endTime = new Date();

            results.push({
                testName: "POST update multiple TODO fields",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

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
            const startTime = new Date();

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                title: validTitle
            });
            const endTime = new Date();

            results.push({
                testName: "PUT update TODO title",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(defaultDoneStatus.toString());
            expect(response.body.description).toEqual(defaultDescription);
        });

        it("should update the doneStatus of a todo given a valid status", async() => {
            const validStatus = true;
            const validTitle = "New title";
            const startTime = new Date();

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                doneStatus: validStatus,
                title: validTitle
            });
            const endTime = new Date();

            results.push({
                testName: "PUT update TODO done status",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(validStatus.toString());
            expect(response.body.description).toEqual(defaultDescription);
        });

        it("should update the description of a todo", async() => {
            const validDescription = "New description";
            const validTitle = "New title";
            const startTime = new Date();

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                description: validDescription,
                title: validTitle
            });
            const endTime = new Date();

            results.push({
                testName: "PUT update TODO description",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(defaultDoneStatus.toString());
            expect(response.body.description).toEqual(validDescription);
        });

        it("should update a todo's id with a valid id", async() => {
            const validId = 999;
            const validTitle = "New title";
            const startTime = new Date();

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                id: validId,
                title: validTitle
            });
            const endTime = new Date();

            results.push({
                testName: "PUT update TODO ID",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
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
            const startTime = new Date();

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                id: invalidId
            });
            const endTime = new Date();

            results.push({
                testName: "PUT not update TODO ID",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update todo with invalid title", async() => {
            const invalidTitle = ""; 

            const expectedError = "Failed Validation: title : can not be empty";
            const startTime = new Date();

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                title: invalidTitle
            });
            const endTime = new Date();

            results.push({
                testName: "PUT not update TODO title",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update other fields without a title", async() => {
            const validId = 99;
            const validStatus = true;
            const validDescription = "New description";

            const expectedError = "title : field is mandatory";
            const startTime = new Date();

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                id: validId,
                doneStatus: validStatus,
                description: validDescription
            });
            const endTime = new Date();

            results.push({
                testName: "PUT not update TODO without title",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update todo with invalid done status", async() => {
            const invalidDoneStatus = 1; 

            const expectedError = "Failed Validation: doneStatus should be BOOLEAN";
            const startTime = new Date();

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                doneStatus: invalidDoneStatus
            });
            const endTime = new Date();

            results.push({
                testName: "PUT not update TODO done status",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should update multiple fields when all valid for a given todo", async() => {
            const validTitle = "Title";
            const validStatus = true;
            const validDescription = "New description";
            const startTime = new Date();

            const response = await request(constants.HOST).put(`/todos/${ourTodo.id}`).send({
                title: validTitle,
                doneStatus: validStatus,
                description: validDescription
            });
            const endTime = new Date();

            results.push({
                testName: "PUT update multiple TODO fields",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.doneStatus).toEqual(validStatus.toString());
            expect(response.body.description).toEqual(validDescription);
        });
    });

    describe("DELETE", () => {

        it("deletes a todo with an id", async() => {
            const startTime = new Date();
            const deleteResponse = await request(constants.HOST).delete(`/todos/${ourTodo.id}`);
            const endTime = new Date();
            expect(deleteResponse.statusCode).toEqual(200);

            results.push({
                testName: "DELETE TODO",
                duration: endTime - startTime,
                statusCode: deleteResponse.statusCode,
                objectCount: 1
            });
    
            const expectedError = `Could not find an instance with todos/${ourTodo.id}`;
            const startTime2 = new Date();
    
            const getResponse = await request(constants.HOST).get(`/todos/${ourTodo.id}`).send();
            const endTime2 = new Date();

            results.push({
                testName: "DELETE confirmation TODO",
                duration: endTime2 - startTime2,
                statusCode: getResponse.statusCode,
                objectCount: 1
            });
    
            expect(getResponse.statusCode).toEqual(404);
            expect(getResponse.body.errorMessages[0]).toEqual(expectedError);
        });
    
        it("returns an error when given an invalid id", async() => {
            const invalidId = -1;
    
            const expectedError = "Could not find any instances with todos/-1";
            const startTime = new Date();
    
            const response = await request(constants.HOST).delete(`/todos/${invalidId}`).send();
            const endTime = new Date();

            results.push({
                testName: "DELETE TODO invalid",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });
    
            expect(response.statusCode).toEqual(404);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });
    });    
});

afterAll(() => {
    let csvContent = "Test Name,Duration (ms),Status Code,Object Count\n" +
        results.map(e => `${e.testName},${e.duration},${e.statusCode},${e.objectCount}`).join("\n");

    fs.writeFileSync('performance_results_todos.test.csv', csvContent);
});

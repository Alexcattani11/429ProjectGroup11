const net = require("net");
const request = require("supertest");
const constants = require("./constants.json");

let ourProjects;

//system constants when it is booting up
const DEFAULTPROJECT = {
    "projects": [
        {
            "id": "1",
            "title": "Office Work",
            "completed": "false",
			"active": "false",
            "description": "",
			"tasks": [
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
			        ],	
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

    const response = await request(constants.HOST).post("/projects").send({
        title: validTitle,
        doneStatus: validDoneStatus,
        description: validDescription
    });

    ourProjects = response.body;
});

afterEach(async() => { 
    
    await request(constants.HOST).delete(`/todos/${ourProjects.id}`).send();
});

describe("/projects", () => {
    describe("GET", () => {

        it("returns at least the default entry", async() => {
            const response = await request(constants.HOST).get("/projects").send();
            expect(response.statusCode).toEqual(200);
            expect(response.body.todos.includes(DEFAULTPROJECT.projects[0]));
            expect(response.body.todos.includes(DEFAULTPROJECT.projects[1]));
        });

        it("returns an entry that we put into the data", async() => {
            const response = await request(constants.HOST).get("/projects").send();
            expect(response.statusCode).toEqual(200);
            expect(response.body.todos.includes(ourProjects));
        });
    });

    describe("POST", () => {

        it("should create project with just title", async() => {
            const validTitle = "Title";

            const response = await request(constants.HOST).post("/projects").send({
                title: validTitle
            });

            expect(response.statusCode).toEqual(201);
            expect(response.body.id);
            expect(response.body.id > 0);
            expect(response.body.doneStatus).toEqual("false");
            expect(!response.body.decsription);
            await request(constants.HOST).delete(`/projects/${response.body.id}`).send();
        });

        it("should create todo with all params", async() => {
            const validTitle = "Title";
            const validCompleted = false;
			const validActive = false;
            const validDescription = "Description"

            const response = await request(constants.HOST).post("/projects").send({
                title: validTitle,
                complted: validCompleted,
				active: validActive,
                description: validDescription
            });

            expect(response.statusCode).toEqual(201);
            expect(response.body.id);
            expect(response.body.id > 0);
            expect(response.body.doneStatus).toEqual(validCompleted.toString());
			expect(response.body.doneStatus).toEqual(validActive.toString());
            expect(response.body.description).toEqual(validDescription);
            await request(constants.HOST).delete(`/projects/${response.body.id}`).send();
        });

        it("should not create project with an ID", async() => {
            const id = 99;
            const validTitle = "Title";
            const validCompleted = false;
			const validActive = false;
            const validDescription = "Description"

            const expectedError = "Failed Validation: Not allowed to create projects with id";

            const response = await request(constants.HOST).post("/projects").send({
                id,
                title: validTitle,
                completed: validCompleted,
				active: validActive,
                description: validDescription
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });
    });

    describe("POST", () => {

        it("should update the title of a project", async() => {
            const validTitle = "New test";

            const response = await request(constants.HOST).post(`/projects/${ourProjects.id}`).send({
                title: validTitle
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourProjects.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.completed).toEqual(ourProjects.completed);
			expect(response.body.active).toEqual(ourProjects.active);
            expect(response.body.description).toEqual(ourProjects.description);
        });

        it("should update the active of a project", async() => {
            const activeStatus = true;

            const response = await request(constants.HOST).post(`/projects/${ourProjects.id}`).send({
                active: activeStatus
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourProjects.id);
            expect(response.body.title).toEqual(ourProjects.title);
			expect(response.body.completed).toEqual(ourProjects.complted);
            expect(response.body.cactive).toEqual(activeStatus.toString());
            expect(response.body.description).toEqual(ourProjects.description);
        });

        it("should update the description of a project", async() => {
            const validDescription = "New description";

            const response = await request(constants.HOST).post(`/projects/${ourProjects.id}`).send({
                description: validDescription
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourProjects.id);
            expect(response.body.title).toEqual(ourProjects.title);
			expect(response.body.completed).toEqual(ourProjects.complted);
            expect(response.body.cactive).toEqual(ourProjects.active);
            expect(response.body.description).toEqual(validDescription.toString());
        });

        it("should update a project's id with a valid id", async() => {
            const validId = 12345567;

            const response = await request(constants.HOST).post(`/projects/${ourProjects.id}`).send({
                id: validId
            });

            expect(response.statusCode).toEqual(200);
            !expect(response.body.id).toEqual(ourProjects.id);
            expect(response.body.title).toEqual(ourProjects.title);
			expect(response.body.completed).toEqual(ourProjects.complted);
            expect(response.body.cactive).toEqual(ourProjects.active);
            expect(response.body.description).toEqual(ourProjects.description);
        });

        it("should not update project with invalid id", async() => {
            const invalidId = true; 

            const expectedError = "Failed Validation: id should be ID";

            const response = await request(constants.HOST).post(`/projects/${ourProjects.id}`).send({
                id: invalidId
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update project with invalid title", async() => {
            const invalidTitle = ""; 

            const expectedError = "Failed Validation: title : can not be empty";

            const response = await request(constants.HOST).post(`/projects/${ourProjects.id}`).send({
                title: invalidTitle
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update project with invalid completed status", async() => {
            const invalidCompleted = 1; 

            const expectedError = "Failed Validation: completed should be BOOLEAN";

            const response = await request(constants.HOST).post(`/projects/${ourProjects.id}`).send({
                doneStatus: invalidDoneStatus
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should update multiple fields when all valid for a given todo", async() => {
            const validTitle = "Title";
            const validActive = true;
            const validDescription = "New description";

            const response = await request(constants.HOST).post(`/projects/${ourProjects.id}`).send({
                title: validTitle,
                active: validActive,
                description: validDescription
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.active).toEqual(validActive.toString());
            expect(response.body.description).toEqual(validDescription);
        });

        it("should return an error when given an invalid id", async() => {
            const invalidId = -1; 

            const expectedError = "No such project entity instance with GUID or ID -1 found";

            const response = await request(constants.HOST).post(`/projects/${invalidId}`).send();

            expect(response.statusCode).toEqual(404);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });
    });

    describe("PUT", () => {

        const defaultCompleted = false;
		const defaultActive = false;
        const defaultDescription = "";

        it("should update the title of a project given a valid title, all others to default", async() => {
            const validTitle = "New title";

            const response = await request(constants.HOST).put(`/projects/${ourProjects.id}`).send({
                title: validTitle
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourProjects.id);
            expect(response.body.title).toEqual(validTitle);
			expect(response.body.completed).toEqual(defaultCompleted.toString());
            expect(response.body.active).toEqual(defaultActive.toString());
            expect(response.body.description).toEqual(defaultDescription);
        });

        it("should update the completed and active status of a project given a valid status", async() => {
            const validCompleted = true;
			const validActive = true;
            const validTitle = "New title";

            const response = await request(constants.HOST).put(`/projects/${ourProjects.id}`).send({
                completed: validCompleted,
                title: validTitle
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.completed).toEqual(validCompleted.toString());
			expect(response.body.active).toEqual(validActive.toString());
            expect(response.body.description).toEqual(defaultDescription);
        });

        it("should update the description of a project", async() => {
            const validDescription = "New description";
            const validTitle = "New title";

            const response = await request(constants.HOST).put(`/projects/${ourProjects.id}`).send({
                description: validDescription,
                title: validTitle
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.completed).toEqual(defaultCompleted.toString());
			expect(response.body.active).toEqual(defaultActive.toString());
            expect(response.body.description).toEqual(validDescription);
        });

        it("should update a project's id with a valid id", async() => {
            const validId = 999;
            const validTitle = "New title";

            const response = await request(constants.HOST).put(`/projects/${ourProjects.id}`).send({
                id: validId,
                title: validTitle
            });

            expect(response.statusCode).toEqual(200);
            !expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
			expect(response.body.completed).toEqual(defaultCompleted.toString());
            expect(response.body.active).toEqual(defaultActive.toString());
            expect(response.body.description).toEqual(defaultDescription);
        });

        it("should not update projects with invalid id", async() => {
            const invalidId = true; 

            const expectedError = "Failed Validation: id should be ID";

            const response = await request(constants.HOST).put(`/projects/${ourProjects.id}`).send({
                id: invalidId
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update project with invalid title", async() => {
            const invalidTitle = ""; 

            const expectedError = "Failed Validation: title : can not be empty";

            const response = await request(constants.HOST).put(`/projects/${ourProjects.id}`).send({
                title: invalidTitle
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update other fields without a title", async() => {
            const validId = 99;
            const validActive = true;
            const validDescription = "New description";

            const expectedError = "title : field is mandatory";

            const response = await request(constants.HOST).put(`/projects/${ourProjects.id}`).send({
                id: validId,
                active: validActive,
                description: validDescription
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update project with invalid completed status", async() => {
            const invalidCompleted = 1; 

            const expectedError = "Failed Validation: doneStatus should be BOOLEAN";

            const response = await request(constants.HOST).put(`/projects/${ourProjects.id}`).send({
                completed: invalidCompleted
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });
		
		it("should not update project with invalid active status", async() => {
            const invalidActive = 1; 

            const expectedError = "Failed Validation: doneStatus should be BOOLEAN";

            const response = await request(constants.HOST).put(`/projects/${ourProjects.id}`).send({
                active: invalidActive
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should update multiple fields when all valid for a given project", async() => {
            const validTitle = "Title";
            const validActive = true;
            const validDescription = "New description";

            const response = await request(constants.HOST).put(`/projects/${ourProjects.id}`).send({
                title: validTitle,
                active: validActive,
                description: validDescription
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourTodo.id);
            expect(response.body.title).toEqual(validTitle);
			expect(response.body.active).toEqual(validActive.toString());
            expect(response.body.completed).toEqual(ourProjects.completed);
            expect(response.body.description).toEqual(validDescription);
        });

        it("should return an error when given an invalid id", async() => {
            const invalidId = -1; 

            const expectedError = "Invalid GUID for -1 entity project";

            const response = await request(constants.HOST).put(`/projects/${invalidId}`).send();

            expect(response.statusCode).toEqual(404);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });
    });

    describe("DELETE", () => {

        it("deletes a project with an id", async() => {
            const deleteResponse = await request(constants.HOST).delete(`/projects/${ourProjects.id}`);
            expect(deleteResponse.statusCode).toEqual(404);
            
            const expectedError = `Could not find an instance with todos/${ourProjects.id}`;

            const getResponse = await request(constants.HOST).get(`/projects/${ourProjects.id}`).send();

            expect(getResponse.statusCode).toEqual(404);
            expect(getResponse.body.errorMessages[0]).toEqual(expectedError);
        });

        it("returns an error when given an invalid id", async() => {
            const invalidId = -1; 

            const expectedError = "Could not find any instances with todos/-1";

            const response = await request(constants.HOST).delete(`/projects/${invalidId}`).send();

            expect(response.statusCode).toEqual(404);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });
    });
});

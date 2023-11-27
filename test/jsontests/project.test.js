const { constant } = require("async");
const net = require("net");
const request = require("supertest");
const constants = require("./constants.json");

let ourProject;

// Set up tests 
beforeAll(done => {
    // Create server
    var server = net.createServer();

    // Confirm jar is working
    server.once('error', function(err) {
        if (err.code === 'EADDRINUSE') {
          server.close();
          done();
        }
    });
      
    // Make sure server is listening and indicate failure
    server.once('listening', function() {
        server.close();
        throw new Error("No instance running")
    });
      
    // Tell server to listen
    server.listen(constants.PORT);
});

beforeEach(async() => {
    const validTitle = "TITLE";
    const validCompleted = false;
    const validActive = false;
    const validDescription = "DESCRIPTION OF PROJECT"

    const response = await request(constants.HOST).post("/projects").send({
        title: validTitle,
        completed: validCompleted,
        active: validActive,
        description: validDescription
    });

    ourProject = response.body;
});

afterEach(async() => { 
    await request(constants.HOST).delete(`/projects/${ourProject.id}`).send();
});

describe("/projects", () => {
    describe("GET", () => {
        it("returns at least the default entry", async() => {
            console.time("getProjectTime");
            const response = await request(constants.HOST).get("/projects").send();
            console.timeEnd("getProjectTime");
            expect(response.statusCode).toEqual(200);
            expect(response.body.projects.includes(constants.DEFAULTPROJECTS.projects[0]));
        });

        it("returns an entry that we put into the data", async() => {
            console.time("getProjectTime");
            const response = await request(constants.HOST).get("/projects").send();
            console.timeEnd("getProjectTime");
            expect(response.statusCode).toEqual(200);
            expect(response.body.projects.includes(ourProject));
        });
    });

    describe("HEAD", () => {
        it("returns JSON as default", async() => {
            console.time("returnJSONTime");
            const response = await request(constants.HOST).head("/projects").send();
            console.timeEnd("returnJSONTime");

            expect(response.statusCode).toEqual(200);
            expect(response.headers["content-type"]).toEqual("application/json");
        });
    });

    describe("POST", () => {

        it("should create project without a ID using just a title (madatory params)", async() => {
            const validTitle = "TITLE";

            console.time("postProjectMandatoryParamsTime");
            const response = await request(constants.HOST).post("/projects").send({
                title: validTitle
            });
            console.timeEnd("postProjectMandatoryParamsTime");

            expect(response.statusCode).toEqual(201);
            expect(response.body.id);
            expect(response.body.id > 0);
            expect(response.body.active).toEqual("false");
            expect(response.body.completed).toEqual("false");
            expect(!response.body.decsription);

            console.time("deleteProjectPostMandatoryTime");
            await request(constants.HOST).delete(`/projects/${response.body.id}`).send();
            console.timeEnd("deleteProjectPostMandatoryTime");
        });

        it("should create projects without a ID using fields (mandatory and non mandatory params)", async() => {
            const validTitle = "TITLE";
            const validCompleted = true;
            const validActive = true;
            const validDescription = "DESCRIPTION PROJECT"

            console.time("postProjectAllParamsTime");
            const response = await request(constants.HOST).post("/projects").send({
                title: validTitle,
                completed: validCompleted,
                active: validActive,
                description: validDescription
            });
            console.timeEnd("postProjectAllParamsTime");

            expect(response.statusCode).toEqual(201);
            expect(response.body.id);
            expect(response.body.id > 0);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.completed).toEqual(validCompleted.toString());
            expect(response.body.active).toEqual(validActive.toString());
            expect(response.body.description).toEqual(validDescription);

            console.time("deleteProjectPostAllParamsTime");
            await request(constants.HOST).delete(`/projects/${response.body.id}`).send();
            console.timeEnd("deleteProjectPostAllParamsTime");
        });

        it("should not create project with an ID", async() => {
            const id = 123;
            const validTitle = "TITLE";
            const validCompleted = true;
            const validActive = true;
            const validDescription = "DESCRIPTION OF PROJECT"

            const expectedError = "Invalid Creation: Failed Validation: Not allowed to create with id";

            console.time("postProjectInvalidTime");
            const response = await request(constants.HOST).post("/projects").send({
                id,
                title: validTitle,
                completed: validCompleted,
                active: validActive,
                description: validDescription
            });
            console.timeEnd("postProjectInvalidTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should create project with empty title", async() => {
            const emptyTitle = "";
            const validCompleted = true;
            const validActive = true;
            const validDescription = "DESCRIPTION OF PROJECT";

            const expectedError = "Failed Validation: title : can not be empty";

            console.time("postProjectEmptyTitleTime");
            const response = await request(constants.HOST).post("/projects").send({
                title: emptyTitle,
                completed: validCompleted,
                active: validActive,
                description: validDescription
            });
            console.timeEnd("postProjectEmptyTitleTime");

            expect(response.statusCode).toEqual(201);
            expect(response.body.id);
            expect(response.body.id > 0);
            expect(response.body.title).toEqual(emptyTitle);
            expect(response.body.completed).toEqual(validCompleted.toString());
            expect(response.body.active).toEqual(validActive.toString());
            expect(response.body.description).toEqual(validDescription);

            console.time("deleteProjectAfterEmptyTitleTime");
            await request(constants.HOST).delete(`/projects/${response.body.id}`).send();
            console.timeEnd("deleteProjectAfterEmptyTitleTime");        
        });

        it("should not create project without an ID with invalid active", async() => {
            const validTitle = "TITLE";
            const invalidActive = 1;
            const validCompleted = true;
            const validDescription = "DESCRIPTION OF PROJECT";

            const expectedError = "Failed Validation: active should be BOOLEAN";

            console.time("postProjectInvalidActiveTime");
            const response = await request(constants.HOST).post("/projects").send({
                title: validTitle,
                active: invalidActive,
                completed: validCompleted,
                description: validDescription
            });
            console.timeEnd("postProjectInvalidActiveTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not create project without an ID with invalid completed", async() => {
            const validTitle = "TITLE";
            const invalidCompleted = 1;
            const validActive = true;
            const validDescription = "DESCRIPTION OF PROJECT";

            const expectedError = "Failed Validation: completed should be BOOLEAN";

            console.time("postProjectInvalidCompletedTime");
            const response = await request(constants.HOST).post("/projects").send({
                title: validTitle,
                active: validActive,
                completed: invalidCompleted,
                description: validDescription
            });
            console.timeEnd("postProjectInvalidCompletedTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should create project without an ID with non-string description", async() => {
            const validTitle = "TITLE";
            const validActive = true;
            const validCompleted = true;
            const validDescription = 0;

            console.time("postProjectNonStringDescriptionTime");
            const response = await request(constants.HOST).post("/projects").send({
                title: validTitle,
                active: validActive,
                completed: validCompleted,
                description: validDescription
            });
            console.timeEnd("postProjectNonStringDescriptionTime");

            expect(response.statusCode).toEqual(201);
            expect(response.body.id);
            expect(response.body.id > 0);
            expect(response.body.active).toEqual(validActive.toString());
            expect(response.body.completed).toEqual(validCompleted.toString());

            console.time("deleteProjectAfterNonStringDescriptionTime");
            await request(constants.HOST).delete(`/projects/${response.body.id}`).send();
            console.timeEnd("deleteProjectAfterNonStringDescriptionTime");        
        });
    });
});
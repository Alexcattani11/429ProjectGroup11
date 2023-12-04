const net = require("net");
const request = require("supertest");
const constants = require("./constants.json");
const fs = require('fs');

let ourProject;
const results = [];

// Set up tests 
beforeAll(done => {
    let server = net.createServer();
    server.once('error', function(err) {
        if (err.code === 'EADDRINUSE') {
            server.close();
            done();
        }
    });

    server.once('listening', function() {
        server.close();
        throw new Error("No instance running");
    });

    server.listen(constants.PORT);
});

beforeEach(async() => {
    const validTitle = "TITLE";
    const validCompleted = false;
    const validActive = false;
    const validDescription = "DESCRIPTION OF PROJECT";
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
            const startTime = new Date();
            const response = await request(constants.HOST).get("/projects").send();
            const endTime = new Date();

            results.push({
                testName: "GET Default Entry",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.projects.includes(constants.DEFAULTPROJECTS.projects[0]));
        });

        it("returns an entry that we put into the data", async() => {
            const startTime = new Date();
            const response = await request(constants.HOST).get("/projects").send();
            const endTime = new Date();

            results.push({
                testName: "GET Entry Added",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.projects.includes(ourProject));
        });
    });

    describe("HEAD", () => {
        it("returns JSON as default", async() => {
            const startTime = new Date();
            const response = await request(constants.HOST).head("/projects").send();
            const endTime = new Date();

            results.push({
                testName: "HEAD Default JSON",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 0
            });

            expect(response.statusCode).toEqual(200);
            expect(response.headers["content-type"]).toEqual("application/json");
        });
    });

    describe("POST", () => {

        it("should create project without a ID using just a title", async() => {
            const validTitle = "TITLE";
            const startTime = new Date();

            const response = await request(constants.HOST).post("/projects").send({ title: validTitle });
            const endTime = new Date();

            results.push({
                testName: "POST Project with Title Only",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(201);
            expect(response.body.id).toBeDefined();

            await request(constants.HOST).delete(`/projects/${response.body.id}`).send();
        });

        it("should create projects without a ID using fields (mandatory and non mandatory params)", async() => {
            const validTitle = "TITLE";
            const validCompleted = true;
            const validActive = true;
            const validDescription = "DESCRIPTION PROJECT";
            const startTime = new Date();

            const response = await request(constants.HOST).post("/projects").send({
                title: validTitle,
                completed: validCompleted,
                active: validActive,
                description: validDescription
            });
            const endTime = new Date();

            results.push({
                testName: "POST Project with Mandatory and non Mandatory Params",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(201);
            expect(response.body.id);
            expect(response.body.id > 0);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.completed).toEqual(validCompleted.toString());
            expect(response.body.active).toEqual(validActive.toString());
            expect(response.body.description).toEqual(validDescription);

            await request(constants.HOST).delete(`/projects/${response.body.id}`).send();
        });

        it("should not create project with an ID", async() => {
            const id = 123;
            const validTitle = "TITLE";
            const validCompleted = true;
            const validActive = true;
            const validDescription = "DESCRIPTION OF PROJECT";
            const startTime = new Date();

            const expectedError = "Invalid Creation: Failed Validation: Not allowed to create with id";

            const response = await request(constants.HOST).post("/projects").send({
                id,
                title: validTitle,
                completed: validCompleted,
                active: validActive,
                description: validDescription
            });
            const endTime = new Date();

            results.push({
                testName: "POST Project with input ID",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should create project with empty title", async() => {
            const emptyTitle = "";
            const validCompleted = true;
            const validActive = true;
            const validDescription = "DESCRIPTION OF PROJECT";

            const startTime = new Date();
            const response = await request(constants.HOST).post("/projects").send({
                title: emptyTitle,
                completed: validCompleted,
                active: validActive,
                description: validDescription
            });
            const endTime = new Date();

            results.push({
                testName: "POST Project with empty title",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(201);
            expect(response.body.id);
            expect(response.body.id > 0);
            expect(response.body.title).toEqual(emptyTitle);
            expect(response.body.completed).toEqual(validCompleted.toString());
            expect(response.body.active).toEqual(validActive.toString());
            expect(response.body.description).toEqual(validDescription);

            await request(constants.HOST).delete(`/projects/${response.body.id}`).send();
        });

        it("should not create project without an ID with invalid active", async() => {
            const validTitle = "TITLE";
            const invalidActive = 1;
            const validCompleted = true;
            const validDescription = "DESCRIPTION OF PROJECT";

            const expectedError = "Failed Validation: active should be BOOLEAN";

            const startTime = new Date();
            const response = await request(constants.HOST).post("/projects").send({
                title: validTitle,
                active: invalidActive,
                completed: validCompleted,
                description: validDescription
            });
            const endTime = new Date();

            results.push({
                testName: "POST Project with invalid active status",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not create project without an ID with invalid completed", async() => {
            const validTitle = "TITLE";
            const invalidCompleted = 1;
            const validActive = true;
            const validDescription = "DESCRIPTION OF PROJECT";
            const startTime = new Date();

            const expectedError = "Failed Validation: completed should be BOOLEAN";

            const response = await request(constants.HOST).post("/projects").send({
                title: validTitle,
                active: validActive,
                completed: invalidCompleted,
                description: validDescription
            });
            const endTime = new Date();

            results.push({
                testName: "POST Project with invalid completion status",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should create project without an ID with non-string description", async() => {
            const validTitle = "TITLE";
            const validActive = true;
            const validCompleted = true;
            const validDescription = 0;
            const startTime = new Date();

            const response = await request(constants.HOST).post("/projects").send({
                title: validTitle,
                active: validActive,
                completed: validCompleted,
                description: validDescription
            });
            const endTime = new Date();

            results.push({
                testName: "POST Project with non-string description",
                duration: endTime - startTime,
                statusCode: response.statusCode,
                objectCount: 1
            });

            expect(response.statusCode).toEqual(201);
            expect(response.body.id);
            expect(response.body.id > 0);
            expect(response.body.active).toEqual(validActive.toString());
            expect(response.body.completed).toEqual(validCompleted.toString());

            await request(constants.HOST).delete(`/projects/${response.body.id}`).send();
        });
    });
});

afterAll(() => {
    let csvContent = "Test Name,Duration (ms),Status Code,Object Count\n" +
        results.map(e => `${e.testName},${e.duration},${e.statusCode},${e.objectCount}`).join("\n");

    fs.writeFileSync('performance_results_project.test.csv', csvContent);
});
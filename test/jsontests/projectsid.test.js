const net = require("net");
const request = require("supertest");
const constants = require("./constants.json");

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
    
    const validTitle = "TITLE";
    const validActive = true;
    const validCompleted = true;
    const validDescription = "DESCRIPTION OF PROJECT"

    console.time("createProjectBeforeEachTime");
    const response = await request(constants.HOST).post("/projects").send({
        title: validTitle,
        active: validActive,
        completed: validCompleted,
        description: validDescription
    });
    console.timeEnd("createProjectBeforeEachTime");

    ourProject = response.body;
});


afterEach(async() => { 
    console.time("deleteProjectAfterEachTime");
    await request(constants.HOST).delete(`/projects/${ourProject.id}`).send();
    console.timeEnd("deleteProjectAfterEachTime");
});

describe("/projects/:id", () => {

    describe("GET", () => {

        it("returns the project we created with it's id", async() => {
            console.time("getProjectTime");
            const response = await request(constants.HOST).get(`/projects/${ourProject.id}`);
            console.timeEnd("getProjectTime");           
            expect(response.statusCode).toEqual(200);
            expect(response.body.projects[0]).toEqual(ourProject);
        });

        it("returns an error when given an invalid id", async() => {
            const invalidId = -1; 

            const expectedError = "Could not find an instance with projects/-1";

            console.time("getProjectInvalidTime");
            const response = await request(constants.HOST).get(`/projects/${invalidId}`).send();
            console.timeEnd("getProjectInvalidTime");

            expect(response.statusCode).toEqual(404);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });
    });

    describe("HEAD", () => {
        it("returns JSON as default", async() => {
            console.time("headProjectTime");
            const response = await request(constants.HOST).head(`/projects/${ourProject.id}`).send();
            console.timeEnd("headProjectTime");
            expect(response.statusCode).toEqual(200);
            expect(response.headers["content-type"]).toEqual("application/json");
        });
    });

    describe("POST", () => {

        it("should update the title of a project given a valid title", async() => {
            const validTitle = "NEW TITLE";

            console.time("updatePOSTProjectTitleTime");
            const response = await request(constants.HOST).post(`/projects/${ourProject.id}`).send({
                title: validTitle
            });
            console.timeEnd("updatePOSTProjectTitleTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourProject.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.active).toEqual(ourProject.active);
            expect(response.body.completed).toEqual(ourProject.completed);
            expect(response.body.description).toEqual(ourProject.description);
        });

        it("should update the active status of a project given a valid active status", async() => {
            const validStatus = true;

            console.time("updatePOSTProjectActiveStatusTime");
            const response = await request(constants.HOST).post(`/projects/${ourProject.id}`).send({
                active: validStatus
            });
            console.timeEnd("updatePOSTProjectActiveStatusTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourProject.id);
            expect(response.body.title).toEqual(ourProject.title);
            expect(response.body.active).toEqual(validStatus.toString());
            expect(response.body.completed).toEqual(ourProject.completed);
            expect(response.body.description).toEqual(ourProject.description);
        });

        it("should update the completed status of a project given a valid completed status", async() => {
            const validStatus = true;

            console.time("updatePOSTProjectCompletedStatusTime");
            const response = await request(constants.HOST).post(`/projects/${ourProject.id}`).send({
                completed: validStatus
            });
            console.timeEnd("updatePOSTProjectCompletedStatusTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourProject.id);
            expect(response.body.title).toEqual(ourProject.title);
            expect(response.body.completed).toEqual(validStatus.toString());
            expect(response.body.active).toEqual(ourProject.active);
            expect(response.body.description).toEqual(ourProject.description);
        });

        it("should update the description of a project", async() => {
            const validDescription = "NEW DESCRIPTION";

            console.time("updatePOSTProjectDescriptionTime");
            const response = await request(constants.HOST).post(`/projects/${ourProject.id}`).send({
                description: validDescription
            });
            console.timeEnd("updatePOSTProjectDescriptionTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourProject.id);
            expect(response.body.title).toEqual(ourProject.title);
            expect(response.body.completed).toEqual(ourProject.completed);
            expect(response.body.active).toEqual(ourProject.active);
            expect(response.body.description).toEqual(validDescription);
        });

        it("should update a project's id with a valid id, but should not be the same if id already exists", async() => {
            const validId = 12345567;

            console.time("updatePOSTProjectIdTime");
            const response = await request(constants.HOST).post(`/projects/${ourProject.id}`).send({
                id: validId
            });
            console.timeEnd("updatePOSTProjectIdTime");

            expect(response.statusCode).toEqual(200);
            !expect(response.body.id).toEqual(ourProject.id);
            expect(response.body.title).toEqual(ourProject.title);
            expect(response.body.completed).toEqual(ourProject.completed);
            expect(response.body.active).toEqual(ourProject.active);
            expect(response.body.description).toEqual(ourProject.description);
        });

        it("should not update project with invalid id", async() => {
            const invalidId = true; 

            const expectedError = "Failed Validation: id should be ID";

            console.time("updatePOSTProjectInvalidIdTime");
            const response = await request(constants.HOST).post(`/projects/${ourProject.id}`).send({
                id: invalidId
            });
            console.timeEnd("updatePOSTProjectInvalidIdTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update project with invalid active status", async() => {
            const invalidActiveStatus = 1; 

            const expectedError = "Failed Validation: active should be BOOLEAN";

            console.time("updatePOSTProjectInvalidActiveStatusTime");
            const response = await request(constants.HOST).post(`/projects/${ourProject.id}`).send({
                active: invalidActiveStatus
            });
            console.timeEnd("updatePOSTProjectInvalidActiveStatusTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update project with invalid completed status", async() => {
            const invalidCompletedStatus = 1; 

            const expectedError = "Failed Validation: completed should be BOOLEAN";

            console.time("updatePOSTProjectInvalidCompletedStatusTime");
            const response = await request(constants.HOST).post(`/projects/${ourProject.id}`).send({
                completed: invalidCompletedStatus
            });
            console.timeEnd("updatePOSTProjectInvalidCompletedStatusTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should update multiple fields when all valid for a given project", async() => {
            const validTitle = "TITLE";
            const validActive = true;
            const validCompleted = true;
            const validDescription = "NEW DESCRIPTION";

            console.time("updatePOSTMultipleProjectValidTime");
            const response = await request(constants.HOST).post(`/projects/${ourProject.id}`).send({
                title: validTitle,
                active: validActive,
                completed: validCompleted,
                description: validDescription
            });
            console.timeEnd("updatePOSTMultipleProjectValidTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourProject.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.active).toEqual(validActive.toString());
            expect(response.body.completed).toEqual(validCompleted.toString());
            expect(response.body.description).toEqual(validDescription);
        });
    });

    describe("PUT", () => {

        const defaultTitle = "";
        const defaultActive = false;
        const defaultCompleted = false;
        const defaultDescription = "";

        it("should update the title of a project given a valid title, all others to default", async() => {
            const validTitle = "NEW TITLE";

            console.time("updatePUTProjectTitleTime");
            const response = await request(constants.HOST).put(`/projects/${ourProject.id}`).send({
                title: validTitle
            });
            console.timeEnd("updatePUTProjectTitleTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourProject.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.active).toEqual(defaultActive.toString());
            expect(response.body.completed).toEqual(defaultCompleted.toString());
            expect(response.body.description).toEqual(defaultDescription);
        });

        it("should update the active status of a project given a valid status and the rest to default", async() => {
            const validActive = true;

            console.time("updatePUTProjectActiveStatusTime");
            const response = await request(constants.HOST).put(`/projects/${ourProject.id}`).send({
                active: validActive
            });
            console.timeEnd("updatePUTProjectActiveStatusTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourProject.id);
            expect(response.body.title).toEqual(defaultTitle);
            expect(response.body.completed).toEqual(defaultCompleted.toString());
            expect(response.body.description).toEqual(defaultDescription);
            expect(response.body.active).toEqual(validActive.toString());
        });

        it("should update the completed status of a project given a valid status and the rest to default", async() => {
            const validCompleted = true;

            console.time("updatePUTProjectCompletedStatusTime");
            const response = await request(constants.HOST).put(`/projects/${ourProject.id}`).send({
                completed: validCompleted
            });
            console.timeEnd("updatePUTProjectCompletedStatusTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourProject.id);
            expect(response.body.title).toEqual(defaultTitle);
            expect(response.body.active).toEqual(defaultActive.toString());
            expect(response.body.description).toEqual(defaultDescription);
            expect(response.body.completed).toEqual(validCompleted.toString());
        });

        it("should update the description of a project given a valid status and the rest to default", async() => {
            const validDescription = "NEW DESCRIPTION";

            console.time("updatePUTProjectDescriptionTime");
            const response = await request(constants.HOST).put(`/projects/${ourProject.id}`).send({
                description: validDescription
            });
            console.timeEnd("updatePUTProjectDescriptionTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourProject.id);
            expect(response.body.title).toEqual(defaultTitle);
            expect(response.body.active).toEqual(defaultActive.toString());
            expect(response.body.description).toEqual(validDescription);
            expect(response.body.completed).toEqual(defaultCompleted.toString());
        });

        it("should update a project's id with a valid id, but should not be the same if id already exists,  with the rest defaulted", async() => {
            const validId = 12345567;

            console.time("updatePUTProjectIdTime");
            const response = await request(constants.HOST).put(`/projects/${ourProject.id}`).send({
                id: validId
            });
            console.timeEnd("updatePUTProjectIdTime");

            expect(response.statusCode).toEqual(200);
            !expect(response.body.id).toEqual(ourProject.id);
            expect(response.body.title).toEqual(defaultTitle);
            expect(response.body.active).toEqual(defaultActive.toString());
            expect(response.body.completed).toEqual(defaultCompleted.toString());
            expect(response.body.description).toEqual(defaultDescription);
        });

        it("should not update project with invalid id", async() => {
            const invalidId = true; 

            const expectedError = "Failed Validation: id should be ID";

            console.time("updatePUTProjectInvalidIdTime");
            const response = await request(constants.HOST).put(`/projects/${ourProject.id}`).send({
                id: invalidId
            });
            console.timeEnd("updatePUTProjectInvalidIdTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should update project with empty title", async() => {
            const emptyTitle = ""; 

            console.time("updatePUTProjectEmptyTitleTime");
            const response = await request(constants.HOST).put(`/projects/${ourProject.id}`).send({
                title: emptyTitle
            });
            console.timeEnd("updatePUTProjectEmptyTitleTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourProject.id);
            expect(response.body.title).toEqual(emptyTitle);
            expect(response.body.active).toEqual(defaultActive.toString());
            expect(response.body.completed).toEqual(defaultCompleted.toString());
            expect(response.body.description).toEqual(defaultDescription);
        });

        it("should not update active with invalid active status", async() => {
            const invalidActiveStatus = 1; 

            const expectedError = "Failed Validation: active should be BOOLEAN";

            console.time("updatePUTProjectInvalidActiveStatusTime");
            const response = await request(constants.HOST).put(`/projects/${ourProject.id}`).send({
                active: invalidActiveStatus
            });
            console.timeEnd("updatePUTProjectInvalidActiveStatusTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should not update completed with invalid completed status", async() => {
            const invalidCompletedStatus = 1; 

            const expectedError = "Failed Validation: completed should be BOOLEAN";

            console.time("updatePUTProjectInvalidActiveCompletionTime");
            const response = await request(constants.HOST).put(`/projects/${ourProject.id}`).send({
                completed: invalidCompletedStatus
            });
            console.timeEnd("updatePUTProjectInvalidActiveCompletionTime");

            expect(response.statusCode).toEqual(400);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });

        it("should update multiple fields when all valid for a given project", async() => {
            const validTitle = "TITLE";
            const validActive = true;
            const validDescription = "NEW DESCRIPTION";

            console.time("updatePUTProjectMultipleValidTime");
            const response = await request(constants.HOST).put(`/projects/${ourProject.id}`).send({
                title: validTitle,
                active: validActive,
                description: validDescription
            });
            console.timeEnd("updatePUTProjectMultipleValidTime");

            expect(response.statusCode).toEqual(200);
            expect(response.body.id).toEqual(ourProject.id);
            expect(response.body.title).toEqual(validTitle);
            expect(response.body.active).toEqual(validActive.toString());
            expect(response.body.completed).toEqual(defaultCompleted.toString());
            expect(response.body.description).toEqual(validDescription);
        });

        it("should return an error when given an invalid id", async() => {
            const invalidId = -1; 

            const expectedError = "Invalid GUID for -1 entity project";

            console.time("updatePUTProjectInvalidIdErrorTime");
            const response = await request(constants.HOST).put(`/projects/${invalidId}`).send();
            console.timeEnd("updatePUTProjectInvalidIdErrorTime");

            expect(response.statusCode).toEqual(404);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });
    });

    describe("DELETE", () => {

        it("deletes a project with a valid id", async() => {
            console.time("deleteProjectTime");
            const deleteResponse = await request(constants.HOST).delete(`/projects/${ourProject.id}`);
            console.timeEnd("deleteProjectTime");
            expect(deleteResponse.statusCode).toEqual(200);
            
            const expectedError = `Could not find an instance with projects/${ourProject.id}`;

            console.time("verifyDeleteProjectTime");
            const getResponse = await request(constants.HOST).get(`/projects/${ourProject.id}`).send();
            console.timeEnd("verifyDeleteProjectTime");

            expect(getResponse.statusCode).toEqual(404);
            expect(getResponse.body.errorMessages[0]).toEqual(expectedError);
        });

        it("returns an error when given an invalid id", async() => {
            const invalidId = -1; 

            const expectedError = "Could not find any instances with projects/-1";

            console.time("deleteInvalidProjectTime");
            const response = await request(constants.HOST).delete(`/projects/${invalidId}`).send();
            console.timeEnd("deleteInvalidProjectTime");
            expect(response.statusCode).toEqual(404);
            expect(response.body.errorMessages[0]).toEqual(expectedError);
        });
    });
});
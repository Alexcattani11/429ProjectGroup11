const { Given, When, Then } = require('@cucumber/cucumber');
const axios = require('axios');
const assert = require('assert').strict;

const apiBaseUrl = 'http://localhost:4567'; // Replace with the correct base URL of your API

let lastApiResponse;

Given('the application is running', async function () {
    const response = await axios.get(`${apiBaseUrl}/api/status`);
    assert.equal(response.status, 200);
});

Given('the following todos exist in the system:', async function (dataTable) {
    for (const todo of dataTable.hashes()) {
        await axios.post(`${apiBaseUrl}/todos`, {
            title: todo.title,
            doneStatus: todo.doneStatus === 'true',
            description: todo.description
        });
    }
});

When('the user creates a task with title "{string}" and description "{string}"', async function (title, description) {
    try {
        lastApiResponse = await axios.post(`${apiBaseUrl}/todos`, { title, description });
    } catch (error) {
        lastApiResponse = error.response;
    }
});

Then('a new task with title "{string}" and description "{string}" is added to the to-do list', function (title, description) {
    assert.equal(lastApiResponse.status, 200); // Check if the response status is 200 (OK)
    assert.equal(lastApiResponse.data.title, title);
    assert.equal(lastApiResponse.data.description, description);
});

When('the user attempts to create a task with no title but with description "{string}"', async function (description) {
    try {
        lastApiResponse = await axios.post(`${apiBaseUrl}/todos`, { title: '', description });
    } catch (error) {
        lastApiResponse = error.response;
    }
});

Then('an error message "{string}" is displayed', function (expectedError) {
    assert.equal(lastApiResponse.data.error, expectedError);
});

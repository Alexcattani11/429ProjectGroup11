const { Given, When, Then } = require('@cucumber/cucumber');
const axios = require('axios');
const assert = require('assert').strict;

const apiBaseUrl = 'http://localhost:4567'; 
const MAX_TODOS = 100;
let lastApiResponse;
let totalTodos = 0;

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
        totalTodos++;
    }
});

Given('there is room for new todos', function () {
    assert(totalTodos < MAX_TODOS);
});

Given('the maximum number of todos is reached', async function () {
    while (totalTodos < MAX_TODOS) {
        await axios.post(`${apiBaseUrl}/todos`, {
            title: `Todo ${totalTodos + 1}`,
            description: 'Auto-generated todo'
        });
        totalTodos++;
    }
});

When('the user attempts to create a task with title "{string}" and description "{string}"', async function (title, description) {
    try {
        lastApiResponse = await axios.post(`${apiBaseUrl}/todos`, { title, description });
        totalTodos++;
    } catch (error) {
        lastApiResponse = error.response;
    }
});

When('the user attempts to create a task after reaching the maximum number of todos', async function () {
    try {
        lastApiResponse = await axios.post(`${apiBaseUrl}/todos`, { title: 'Extra Todo', description: 'Extra Description' });
    } catch (error) {
        lastApiResponse = error.response;
    }
});

Then('an error message "{string}" is displayed', function (expectedError) {
    assert.equal(lastApiResponse.data.error, expectedError);
});

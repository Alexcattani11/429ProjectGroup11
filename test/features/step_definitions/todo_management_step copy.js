const { Given, When, Then } = require('@cucumber/cucumber');
const axios = require('axios');
const assert = require('assert').strict;

const apiBaseUrl = 'http://localhost:4567';
const MAX_TODOS = 100;
let totalTodos = 0;

Given('the following todos exist in the system:', async function (dataTable) {
    // Clear existing todos
    await axios.delete(`${apiBaseUrl}/todos`);

    for (const todo of dataTable.hashes()) {
        await axios.post(`${apiBaseUrl}/todos`, {
            title: todo.title,
            doneStatus: todo.doneStatus === 'true',
            description: todo.description
        });
    }
});

// Handle deletion of todos
When('the user deletes the todo with ID "{int}"', async function (id) {
    await axios.delete(`${apiBaseUrl}/todos/${id}`);
    totalTodos--;
});

Then('the todo with ID "{int}" should no longer exist in the todo list', async function (id) {
    try {
        await axios.get(`${apiBaseUrl}/todos/${id}`);
        assert.fail('Todo still exists');
    } catch (error) {
        assert.equal(error.response.status, 404); 
    }
});

// Handle editing of todos
When('the user changes the todo with ID "{int}" to have title "{string}" and doneStatus "{string}"', async function (id, newTitle, newDoneStatus) {
    await axios.put(`${apiBaseUrl}/todos/${id}`, {
        title: newTitle,
        doneStatus: newDoneStatus === 'true'
    });
});

Then('the todo with ID "{int}" should have title "{string}" and doneStatus "{string}"', async function (id, expectedTitle, expectedDoneStatus) {
    const response = await axios.get(`${apiBaseUrl}/todos/${id}`);
    assert.equal(response.data.title, expectedTitle);
    assert.equal(response.data.doneStatus.toString(), expectedDoneStatus);
});

Given('no todo with ID {string} exists', async function (id) {
    try {
        const response = await axios.get(`${apiBaseUrl}/todos/${id}`);
        if (response.status === 200) {
            // If todo exists, delete it
            await axios.delete(`${apiBaseUrl}/todos/${id}`);
        }
    } catch (error) {
        // If todo does not exist, catch the error
        if (error.response.status !== 404) {
            throw error; // rethrow if it's not a 404 error
        }
    }
});

When('the user attempts change the todo with ID {string} with new title', async function (id) {
    try {
        this.lastResponse = await axios.put(`${apiBaseUrl}/todos/${id}`, { title: 'New Title' });
    } catch (error) {
        this.lastResponse = error.response;
    }
});

Then('an error message "{string}" is displayed', function (expectedError) {
    assert.equal(this.lastResponse.data.error, expectedError);
});

When('the user creates a task with title {string} and description {string}', async function (title, description) {
    try {
        this.lastResponse = await axios.post(`${apiBaseUrl}/todos`, { title, description });
    } catch (error) {
        this.lastResponse = error.response;
    }
});

Then('a new task with title {string} and description {string} is added to the to-do list', function (title, description) {
    assert.equal(this.lastResponse.data.title, title);
    assert.equal(this.lastResponse.data.description, description);
});

Then('an error message "{string}" is displayed', function (expectedError) {
    assert.equal(this.lastResponse.data.error, expectedError);
});

Given('there is room for new todos', function () {
    assert(totalTodos < MAX_TODOS);
});

When('the user creates a task with title {string} and description {string}', async function (title, description) {
    try {
        this.lastResponse = await axios.post(`${apiBaseUrl}/todos`, { title, description });
    } catch (error) {
        this.lastResponse = error.response;
    }
});

Then('a new task with title {string} and description {string} is added to the to-do list', function (title, description) {
    assert.equal(this.lastResponse.data.title, title);
    assert.equal(this.lastResponse.data.description, description);
});

When('the user attempts to create a task with no title but with description {string}', async function (description) {
    try {
        this.lastResponse = await axios.post(`${apiBaseUrl}/todos`, { description });
    } catch (error) {
        this.lastResponse = error.response;
    }
});

Then('an error message "{string}" is displayed', function (expectedError) {
    assert.equal(this.lastResponse.data.error, expectedError);
});

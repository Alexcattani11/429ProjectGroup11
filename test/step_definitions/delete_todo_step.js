const { Given, When, Then } = require('@cucumber/cucumber');
const axios = require('axios');
const assert = require('assert').strict;

const apiBaseUrl = 'http://localhost:4567';

Given('the application is running', async function () {

    const response = await axios.get(`${apiBaseUrl}/api/status`);
    assert.equal(response.status, 200);
});

Given('the following todos exist in the system', async function (dataTable) {
    for (const todo of dataTable.hashes()) {
        await axios.post(`${apiBaseUrl}/todos`, {
            title: todo.title,
            doneStatus: todo.doneStatus === 'true',
            description: todo.description
        });
    }
});

When('the user deletes the todo with ID "{int}"', async function (id) {
    await axios.delete(`${apiBaseUrl}/todos/${id}`);
});

Then('the todo with ID "{int}" should no longer exist in the todo list', async function (id) {
    try {
        await axios.get(`${apiBaseUrl}/todos/${id}`);
        assert.fail('Todo still exists');
    } catch (error) {
        assert.equal(error.response.status, 404); 
    }
});


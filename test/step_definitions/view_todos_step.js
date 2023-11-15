const { Given, When, Then } = require('@cucumber/cucumber');
const axios = require('axios');
const assert = require('assert').strict;

const apiBaseUrl = 'http://localhost:4567';
let lastApiResponse;

Given('the application is running', async function () {
    const response = await axios.get(`${apiBaseUrl}/api/status`);
    assert.equal(response.status, 200);
});

Given('there are no todos in the system', async function () {
    await axios.delete(`${apiBaseUrl}/todos/all`);
});

When('the user requests to view todos with a "doneStatus" of true', async function () {
    try {
        lastApiResponse = await axios.get(`${apiBaseUrl}/todos?doneStatus=true`);
    } catch (error) {
        lastApiResponse = error.response;
    }
});

Then('only todos with a "doneStatus" of true should be displayed', function () {
    const todos = lastApiResponse.data;
    assert(todos.every(todo => todo.doneStatus === true));
});

When('the user requests to view all todos', async function () {
    try {
        lastApiResponse = await axios.get(`${apiBaseUrl}/todos`);
    } catch (error) {
        lastApiResponse = error.response;
    }
});

Then('a list of all todos should be displayed', function () {
    assert(Array.isArray(lastApiResponse.data));
});

Then('the error message "There are no todos" should be displayed', function () {
    assert.equal(lastApiResponse.data.length, 0);
});

// view_todos_step.js

const { Given, When, Then } = require('@cucumber/cucumber');
const axios = require('axios');
const assert = require('assert').strict;

const apiBaseUrl = 'http://localhost:8080';
let response;

Given('the application is running', async function () {
    response = await axios.get(`${apiBaseUrl}/api/status`);
    assert.equal(response.status, 200);
});

Given('there are no todos in the system', async function () {
    await axios.delete(`${apiBaseUrl}/todos/all`);
});

When('the user requests to view all todos', async function () {
    response = await axios.get(`${apiBaseUrl}/todos`);
});

Then('a list of all todos should be displayed', function () {
    assert(Array.isArray(response.data));
});

When('the user requests to view todos with a "doneStatus" of true', async function () {
    response = await axios.get(`${apiBaseUrl}/todos?doneStatus=true`);
});

Then('only todos with a "doneStatus" of true should be displayed', function () {
    assert(response.data.every(todo => todo.doneStatus === true));
});

Then('the error message "There are no todos" should be displayed', function () {
    assert.equal(response.data.length, 0 || response.data.message === "There are no todos");
});

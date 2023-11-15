const { Given, When, Then } = require('@cucumber/cucumber');
const axios = require('axios');
const assert = require('assert').strict;

const apiBaseUrl = 'http://localhost:4567';

// Viewing all todos
When('the user requests to view all todos', async function () {
    this.response = await axios.get(`${apiBaseUrl}/todos`);
});

Then('a list of all todos should be displayed', function () {
    assert(Array.isArray(this.response.data));
    assert(this.response.data.length > 0);
});

When('the user requests to view todos with a "doneStatus" of {string}', async function (doneStatus) {
    this.response = await axios.get(`${apiBaseUrl}/todos?doneStatus=${doneStatus}`);
});

Then('only todos with a "doneStatus" of {string} should be displayed', function (expectedDoneStatus) {
    assert(this.response.data.every(todo => todo.doneStatus.toString() === expectedDoneStatus));
});

Given('all todos can all be viewed', function () {
});

Given('the user wants to view completed tasks', function () {
});

Given('there are no todos in the system', async function () {
    await axios.delete(`${apiBaseUrl}/todos/all`);
});

Then('the error message "{string}" should be displayed', function (expectedErrorMessage) {
    assert.equal(this.lastResponse.data.error, expectedErrorMessage);
});

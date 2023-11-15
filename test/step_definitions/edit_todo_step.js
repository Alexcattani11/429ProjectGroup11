const { Given, When, Then } = require('@cucumber/cucumber');
const axios = require('axios');
const assert = require('assert').strict;

const apiBaseUrl = 'http://localhost:4567';

Given('the application is running', async function () {
    const response = await axios.get(`${apiBaseUrl}/api/status`);
    assert.equal(response.status, 200);
});

Given('the todo with ID "{int}" exists and todo has title "{string}"', async function (id, title) {
    const response = await axios.get(`${apiBaseUrl}/todos/${id}`);
    assert.equal(response.data.title, title);
});

When('the user changes the todo with ID "{int}" with new title "{string}"', async function (id, newTitle) {
    lastApiResponse = await axios.put(`${apiBaseUrl}/todos/${id}`, { title: newTitle });
});

Then('the todo with ID "{int}" should have its "{string}" value as the new title', async function (id, newTitle) {
    const response = await axios.get(`${apiBaseUrl}/todos/${id}`);
    assert.equal(response.data.title, newTitle);
});

Given('the todo with ID "{int}" exists and todo has "{string}" of false', async function (id, doneStatus) {
    const response = await axios.get(`${apiBaseUrl}/todos/${id}`);
    assert.equal(response.data.doneStatus, doneStatus === 'true');
});

When('the user marks the todo with ID "{int}" as complete', async function (id) {
    lastApiResponse = await axios.put(`${apiBaseUrl}/todos/${id}`, { doneStatus: true });
});

Then('the todo with ID "{int}" should have its "{string}" value as true', async function (id) {
    const response = await axios.get(`${apiBaseUrl}/todos/${id}`);
    assert.equal(response.data.doneStatus, true);
});

Given('the todo with ID "{int}" exists and todo has "{string}" of true', async function (id, doneStatus) {
    const response = await axios.get(`${apiBaseUrl}/todos/${id}`);
    assert.equal(response.data.doneStatus, doneStatus === 'true');
});
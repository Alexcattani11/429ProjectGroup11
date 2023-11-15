const { When, Then } = require('@cucumber/cucumber');
const axios = require('axios');
const assert = require('assert').strict;

const apiBaseUrl = 'http://localhost:4567';

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


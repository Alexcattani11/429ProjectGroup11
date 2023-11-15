const { Given } = require('@cucumber/cucumber');
const axios = require('axios');
const assert = require('assert');

const apiBaseUrl = 'http://localhost:4567';

Given('the application is running', async function () {
    const response = await axios.get(`${apiBaseUrl}/`);
    assert.equal(response.status, 200);
});
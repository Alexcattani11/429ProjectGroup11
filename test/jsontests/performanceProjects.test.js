const axios = require('axios');

// Assuming the API is running at http://localhost:4567

describe('Performance Testing for Projects', () => {
  let createdProjectIds = [];

  // Test the performance of creating Projects
  test('Create Project - Performance Test', async () => {
    const projectData = {
      title: 'Performance Test Project',
      completed: false,
      active: true,
      description: 'This is a performance test project.',
    };

    const numObjectsArray = [1, 10, 100, 1000, 10000];

    for (const numObjects of numObjectsArray) {
      const startTime = new Date();

      for (let i = 0; i < numObjects; i++) {
        const response = await axios.post('http://localhost:4567/projects', projectData);
        createdProjectIds.push(response.data.id);
      }

      const endTime = new Date();
      const elapsedTime = endTime - startTime;

      console.log(`Creating ${numObjects} projects took ${elapsedTime} milliseconds.`);
    }
  }, 30000); // Set a higher timeout value (e.g., 30 seconds)

  // Test the performance of retrieving Projects
  test('Retrieve Project - Performance Test', async () => {
    const numObjectsArray = [1, 20, 40, 60, 80];

    for (const numObjects of numObjectsArray) {
      const startTime = new Date();

      for (let i = 0; i < numObjects; i++) {
        const response = await axios.get(`http://localhost:4567/projects/${createdProjectIds[i]}`);
        expect(response.status).toBe(200);
      }

      const endTime = new Date();
      const elapsedTime = endTime - startTime;

      console.log(`Retrieving ${numObjects} projects took ${elapsedTime} milliseconds.`);
    }
  }, 30000); // Set a higher timeout value (e.g., 30 seconds)

  // Test the performance of updating Projects
  test('Update Project - Performance Test', async () => {
    const updatedProjectData = {
      title: 'Updated Performance Test Project',
      completed: true,
      active: false,
      description: 'This is an updated performance test project.',
    };

    const numObjectsArray = [1, 20, 40, 60, 80];

    for (const numObjects of numObjectsArray) {
      const startTime = new Date();

      for (let i = 0; i < numObjects; i++) {
        const response = await axios.put(`http://localhost:4567/projects/${createdProjectIds[i]}`, updatedProjectData);
        expect(response.status).toBe(200);
      }

      const endTime = new Date();
      const elapsedTime = endTime - startTime;

      console.log(`Updating ${numObjects} projects took ${elapsedTime} milliseconds.`);
    }
  }, 30000); // Set a higher timeout value (e.g., 30 seconds)
});

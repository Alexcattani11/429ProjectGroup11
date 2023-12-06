const axios = require('axios');



describe('Performance Testing for TODOs', () => {
  let createdTodoIds = [];

  // Test the performance of creating TODOs
  test('Create Todo - Performance Test', async () => {
    const todoData = {
      title: 'Performance Test Todo',
      doneStatus: false,
      description: 'This is a performance test todo.',
    };

    const numObjectsArray = [1, 10, 100, 1000, 10000];

    for (const numObjects of numObjectsArray) {
      const startTime = new Date();

      for (let i = 0; i < numObjects; i++) {
        const response = await axios.post('http://localhost:4567/todos', todoData);
        createdTodoIds.push(response.data.id);
      }

      const endTime = new Date();
      const elapsedTime = endTime - startTime;

      console.log(`Creating ${numObjects} todos took ${elapsedTime} milliseconds.`);
    }
  }, 30000); // Set a higher timeout value (e.g., 30 seconds)

  // Test the performance of retrieving TODOs
  test('Retrieve Todo - Performance Test', async () => {
    const numObjectsArray = [1, 20, 40, 60, 80, 100];

    for (const numObjects of numObjectsArray) {
      const startTime = new Date();

      for (let i = 0; i < numObjects; i++) {
        const response = await axios.get(`http://localhost:4567/todos/${createdTodoIds[i]}`);
        expect(response.status).toBe(200);
      }

      const endTime = new Date();
      const elapsedTime = endTime - startTime;

      console.log(`Retrieving ${numObjects} todos took ${elapsedTime} milliseconds.`);
    }
  }, 30000); // Set a higher timeout value (e.g., 30 seconds)

   // Test the performance of updating TODOs
  test('Update Todo - Performance Test', async () => {
    const updatedTodoData = {
      title: 'Updated Performance Test Todo',
      doneStatus: true,
      description: 'This is an updated performance test todo.',
    };

    const numObjectsArray = [1, 20, 40, 60, 80, 100];

    for (const numObjects of numObjectsArray) {
      const startTime = new Date();

      for (let i = 0; i < numObjects; i++) {
        const response = await axios.put(`http://localhost:4567/todos/${createdTodoIds[i]}`, updatedTodoData);
        expect(response.status).toBe(200);
      }

      const endTime = new Date();
      const elapsedTime = endTime - startTime;

      console.log(`Updating ${numObjects} todos took ${elapsedTime} milliseconds.`);
    }
  }, 30000); // Set a higher timeout value (e.g., 30 seconds)
});

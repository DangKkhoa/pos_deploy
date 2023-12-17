// Asynchronous function that returns a promise
function delay(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
  
  // Asynchronous function using async/await
  async function exampleAsyncFunction() {
    console.log('Start of the function');
  
    try {
      // Simulate an asynchronous operation (e.g., API request, database query)
      await delay(2000);
      console.log('After waiting for 2 seconds');
  
      // Another asynchronous operation
    //   await delay(1000);
      console.log('After waiting for another second');
  
      // Throw an error to demonstrate error handling
    //   throw new Error('Something went wrong');
  
    } catch (error) {
      console.error('Error:', error.message);
      // Rethrow the error or handle it as needed
      throw error;
    }
  
    console.log('End of the function');
  }
  
  // Call the asynchronous function
  exampleAsyncFunction()
    .then(() => {
      console.log('Async function completed successfully');
    })
    .catch(error => {
      console.error('Async function failed:', error.message);
    });
  
// Simple test to debug search functionality
const ENV = {
  apiUrl: "http://localhost:5027/api",
};

const BOOKS_API_BASE = `${ENV.apiUrl}/manage/Book`;

console.log("Testing basic API call first...");

// Test 1: Basic API call without filters
fetch(`${BOOKS_API_BASE}`)
  .then((response) => {
    console.log("Basic call - Response status:", response.status);
    return response.json();
  })
  .then((data) => {
    console.log("Basic call - Results:", data);
  })
  .catch((error) => {
    console.error("Basic call - Error:", error);
  });

// Test 2: Simple filter
setTimeout(() => {
  console.log("\nTesting simple filter...");
  const simpleFilter = `contains(title, 'Harry')`;
  const query = `?$filter=${encodeURIComponent(simpleFilter)}`;

  console.log("Simple filter URL:", `${BOOKS_API_BASE}${query}`);

  fetch(`${BOOKS_API_BASE}${query}`)
    .then((response) => {
      console.log("Simple filter - Response status:", response.status);
      return response.json();
    })
    .then((data) => {
      console.log("Simple filter - Results:", data);
    })
    .catch((error) => {
      console.error("Simple filter - Error:", error);
    });
}, 1000);

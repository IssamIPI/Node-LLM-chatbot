// public/main.js
document.addEventListener('DOMContentLoaded', () => {
    const fetchData = async (query) => {
      try {
        const response = await fetch(`/api/example?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        document.getElementById('data').textContent = JSON.stringify(data);
      } catch (error) {
        document.getElementById('data').textContent = 'Error fetching data';
      }
    };
  
    // Fetch data with a default query
    fetchData('How are you doing today?');
  
    // Example to handle a form or button to pass a user query
    const form = document.getElementById('queryForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = document.getElementById('queryInput').value;
        fetchData(query);
      });
    }
  });
  
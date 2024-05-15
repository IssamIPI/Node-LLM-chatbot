// public/main.js
document.addEventListener('DOMContentLoaded', () => {
    const fetchData = async (query) => {
      try {
        const response = await fetch(`/api/example?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        document.getElementById('data').innerHTML = marked.parse(data);
      } catch (error) {
        console.log(error)
        document.getElementById('data').textContent = 'Error fetching data';
      }
    };
    fetchData('Introduce yourself and ask if i have any questions for you')
  
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
  
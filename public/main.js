// public/main.js
document.addEventListener('DOMContentLoaded', () => {
  const apiForm = document.querySelector('.app_api-request');

  const fetchData = async (query,file) => {
      const formData = new FormData();
      formData.append('q', query);
      if (file) {
        formData.append('file', file);
      }
      try {
        const response = await fetch(`/api/chatModel`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();

        let answer = marked.parse(data);
        displayReturnedAnswer(answer);
        apiForm.classList.remove('app_api-request--loading');
      } catch (error) {
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
        document.getElementById('queryInput').value = '';
        apiForm.classList.add('app_api-request--loading');
        const file = document.getElementById('fileInput').files[0];
        displayAskedQuestion(query);
        fetchData(query,file);
      });
    }
  });

function displayAskedQuestion(data) {
  const screen = document.querySelector('.app_api-response');
  const lineQuestion = document.createElement('p');
  lineQuestion.classList.add('app_questions');
  lineQuestion.innerHTML = data;
  screen.appendChild(lineQuestion);
}

function displayReturnedAnswer(data) {
  const screen = document.querySelector('.app_api-response');
  const lineAnswer = document.createElement('p');
  lineAnswer.classList.add('app_answers');
  lineAnswer.innerHTML = data;
  screen.appendChild(lineAnswer);
}

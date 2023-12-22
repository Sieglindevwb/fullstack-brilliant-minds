// create.js
document.addEventListener('DOMContentLoaded', () => {
  const createForm = document.getElementById('createForm');

  // Use Fetch to send a new idea to the server when the form is submitted
  createForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(createForm);
    const ideaData = {
      title: formData.get('title'),
      description: formData.get('description'),
    };

    try {
      const response = await fetch('http://localhost:3000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ideaData),
      });

      if (response.ok) {
        console.log('New idea submitted successfully.');
        // Redirect to the landing page after successful submission
        window.location.href = 'index.html';
      } else {
        console.error('Failed to submit new idea.');
      }
    } catch (error) {
      console.error('Error submitting new idea:', error);
    }
  });
});

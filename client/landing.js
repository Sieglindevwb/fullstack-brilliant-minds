document.addEventListener('DOMContentLoaded', () => {
  const ideaListContainer = document.getElementById('ideaList');

  const deleteIdea = async (ideaId) => {
    try {
      const response = await fetch(`http://localhost:3000/ideas/${ideaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log(`Idea with ID ${ideaId} deleted successfully.`);
        fetchIdeas();
      } else {
        console.error(`Failed to delete idea with ID ${ideaId}.`);
      }
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  const editIdea = (ideaId) => {
    const confirmation = confirm('Do you want to edit this idea?');
    if (!confirmation) {
      return;
    }

    const newTitle = prompt('Enter new title:');
    const newDescription = prompt('Enter new description:');

    if (newTitle && newDescription) {
      updateIdea(ideaId, newTitle, newDescription);
    } else {
      alert('Invalid input. Title and description are required.');
    }
  };

  const renderIdea = (idea) => {
    const ideaContainer = document.createElement('div');
    ideaContainer.innerHTML = `
      <p>Title: ${idea.title}</p>
      <p>Description: ${idea.description}</p>
      <button class="delete-btn" data-idea-id="${idea.id}">Delete</button>
      <button class="edit-btn" data-idea-id="${idea.id}">Edit</button>
    `;

    const deleteBtn = ideaContainer.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteIdea(idea.id));

    const editBtn = ideaContainer.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => editIdea(idea.id));

    ideaListContainer.appendChild(ideaContainer);
  };

  const fetchIdeas = async () => {
    try {
      const response = await fetch('http://localhost:3000/');
      const ideas = await response.json();

      ideaListContainer.innerHTML = '';
      ideas.forEach(renderIdea);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    }
  };

  const updateIdea = async (ideaId, newTitle, newDescription) => {
    try {
      const response = await fetch(`http://localhost:3000/ideas/${ideaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });

      if (response.ok) {
        alert(`Idea with ID ${ideaId} updated successfully.`);
        fetchIdeas();
      } else {
        alert(`Failed to update idea with ID ${ideaId}.`);
      }
    } catch (error) {
      console.error('Error updating idea:', error);
      alert('Error updating idea. Please try again.');
    }
  };

  fetchIdeas();
});

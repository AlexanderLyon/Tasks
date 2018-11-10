
(() => {
  const removedTasks = [];

  document.getElementById('undoBtn').addEventListener('click', (e) => {
    restoreTask();
  });


  function attachTaskEventHandlers(element) {
    /* Sets event listeners for task item */
    const options = element.querySelector('.options');

    element.addEventListener('click', (e) => {
      e.stopPropagation();
      if (element.classList.contains('edit-mode')) {
        // Editable
      }
      else if (!options.contains(e.target)) {
        crossOff(element);
      }
      else {
        // Do nothing
      }
    });

    /*
    options.addEventListener('click', (e) => {
      // Options button
      if (e.target.matches('.optionsBtn') || e.target.parentElement.matches('.optionsBtn')) {
        if (element.classList.contains('options-open')) {
          // Close options
          element.classList.remove('options-open');
        }
        else {
          // Open options
          element.classList.add('options-open');
        }
      }

      // Delete button
      else if (e.target.matches('.deleteBtn') || e.target.parentElement.matches('.deleteBtn')) {
        removedTasks.push(element.querySelector('.task-content').innerText);
        deleteFromDatabase(Number(element.getAttribute('data-note-id')));
        document.getElementById('undoBtn').style.display = (removedTasks.length == 0) ? 'none' : 'block';
      }

      // Edit button
      else if (e.target.matches('.editBtn') || e.target.parentElement.matches('.editBtn')) {
        if (element.classList.contains('edit-mode')) {
          // Disable editing
          element.classList.remove('edit-mode');
          element.querySelector('.task-content').blur();
          element.querySelector('.task-content').setAttribute('contenteditable', false);
          element.querySelector('.editBtn i').classList.replace('fa-save', 'fa-pencil-alt');
        }
        else {
          // Enable editing
          element.classList.add('edit-mode');
          element.querySelector('.task-content').setAttribute('contenteditable', true);
          element.querySelector('.editBtn i').classList.replace('fa-pencil-alt', 'fa-save');
          element.querySelector('.task-content').focus();

          // Move caret:
          let textNode = element.querySelector('.task-content').firstChild;
          let caret = textNode.length;
          let range = document.createRange();
          range.setStart(textNode, caret);
          range.setEnd(textNode, caret);
          let sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    });
    */

    element.querySelector('.task-content').addEventListener('keydown', (e) => {
      if (e.keyCode === 13) {
        e.preventDefault();

        // Disable editing
        element.classList.remove('edit-mode');
        element.querySelector('.task-content').blur();
        element.querySelector('.task-content').setAttribute('contenteditable', false);
        element.querySelector('.editBtn i').classList.replace('fa-save', 'fa-pencil-alt');
        element.querySelector('.optionsBtn').click();
      }
    });

    element.querySelector('.task-content').addEventListener('keyup', (e) => {
      // Edit database entry
      let newText = e.target.innerText;
      let key = element.getAttribute('data-note-id');
      let transaction = database.transaction(['notes'], 'readwrite');
      let objectStore = transaction.objectStore('notes');

      objectStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.key == key) {
            const updateData = cursor.value;
            updateData.body = newText;
            const request = cursor.update(updateData);
            request.onsuccess = function() {
              // Database updated
            };
          }
          cursor.continue();
        }
      };
    });
  }

})();

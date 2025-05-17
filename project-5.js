// ===== DOM ELEMENT SELECTIONS =====
// Get all the HTML elements we need to work with
const studentInput = document.getElementById('studentInput');          // Input field for new student names
const addButton = document.getElementById('addButton');                // Button to add new students
const editSection = document.getElementById('editSection');            // Section that appears when editing
const editInput = document.getElementById('editInput');                // Input field for editing names
const saveButton = document.getElementById('saveButton');              // Button to save edits
const cancelButton = document.getElementById('cancelButton');          // Button to cancel edits
const clearAllButton = document.getElementById('clearAllButton');      // Button to clear all students
const studentList = document.getElementById('studentList');            // The list that shows all students
const emptyMessage = document.getElementById('emptyMessage');          // Message shown when list is empty
const errorMessage = document.getElementById('errorMessage');          // Message for errors
const searchInput = document.getElementById('searchInput');            // Input field for searching
const studentCount = document.getElementById('studentCount');          // Element showing student count

// ===== STATE VARIABLES =====
// Variables to keep track of our data and current state
let students = [];              // Array to store all student names
let editingIndex = null;        // Index of student being edited (null if not editing)
let dragStartIndex;             // Index of student being dragged (for drag & drop)

// ===== UTILITY FUNCTIONS =====

// Show an error message that disappears after 3 seconds
const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');

    // Automatically hide error after 3 seconds
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 3000);
};

// Update the student count display
const updateStudentCount = () => {
    const count = students.length;
    studentCount.textContent = `${count} student${count !== 1 ? 's' : ''}`;
};

// ===== MAIN FUNCTIONS =====

// Display the list of students
const renderStudentList = (filteredStudents = null) => {
    // Use filtered students if provided, otherwise use all students
    const studentsToRender = filteredStudents || students;

    // Clear the current list
    studentList.innerHTML = '';

    // Show empty message if no students, hide it otherwise
    if (students.length === 0) {
        emptyMessage.classList.remove('hidden');
    } else {
        emptyMessage.classList.add('hidden');
    }

    // Update the counter showing how many students we have
    updateStudentCount();

    // Create and add each student to the list
    studentsToRender.forEach((student, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'student-item';
        listItem.draggable = true;
        listItem.dataset.index = index;

        // Create the student list item with drag handle, name, and buttons
        listItem.innerHTML = `
            <span class="drag-handle">≡</span>
            <span class="student-name">• ${student}</span>
            <div class="student-actions">
                <button class="button-edit" data-action="edit" data-index="${index}">Edit</button>
                <button class="button-delete" data-action="delete" data-index="${index}">Delete</button>
            </div>
        `;

        // Add all the drag and drop event listeners
        listItem.addEventListener('dragstart', handleDragStart);
        listItem.addEventListener('dragover', handleDragOver);
        listItem.addEventListener('drop', handleDrop);
        listItem.addEventListener('dragenter', handleDragEnter);
        listItem.addEventListener('dragleave', handleDragLeave);
        listItem.addEventListener('dragend', handleDragEnd);

        // Add the finished list item to the student list
        studentList.appendChild(listItem);
    });
};

// Add a new student
const addStudent = () => {
    const name = studentInput.value.trim();

    // Make sure the name is not empty
    if (!name) {
        showError('Please enter a student name');
        return;
    }

    // Add the student to our array and clear the input
    students.push(name);
    studentInput.value = '';

    // Update the display
    renderStudentList();
};

// Search through students by name
const searchStudents = () => {
    const searchTerm = searchInput.value.toLowerCase().trim();

    // If search is empty, show all students
    if (!searchTerm) {
        renderStudentList();
        return;
    }

    // Filter students that match the search term
    const filteredStudents = students.filter(student =>
        student.toLowerCase().includes(searchTerm)
    );

    // Display only the matching students
    renderStudentList(filteredStudents);
};

// Begin editing a student's name
const startEdit = (index) => {
    editingIndex = index;
    editInput.value = students[index];
    editSection.classList.remove('hidden');
};

// Save the edited student name
const saveEdit = () => {
    const name = editInput.value.trim();

    // Make sure the edited name is not empty
    if (!name) {
        showError('Student name cannot be empty');
        return;
    }

    // Save the edited name and exit edit mode
    if (editingIndex !== null) {
        students[editingIndex] = name;
        cancelEdit();
        renderStudentList();
    }
};

// Cancel editing and hide the edit section
const cancelEdit = () => {
    editingIndex = null;
    editSection.classList.add('hidden');
};

// Delete a student by index
const deleteStudent = (index) => {
    students.splice(index, 1);

    // If we were editing this student or one after it, handle that properly
    if (editingIndex === index) {
        cancelEdit();
    } else if (editingIndex !== null && editingIndex > index) {
        editingIndex--;
    }

    // Update the display
    renderStudentList();
};

// Remove all students after confirmation
const clearAllStudents = () => {
    if (students.length === 0) return;

    if (confirm('Are you sure you want to clear all students?')) {
        students = [];
        cancelEdit();
        renderStudentList();
    }
};

// ===== DRAG AND DROP FUNCTIONS =====

// When user starts dragging a student
const handleDragStart = (e) => {
    // Get the index of the student being dragged
    dragStartIndex = parseInt(e.target.closest('li').dataset.index);

    // Add visual feedback
    e.target.classList.add('dragging');

    // Set up the drag operation
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
};

// When dragging over a drop zone
const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
};

// When entering a potential drop zone
const handleDragEnter = (e) => {
    const listItem = e.target.closest('li');
    if (listItem) {
        listItem.classList.add('dragover');
    }
};

// When leaving a potential drop zone
const handleDragLeave = (e) => {
    const listItem = e.target.closest('li');
    if (listItem) {
        listItem.classList.remove('dragover');
    }
};

// When dropping a student onto a new position
const handleDrop = (e) => {
    e.preventDefault();

    // Get the index of where we're dropping
    const dragEndIndex = parseInt(e.target.closest('li').dataset.index);

    // Swap the students in our array
    swapItems(dragStartIndex, dragEndIndex);

    // Clean up visual effects
    document.querySelectorAll('.student-item').forEach(item => {
        item.classList.remove('dragover');
    });
};

// Clean up after drag ends
const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
};

// Swap two students in the array
const swapItems = (fromIndex, toIndex) => {
    // Get both students
    const itemOne = students[fromIndex];
    const itemTwo = students[toIndex];

    // Swap their positions
    students[fromIndex] = itemTwo;
    students[toIndex] = itemOne;

    // Update the display
    renderStudentList();
};

// ===== EVENT LISTENERS =====

// Listen for clicks on the student list (using event delegation)
studentList.addEventListener('click', (e) => {
    const target = e.target;

    // Check if a button was clicked
    if (target.tagName === 'BUTTON') {
        const action = target.dataset.action;
        const index = parseInt(target.dataset.index);

        // Perform the appropriate action
        if (action === 'edit') {
            startEdit(index);
        } else if (action === 'delete') {
            deleteStudent(index);
        }
    }
});

// Main button click events
addButton.addEventListener('click', addStudent);
saveButton.addEventListener('click', saveEdit);
cancelButton.addEventListener('click', cancelEdit);
clearAllButton.addEventListener('click', clearAllStudents);

// Search as user types
searchInput.addEventListener('input', searchStudents);

// Allow adding a student by pressing Enter
studentInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addStudent();
    }
});

// ===== INITIALIZATION =====
// Start by rendering the empty list
renderStudentList();

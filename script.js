// Data storage
let courses = [];
let reminders = [];
let schedule = [];
let materials = [];
let todos = [];
let assignments = [];
let exams = [];
let quizzes = [];
let memories = [];

// Tab functionality
function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let content of tabContents) {
        content.classList.remove('active');
    }
    
    const tabBtns = document.getElementsByClassName('tab-btn');
    for (let btn of tabBtns) {
        btn.classList.remove('active');
    }
    
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

// Reminders functions
function addReminder() {
    const title = document.getElementById('reminderTitle').value;
    const type = document.getElementById('reminderType').value;
    const dateTime = document.getElementById('reminderDateTime').value;
    const priority = document.getElementById('reminderPriority').value;
    const course = document.getElementById('reminderCourse').value;
    const alert = document.getElementById('reminderAlert').value;
    const notes = document.getElementById('reminderNotes').value;
    const recurring = document.getElementById('reminderRecurring').checked;
    const recurrence = document.getElementById('reminderRecurrence').value;

    if (!title || !dateTime) {
        alert('Please fill in title and date/time');
        return;
    }

    reminders.push({
        id: Date.now(),
        title,
        type,
        dateTime,
        priority,
        course,
        alert,
        notes,
        recurring,
        recurrence,
        completed: false,
        created: new Date()
    });

    // Clear form
    document.getElementById('reminderTitle').value = '';
    document.getElementById('reminderDateTime').value = '';
    document.getElementById('reminderCourse').value = '';
    document.getElementById('reminderNotes').value = '';
    document.getElementById('reminderRecurring').checked = false;
    document.getElementById('recurringOptions').style.display = 'none';
    
    renderReminders();
    updateReminderDashboard();
}

function renderReminders() {
    const container = document.getElementById('remindersList');
    const now = new Date();
    
    // Sort reminders by date
    const sortedReminders = reminders.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    
    let html = sortedReminders.map(reminder => {
        const reminderDate = new Date(reminder.dateTime);
        const timeDiff = reminderDate - now;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        const hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));
        
        // Determine urgency class and time display
        let urgencyClass = 'reminder-normal';
        let timeDisplay = '';
        let timeClass = 'time-later';
        
        if (reminder.completed) {
            urgencyClass = 'reminder-completed';
            timeDisplay = '✅ Completed';
            timeClass = 'time-later';
        } else if (timeDiff < 0) {
            urgencyClass = 'reminder-urgent';
            timeDisplay = `⚠️ ${Math.abs(daysDiff)} days overdue`;
            timeClass = 'time-overdue';
        } else if (hoursDiff <= 2) {
            urgencyClass = 'reminder-urgent';
            timeDisplay = `🚨 Due in ${Math.max(1, hoursDiff)} hours`;
            timeClass = 'time-urgent';
        } else if (daysDiff === 0) {
            urgencyClass = 'reminder-today';
            timeDisplay = '📅 Due today';
            timeClass = 'time-urgent';
        } else if (daysDiff <= 3) {
            urgencyClass = 'reminder-upcoming';
            timeDisplay = `📆 Due in ${daysDiff} days`;
            timeClass = 'time-soon';
        } else if (daysDiff <= 7) {
            urgencyClass = 'reminder-upcoming';
            timeDisplay = `🗓️ Due in ${daysDiff} days`;
            timeClass = 'time-soon';
        } else {
            timeDisplay = `📅 Due ${reminderDate.toLocaleDateString()}`;
        }
        
        const typeEmoji = getTypeEmoji(reminder.type);
        const priorityColor = reminder.priority === 'high' ? '#f44336' : 
                                '#ff9800';
        
        return `
            <div class="card reminder-card ${urgencyClass}">
                <div class="reminder-header">
                    <div style="flex-grow: 1;">
                        <h3 style="margin-bottom: 5px;">${reminder.title}</h3>
                        <div class="time-remaining ${timeClass}">${timeDisplay}</div>
                    </div>
                    <div class="reminder-type" style="background: ${priorityColor}20; color: ${priorityColor};">
                        ${typeEmoji} ${reminder.type.replace('-', ' ')}
                    </div>
                </div>
                <p><strong>📅 Date:</strong> ${reminderDate.toLocaleString()}</p>
                ${reminder.course ? `<p><strong>📚 Course:</strong> ${reminder.course}</p>` : ''}
                <p><strong>⏰ Alert:</strong> ${getAlertText(reminder.alert)}</p>
                ${reminder.notes ? `<div style="margin: 10px 0; font-style: italic; color: #666;">${reminder.notes}</div>` : ''}
                ${reminder.recurring ? `<p><strong>🔄 Repeats:</strong> ${reminder.recurrence}</p>` : ''}
                <div style="margin-top: 15px;">
                    <button class="btn" onclick="toggleReminderComplete(${reminder.id})" style="background: ${reminder.completed ? '#4caf50' : '#2196f3'};">
                        ${reminder.completed ? '↩️ Mark Incomplete' : '✅ Mark Complete'}
                    </button>
                    <button class="btn btn-danger" onclick="deleteReminder(${reminder.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function getTypeEmoji(type) {
    const emojis = {
        'assignment': '📝',
        'exam': '🎯',
        'quiz': '❓',
        'study': '📚',
        'meeting': '👥',
        'deadline': '⏳',
        'event': '🎉',
        'personal': '📌'
    };
    return emojis[type] || '📌';
}

function getAlertText(minutes) {
    if (minutes == 0) return 'At the time';
    if (minutes < 60) return `${minutes} minutes before`;
    if (minutes < 1440) return `${minutes/60} hours before`;
    return `${minutes/1440} days before`;
}

function updateReminderDashboard() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const totalReminders = reminders.length;
    const completedReminders = reminders.filter(r => r.completed).length;
    const urgentReminders = reminders.filter(r => {
        if (r.completed) return false;
        const reminderDate = new Date(r.dateTime);
        return reminderDate.toDateString() === today.toDateString();
    }).length;
    const upcomingReminders = reminders.filter(r => {
        if (r.completed) return false;
        const reminderDate = new Date(r.dateTime);
        return reminderDate > today && reminderDate <= weekFromNow;
    }).length;
    
    document.getElementById('totalReminders').textContent = totalReminders;
    document.getElementById('urgentReminders').textContent = urgentReminders;
    document.getElementById('upcomingReminders').textContent = upcomingReminders;
    document.getElementById('completedReminders').textContent = completedReminders;
}

function toggleReminderComplete(id) {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
        reminder.completed = !reminder.completed;
        renderReminders();
        updateReminderDashboard();
    }
}

function deleteReminder(id) {
    reminders = reminders.filter(r => r.id !== id);
    renderReminders();
    updateReminderDashboard();
}

// Toggle recurring options
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('reminderRecurring')) {
        document.getElementById('reminderRecurring').addEventListener('change', function() {
            const recurringOptions = document.getElementById('recurringOptions');
            if (this.checked) {
                recurringOptions.style.display = 'block';
            } else {
                recurringOptions.style.display = 'none';
            }
        });
    }
});

// Courses functions
function addCourse() {
    const code = document.getElementById('courseCode').value;
    const name = document.getElementById('courseName').value;
    const instructor = document.getElementById('courseInstructor').value;
    const credits = document.getElementById('courseCredits').value;
    const semester = document.getElementById('courseSemester').value;
    const location = document.getElementById('courseLocation').value;
    const description = document.getElementById('courseDescription').value;
    const status = document.getElementById('courseStatus').value;
    const grade = document.getElementById('courseGrade').value;

    if (!code || !name) {
        alert('Please fill in course code and name');
        return;
    }

    courses.push({
        id: Date.now(),
        code,
        name,
        instructor,
        credits,
        semester,
        location,
        description,
        status,
        grade
    });

    // Clear form
    document.getElementById('courseCode').value = '';
    document.getElementById('courseName').value = '';
    document.getElementById('courseInstructor').value = '';
    document.getElementById('courseCredits').value = '';
    document.getElementById('courseLocation').value = '';
    document.getElementById('courseDescription').value = '';
    document.getElementById('courseGrade').value = '';
    
    renderCourses();
}

function renderCourses() {
    const container = document.getElementById('coursesList');
    let html = courses.map(course => {
        let gradeSection = '';
        if (course.grade && course.status === 'completed') {
            gradeSection = `<p><strong>Grade:</strong> ${course.grade}</p>`;
        }
        
        return `
            <div class="card course-card">
                <div class="course-header">
                    <div class="course-title">
                        <h3>${course.name}</h3>
                    </div>
                    <div class="course-code">${course.code}</div>
                </div>
                <p><strong>Instructor:</strong> ${course.instructor || 'TBD'}</p>
                <p><strong>Credits:</strong> ${course.credits || 'N/A'} | <strong>Semester:</strong> ${course.semester}</p>
                <p><strong>Location:</strong> ${course.location || 'TBD'}</p>
                <p><strong>Status:</strong> <span class="course-status status-${course.status}">${course.status.replace('-', ' ')}</span></p>
                ${gradeSection}
                <div style="margin-top: 10px; font-style: italic; color: #666;">${course.description}</div>
                <button class="btn btn-danger" onclick="deleteCourse(${course.id})" style="margin-top: 15px;">Delete</button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function deleteCourse(id) {
    courses = courses.filter(course => course.id !== id);
    renderCourses();
}

// Schedule functions
function addScheduleItem() {
    const day = document.getElementById('scheduleDay').value;
    const time = document.getElementById('scheduleTime').value;
    const subject = document.getElementById('scheduleSubject').value;
    const location = document.getElementById('scheduleLocation').value;

    if (!time || !subject) {
        alert('Please fill in time and subject');
        return;
    }

    schedule.push({
        id: Date.now(),
        day,
        time,
        subject,
        location
    });

    document.getElementById('scheduleTime').value = '';
    document.getElementById('scheduleSubject').value = '';
    document.getElementById('scheduleLocation').value = '';
    
    renderSchedule();
}

function renderSchedule() {
    const container = document.getElementById('scheduleList');
    const groupedSchedule = {};
    
    schedule.forEach(item => {
        if (!groupedSchedule[item.day]) {
            groupedSchedule[item.day] = [];
        }
        groupedSchedule[item.day].push(item);
    });

    let html = '';
    Object.keys(groupedSchedule).sort().forEach(day => {
        html += `<div class="card">
            <h3>${day}</h3>`;
        groupedSchedule[day].sort((a, b) => a.time.localeCompare(b.time)).forEach(item => {
            html += `
                <div class="schedule-item">
                    <span class="time-slot">${item.time}</span>
                    <span class="subject">${item.subject}</span>
                    <span class="location">${item.location || ''}</span>
                    <button class="btn btn-danger" onclick="deleteScheduleItem(${item.id})" style="padding: 5px 10px; font-size: 12px;">×</button>
                </div>`;
        });
        html += '</div>';
    });

    container.innerHTML = html;
}

function deleteScheduleItem(id) {
    schedule = schedule.filter(item => item.id !== id);
    renderSchedule();
}

// Materials functions
function addMaterial() {
    const subject = document.getElementById('materialSubject').value;
    const title = document.getElementById('materialTitle').value;
    const type = document.getElementById('materialType').value;
    const description = document.getElementById('materialDescription').value;
    const fileInput = document.getElementById('materialFile');
    let fileName = '';
    let fileDataUrl = '';

    if (!subject || !title) {
        alert('Please fill in subject and title');
        return;
    }

    if (fileInput.files && fileInput.files[0]) {
        fileName = fileInput.files[0].name;
        const reader = new FileReader();
        reader.onload = function(e) {
            fileDataUrl = e.target.result;
            saveMaterial(subject, title, type, description, fileName, fileDataUrl);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveMaterial(subject, title, type, description, fileName, fileDataUrl);
    }
}

function saveMaterial(subject, title, type, description, fileName, fileDataUrl) {
    materials.push({
        id: Date.now(),
        subject,
        title,
        type,
        description,
        fileName,
        fileDataUrl
    });

    document.getElementById('materialSubject').value = '';
    document.getElementById('materialTitle').value = '';
    document.getElementById('materialDescription').value = '';
    document.getElementById('materialFile').value = '';
    
    renderMaterials();
}

function renderMaterials() {
    const container = document.getElementById('materialsList');
    let html = materials.map(material => {
        let fileSection = '';
        if (material.fileName) {
            fileSection = `
                <div class="file-display">
                    <strong>📎 File:</strong> ${material.fileName}
                    <a href="${material.fileDataUrl}" download="${material.fileName}" class="file-link">Download</a>
                </div>
            `;
        }
        
        return `
            <div class="card">
                <h3>${material.title}</h3>
                <p><strong>Subject:</strong> ${material.subject}</p>
                <p><strong>Type:</strong> ${material.type}</p>
                <div>${material.description}</div>
                ${fileSection}
                <button class="btn btn-danger" onclick="deleteMaterial(${material.id})" style="margin-top: 10px;">Delete</button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function deleteMaterial(id) {
    materials = materials.filter(item => item.id !== id);
    renderMaterials();
}

// Todo functions
function addTodo() {
    const task = document.getElementById('todoTask').value;
    const priority = document.getElementById('todoPriority').value;
    const dueDate = document.getElementById('todoDueDate').value;

    if (!task) {
        alert('Please enter a task');
        return;
    }

    todos.push({
        id: Date.now(),
        task,
        priority,
        dueDate,
        completed: false
    });

    document.getElementById('todoTask').value = '';
    document.getElementById('todoDueDate').value = '';
    
    renderTodos();
}

function renderTodos() {
    const container = document.getElementById('todoList');
    let html = todos.map(todo => {
        const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleString() : 'No due date';
        return `
            <div class="card priority-${todo.priority} ${todo.completed ? 'completed' : ''}">
                <h3>${todo.task}</h3>
                <p><strong>Priority:</strong> ${todo.priority.toUpperCase()}</p>
                <p><strong>Due:</strong> ${dueDate}</p>
                <button class="btn" onclick="toggleTodo(${todo.id})">${todo.completed ? 'Mark Incomplete' : 'Mark Complete'}</button>
                <button class="btn btn-danger" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function toggleTodo(id) {
    const todo = todos.find(item => item.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(item => item.id !== id);
    renderTodos();
}

// Assignment functions
function addAssignment() {
    const subject = document.getElementById('assignmentSubject').value;
    const title = document.getElementById('assignmentTitle').value;
    const dueDate = document.getElementById('assignmentDue').value;
    const status = document.getElementById('assignmentStatus').value;
    const notes = document.getElementById('assignmentNotes').value;

    if (!subject || !title || !dueDate) {
        alert('Please fill in subject, title, and due date');
        return;
    }

    assignments.push({
        id: Date.now(),
        subject,
        title,
        dueDate,
        status,
        notes
    });

    document.getElementById('assignmentSubject').value = '';
    document.getElementById('assignmentTitle').value = '';
    document.getElementById('assignmentDue').value = '';
    document.getElementById('assignmentNotes').value = '';
    
    renderAssignments();
}

function renderAssignments() {
    const container = document.getElementById('assignmentsList');
    let html = assignments.map(assignment => {
        const dueDate = new Date(assignment.dueDate).toLocaleString();
        const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== 'completed';
        const statusClass = isOverdue ? 'status-overdue' : `status-${assignment.status}`;
        
        return `
            <div class="card">
                <h3>${assignment.title}</h3>
                <p><strong>Subject:</strong> ${assignment.subject}</p>
                <p><strong>Due:</strong> ${dueDate}</p>
                <p><strong>Status:</strong> <span class="status ${statusClass}">${assignment.status}</span></p>
                <div>${assignment.notes}</div>
                <button class="btn btn-danger" onclick="deleteAssignment(${assignment.id})" style="margin-top: 10px;">Delete</button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function deleteAssignment(id) {
    assignments = assignments.filter(item => item.id !== id);
    renderAssignments();
}

// Exam functions
function addExam() {
    const subject = document.getElementById('examSubject').value;
    const type = document.getElementById('examType').value;
    const date = document.getElementById('examDate').value;
    const location = document.getElementById('examLocation').value;
    const notes = document.getElementById('examNotes').value;

    if (!subject || !date) {
        alert('Please fill in subject and date');
        return;
    }

    exams.push({
        id: Date.now(),
        subject,
        type,
        date,
        location,
        notes
    });

    document.getElementById('examSubject').value = '';
    document.getElementById('examDate').value = '';
    document.getElementById('examLocation').value = '';
    document.getElementById('examNotes').value = '';
    
    renderExams();
}

function renderExams() {
    const container = document.getElementById('examsList');
    let html = exams.map(exam => {
        const examDate = new Date(exam.date).toLocaleString();
        return `
            <div class="card">
                <h3>${exam.subject} - ${exam.type}</h3>
                <p><strong>Date:</strong> ${examDate}</p>
                <p><strong>Location:</strong> ${exam.location || 'TBD'}</p>
                <div><strong>Notes:</strong> ${exam.notes}</div>
                <button class="btn btn-danger" onclick="deleteExam(${exam.id})" style="margin-top: 10px;">Delete</button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function deleteExam(id) {
    exams = exams.filter(item => item.id !== id);
    renderExams();
}

// Quiz functions
function addQuiz() {
    const subject = document.getElementById('quizSubject').value;
    const title = document.getElementById('quizTitle').value;
    const date = document.getElementById('quizDate').value;
    const score = document.getElementById('quizScore').value;
    const status = document.getElementById('quizStatus').value;

    if (!subject || !title || !date) {
        alert('Please fill in subject, title, and date');
        return;
    }

    quizzes.push({
        id: Date.now(),
        subject,
        title,
        date,
        score,
        status
    });

    document.getElementById('quizSubject').value = '';
    document.getElementById('quizTitle').value = '';
    document.getElementById('quizDate').value = '';
    document.getElementById('quizScore').value = '';
    
    renderQuizzes();
}

function renderQuizzes() {
    const container = document.getElementById('quizzesList');
    let html = quizzes.map(quiz => {
        const quizDate = new Date(quiz.date).toLocaleString();
        return `
            <div class="card">
                <h3>${quiz.title}</h3>
                <p><strong>Subject:</strong> ${quiz.subject}</p>
                <p><strong>Date:</strong> ${quizDate}</p>
                <p><strong>Score:</strong> ${quiz.score || 'Not yet taken'}</p>
                <p><strong>Status:</strong> <span class="status status-${quiz.status}">${quiz.status}</span></p>
                <button class="btn btn-danger" onclick="deleteQuiz(${quiz.id})" style="margin-top: 10px;">Delete</button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function deleteQuiz(id) {
    quizzes = quizzes.filter(item => item.id !== id);
    renderQuizzes();
}

// Memory functions
function addMemory() {
    const title = document.getElementById('memoryTitle').value;
    const date = document.getElementById('memoryDate').value;
    const content = document.getElementById('memoryContent').value;
    const mood = document.getElementById('memoryMood').value;
    const imageInput = document.getElementById('memoryImage');

    if (!title || !date || !content) {
        alert('Please fill in title, date, and memory content');
        return;
    }

    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageDataUrl = e.target.result;
            saveMemory(title, date, content, mood, imageDataUrl);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        saveMemory(title, date, content, mood, '');
    }
}

function saveMemory(title, date, content, mood, imageDataUrl) {
    memories.push({
        id: Date.now(),
        title,
        date,
        content,
        mood,
        imageDataUrl
    });

    document.getElementById('memoryTitle').value = '';
    document.getElementById('memoryDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('memoryContent').value = '';
    document.getElementById('memoryImage').value = '';
    
    renderMemories();
}

function renderMemories() {
    const container = document.getElementById('memoriesList');
    let html = memories.sort((a, b) => new Date(b.date) - new Date(a.date)).map(memory => {
        const memoryDate = new Date(memory.date).toLocaleDateString();
        let imageSection = '';
        if (memory.imageDataUrl) {
            imageSection = `<img src="${memory.imageDataUrl}" alt="Memory image" class="memory-image">`;
        }
        
        return `
            <div class="card memory-card">
                <h3>${memory.mood} ${memory.title}</h3>
                <p><strong>Date:</strong> ${memoryDate}</p>
                <div style="margin-top: 10px; line-height: 1.5;">${memory.content}</div>
                ${imageSection}
                <button class="btn btn-danger" onclick="deleteMemory(${memory.id})" style="margin-top: 15px;">Delete</button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function deleteMemory(id) {
    memories = memories.filter(item => item.id !== id);
    renderMemories();
}

// Initialize with today's date for memory
document.getElementById('memoryDate').value = new Date().toISOString().split('T')[0];
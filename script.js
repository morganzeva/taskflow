const STORAGE_KEY = "taskflow.tasks";

const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const counter = document.querySelector("#counter");
const emptyState = document.querySelector("#emptyState");
const formMessage = document.querySelector("#formMessage");
const filterButtons = document.querySelectorAll(".filter");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(title) {
  const newTask = {
    id: Date.now(),
    title: title,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
}

function toggleTask(taskId) {
  tasks = tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function getVisibleTasks() {
  if (currentFilter === "todo") {
    return tasks.filter(task => !task.completed);
  }

  if (currentFilter === "done") {
    return tasks.filter(task => task.completed);
  }

  return tasks;
}

function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = getVisibleTasks();
  const remainingTasks = tasks.filter(task => !task.completed).length;

  counter.textContent = `${remainingTasks} tâche(s) restante(s)`;
  emptyState.hidden = visibleTasks.length !== 0;

  if (tasks.length === 0) {
    emptyState.textContent = "Aucune tâche pour le moment. Ajoute ta première tâche !";
  } else if (visibleTasks.length === 0) {
    emptyState.textContent = "Aucune tâche dans cette catégorie.";
  }

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = "task-item";
    if (task.completed) item.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Terminer : ${task.title}`);
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.title;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Supprimer";
    deleteButton.setAttribute("aria-label", `Supprimer : ${task.title}`);
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    item.append(checkbox, text, deleteButton);
    taskList.append(item);
  });
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = taskInput.value.trim();

  if (title.length === 0) {
    formMessage.textContent = "Écris le nom d'une tâche avant de l'ajouter.";
    return;
  }

  formMessage.textContent = "";
  addTask(title);
  taskInput.value = "";
  taskInput.focus();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(filterButton => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    renderTasks();
  });
});

renderTasks();

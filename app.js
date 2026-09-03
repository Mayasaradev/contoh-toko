// 1. Daftarin Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

// 2. Logic Todo Simpel + Simpan ke LocalStorage biar offline tetep ada datanya
const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  list.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.textContent = task;
    list.appendChild(li);
  });
}

function addTask() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  if (input.value.trim() !== "") {
    tasks.push(input.value);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    input.value = "";
    loadTasks();
  }
}

loadTasks();
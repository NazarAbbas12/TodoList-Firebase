import {serverTimestamp,getDocs,collection,db,addDoc,deleteDoc,doc,updateDoc} from "./config.js";

let editingId = null;
let todos = [];
let currentFilter = "all";

let todoListElm = document.querySelector(".todo-lists");
let titleInput = document.querySelector("#title");
let descInput = document.querySelector("#desc");
let addBtn = document.querySelector("#add");
let saveBtn = document.querySelector("#save");


// ADD TODO
let addToDo = async () => {
    try {
        let title = titleInput.value.trim();
        let description = descInput.value.trim();

        if (!title) {
            alert("Title is required");
            return;
        }

        if (!description) {
            alert("Description is required");
            return;
        }

        if (title.length < 4 || title.length > 20) {
            alert("Title must be between 4 and 20 characters");
            return;
        }

        if (description.length < 5 || description.length > 100) {
            alert("Description must be between 5 and 100 characters");
            return;
        }

        await addDoc(collection(db, "todos"), {
            title: title,
            description: description,
            completed: false,
            createdAt: serverTimestamp()
        });

        titleInput.value = "";
        descInput.value = "";

        await fetchTodos();
        renderTodos();

        alert("Todo added successfully!");

    } catch (error) {
        console.error("Error adding todo:", error);
    }
};

addBtn.addEventListener("click", addToDo);


// FETCH TODOS
let fetchTodos = async () => {
    try {
        todos = [];

        const todoData = await getDocs(collection(db, "todos"));

        todoData.forEach((todo) => {
            todos.push({
                ...todo.data(),
                id: todo.id
            });
        });

    } catch (error) {
        console.error("Error fetching todos:", error);
    }
};


// UPDATE STATISTICS
let updateStats = () => {

    let total = todos.length;

    let completed = todos.filter(
        (todo) => todo.completed
    ).length;

    document.querySelector("#total-count").textContent = total;

    document.querySelector("#completed-count").textContent = completed;
};


// RENDER TODOS
let renderTodos = () => {

    todoListElm.innerHTML = "";

    updateStats();

    let filteredTodos = todos.filter((todo) => {

        if (currentFilter === "active") {
            return !todo.completed;
        }

        if (currentFilter === "completed") {
            return todo.completed;
        }

        return true;
    });


    // EMPTY STATE
    if (filteredTodos.length === 0) {

        let emptyState = document.createElement("div");
        emptyState.classList.add("empty-state");

        let icon = document.createElement("i");
        icon.className = "fa-solid fa-clipboard-list";

        let message = document.createElement("p");

        message.textContent = todos.length === 0
            ? "No tasks yet. Create your first task!"
            : "No tasks found in this category.";

        emptyState.append(icon, message);

        todoListElm.appendChild(emptyState);

        return;
    }


    // CREATE TASK CARDS
    filteredTodos.forEach((todoObj) => {

        let todoBox = document.createElement("div");


        // TITLE
        let title = document.createElement("span");
        title.innerText = todoObj.title;


        // DESCRIPTION
        let description = document.createElement("span");
        description.innerText = todoObj.description;


        // CHECKBOX
        let completeCheckbox = document.createElement("input");

        completeCheckbox.type = "checkbox";
        completeCheckbox.checked = todoObj.completed;

        completeCheckbox.addEventListener("change", () => {
            updateComplete(todoObj.id, completeCheckbox.checked);
        });


        // DELETE BUTTON
        let delBtn = document.createElement("button");

        delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        delBtn.classList.add("delete-btn");

        delBtn.disabled = Boolean(editingId);

        delBtn.addEventListener("click", () => {
            deleteTodo(todoObj.id);
        });


        // UPDATE BUTTON
        let updateBtn = document.createElement("button");

        updateBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
        updateBtn.classList.add("update-btn");

        updateBtn.dataset.completed = todoObj.completed;

        // EDIT MODE RESTRICTIONS
        updateBtn.disabled = Boolean(editingId) || todoObj.completed;


        updateBtn.addEventListener("click", () => {
            updateTodo(todoObj.id);
        });


        // APPEND ELEMENTS
        todoBox.append(
            title,
            description,
            completeCheckbox,
            delBtn,
            updateBtn
        );

        todoListElm.appendChild(todoBox);

    });

};


// TASK COMPLETION
let updateComplete = async (id, checked) => {
    try {

        let findTodo = todos.find(
            (todo) => todo.id === id
        );

        if (!findTodo) return;

        await updateDoc(doc(db, "todos", id), {
            completed: checked
        });

        findTodo.completed = checked;

        renderTodos();

        console.log("Todo completion updated");

    } catch (error) {
        console.error(error);
    }
};


// DELETE TODO
let deleteTodo = async (uid) => {
    try {

        if (editingId) return;

        await deleteDoc(doc(db, "todos", uid));

        todos = todos.filter(
            (todo) => todo.id !== uid
        );

        renderTodos();

        alert("Todo task successfully deleted");

    } catch (error) {
        console.error(error);
    }
};


// UPDATE TODO
let updateTodo = (uid) => {

    let todoObj = todos.find(
        (todo) => todo.id === uid
    );

    if (!todoObj || todoObj.completed || editingId) return;

    titleInput.value = todoObj.title;
    descInput.value = todoObj.description;

    editingId = uid;

    addBtn.style.display = "none";
    saveBtn.style.display = "block";

    toggleEditMode(true);

    renderTodos();

    titleInput.focus();
};


// SAVE UPDATED TODO
let saveTodo = async () => {
    try {

        if (!editingId) return;

        let title = titleInput.value.trim();
        let description = descInput.value.trim();

        if (title.length < 4 || title.length > 20) {
            alert("Title must be between 4 and 20 characters");
            return;
        }

        if (description.length < 5 || description.length > 100) {
            alert("Description must be between 5 and 100 characters");
            return;
        }

        await updateDoc(doc(db, "todos", editingId), {
            title: title,
            description: description
        });

        editingId = null;

        titleInput.value = "";
        descInput.value = "";

        addBtn.style.display = "block";
        saveBtn.style.display = "none";

        toggleEditMode(false);

        await fetchTodos();

        renderTodos();

        alert("Todo updated successfully!");

    } catch (error) {
        console.error(error);
    }
};

saveBtn.addEventListener("click", saveTodo);


// TOGGLE EDIT MODE
let toggleEditMode = (isEditing) => {

    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.disabled = isEditing;
    });

    document.querySelectorAll(".update-btn").forEach((btn) => {
        btn.disabled = isEditing ||
            btn.dataset.completed === "true";
    });

    addBtn.disabled = isEditing;

    saveBtn.disabled = !isEditing;
};


// FILTER TASKS
document.querySelectorAll(".filter-btn").forEach((btn) => {

    btn.addEventListener("click", () => {

        currentFilter = btn.dataset.filter;

        document.querySelectorAll(".filter-btn").forEach((filterBtn) => {
            filterBtn.classList.remove("active");
        });

        btn.classList.add("active");

        renderTodos();
    });
});


fetchTodos().then(() => {
    renderTodos();
});

import { serverTimestamp,getDocs, collection, db, addDoc, deleteDoc, doc, updateDoc } from "./config.js";

let editingId = null;

let todos = [];
let todoListElm = document.querySelector(".todo-lists");


//adding to do list
let addToDo = async()=>{
    try {
        let title = document.querySelector("#title");
        let description = document.querySelector("#desc");

        if(!title.value.trim()){
            alert("Title is required");
            return;
        }
        if (!description.value.trim()) {
            alert("Description is required");
            return;
        }
        if(title.value.trim().length<4 || title.value.trim().length > 20){
            alert("Title must be between 4 and 20 characters");
            return;
        }
        if(description.value.trim().length < 5 || description.value.trim().length > 100){
            alert("Description must be between 5 and 100 characters");
            return;
        }

        const newDoc = await addDoc(collection(db,"todos"),{
            title: title.value.trim(),
            description: description.value.trim(),
            completed: false,
            createdAt: serverTimestamp()
        });
        title.value = "";
        desc.value = "";
        alert("Document written with ID: "+ newDoc.id);

        await fetchTodos();
        renderTodos();

    } catch (e) {
        console.error("Error adding document: "+ e);
    }
}

document.querySelector("#add").addEventListener("click",addToDo);

// fetching 
let fetchTodos = async () => { 
    try {
        todos = []
        const todoData = await getDocs(collection(db, "todos")); 

        todoData.forEach((todo) => {
            todos.push({
                ...todo.data(), id: todo.id
            });
        });
        console.log(todoData)
    } catch (e) {
        console.error(e)
    }
}
fetchTodos().then(() => {
    renderTodos();
})


let renderTodos = () => {
    todoListElm.innerHTML = '';

    todos.forEach((todoObj) => {
        let todoBox = document.createElement('div');

        let title = document.createElement('span');
        title.innerText = todoObj.title;

        let description = document.createElement('span');
        description.innerText = todoObj.description;

        let completeCheckbox = document.createElement('input');
        completeCheckbox.type = "checkbox";
        completeCheckbox.checked = todoObj.completed;

        completeCheckbox.addEventListener("change", () => {
            updateComplete(todoObj.id, completeCheckbox.checked);
        });
        if (todoObj.completed) {
            title.style.textDecoration = "line-through";
            title.style.color = "gray";

            description.style.textDecoration = "line-through";
            description.style.color = "gray";
        }

        let delBtn = document.createElement("button");
        delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        delBtn.classList.add("delete-btn");
        delBtn.addEventListener("click", () => deleteTodo(todoObj.id));

        let updateBtn = document.createElement("button");
        updateBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
        updateBtn.classList.add("update-btn");
        updateBtn.dataset.completed = todoObj.completed;
        updateBtn.disabled = todoObj.completed;
        updateBtn.addEventListener("click", () => updateTodo(todoObj.id));

        todoBox.appendChild(title);
        todoBox.appendChild(description);
        todoBox.appendChild(completeCheckbox);
        todoBox.appendChild(delBtn);
        todoBox.appendChild(updateBtn);

        todoListElm.appendChild(todoBox);
    });
};

// for task completion
let updateComplete = async (id, checked) => {
    try {
        let findTodo = todos.find((todo) => todo.id === id);

        if (!findTodo) return;

        await updateDoc(doc(db, "todos", id), {
            completed: checked
        });

        findTodo.completed = checked;

        renderTodos();

        console.log("Todo completion status updated");

    } catch (error) {
        console.error(error);
    }
};

/// delete 
let deleteTodo = async (uid) => {
    try {
        await deleteDoc(doc(db, "todos", uid));
        
        todos = todos.filter((todo) => todo.id != uid);
        renderTodos();

        alert("Todo task successfully deleted");
    } catch (e) {
        console.error(e)
    }
}

///update
let updateTodo = async (uid) => {
    let todoObj = todos.find((todo) => todo.id === uid);

    if (!todoObj) return;

    document.querySelector('#title').value = todoObj.title;
    document.querySelector('#desc').value = todoObj.description;

    editingId = uid;

    document.querySelector('#add').style.display = "none";
    document.querySelector('#save').style.display = "inline";

    toggleEditMode(true);
};

let saveTodo = async () => {
    try {
        let title = document.querySelector('#title').value.trim();
        let description = document.querySelector('#desc').value.trim();

        if (title.length < 4 || title.length > 20) {
            alert("Title must be between 4 and 20 characters");
            return;
        }

        if (description.length < 5 || description.length > 100) {
            alert("Description must be between 5 and 100 characters");
            return;
        }

        const docRef = doc(db, "todos", editingId);

        await updateDoc(docRef, {
            title: title,
            description: description
        });

        alert("Todo updated successfully!");

        editingId = null;

        document.querySelector('#title').value = "";
        document.querySelector('#desc').value = "";

        document.querySelector('#add').style.display = "inline";
        document.querySelector('#save').style.display = "none";

        await fetchTodos();
        renderTodos();
        toggleEditMode(false);

    } catch (error) {
        console.error(error);
    }
};
document.querySelector('#save').addEventListener('click', saveTodo);


let toggleEditMode = (isEditing) => {
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.disabled = isEditing;
    });

    document.querySelectorAll(".update-btn").forEach((btn) => {
        btn.disabled = isEditing || btn.dataset.completed === "true";
    });

    document.querySelector("#add").disabled = isEditing;
    document.querySelector("#save").disabled = false;
};
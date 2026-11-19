import { serverTimestamp,getDocs, collection, db, addDoc, deleteDoc, doc, updateDoc } from "./config.js";


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
        if(description.value.trim().length < 5 || description.value.trim().length > 50){
            alert("Description must be between 5 and 50 characters");
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
    } catch (e) {
        console.error("Error adding document: "+ e);
    }
}

document.querySelector("#add").addEventListener("click",addToDo);

// fetching user
let fetchUsers = async () => { 
    try {
        todos = []
        const todoData = await getDocs(collection(db, "todos")); 

        todoData.forEach((todo) => {
            todos.push({
                ...todo.data(), id: todo.id
            });
        });
        console.log(usersData)
    } catch (e) {
        console.error(e)
    }
}
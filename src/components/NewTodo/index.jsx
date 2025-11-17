import { useState } from "react";
import "./style.css";

function NewTodo({ onAdd }) {
    const [text, setText] = useState("");

    const handleSubmit = () => {
        if (text.trim() === "") {
            return;
        }
        
        onAdd(text);        
        setText("");
    };

    return (
        <div className="new-todo row">
            <input 
                type="text" 
                placeholder="New Task"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === "Enter") {
                        handleSubmit();
                    }
                }}
            />
            <button onClick={handleSubmit}>+</button>
        </div>
    );
}

export default NewTodo;
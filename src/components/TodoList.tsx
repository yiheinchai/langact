// src/components/TodoList.tsx
import React, { useState } from "react";

interface Task {
    id: number;
    title: string;
}

const TaskItem: React.FC<{ task: Task; onDelete: (id: number) => void }> = ({
    task,
    onDelete,
}) => {
    return (
        <div className="task-item">
            <div className="task-checkbox">
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                </svg>
            </div>
            <div className="task-content">
                <span className="task-title">{task.title}</span>
            </div>
            <button onClick={() => onDelete(task.id)} className="task-delete">
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </button>
        </div>
    );
};

export const TodoList = () => {
    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, title: "Buy groceries" },
        { id: 2, title: "Walk the dog" },
    ]);
    const [inputValue, setInputValue] = useState("");

    const handleAddTask = () => {
        console.log("Adding task:", inputValue);
        if (!inputValue.trim()) return;
        const newTask = { id: Date.now(), title: inputValue.trim() };
        setTasks((prev) => [...prev, newTask]);
        setInputValue("");
    };

    const handleDeleteTask = (id: number) => {
        setTasks((prev) => prev.filter((task) => task.id !== id));
    };

    return (
        <div className="todo-app">
            <div className="todo-header">
                <h2>Tasks</h2>
                <div className="todo-stats">
                    <span>{tasks.length} items</span>
                </div>
            </div>

            <div className="add-task-container">
                <div className="add-task-input">
                    <div className="input-icon">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <line
                                x1="12"
                                y1="8"
                                x2="12"
                                y2="16"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <line
                                x1="8"
                                y1="12"
                                x2="16"
                                y2="12"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Add a new task..."
                        onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                    />
                    <button onClick={handleAddTask} className="add-button">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M5 12h14M12 5v14"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="tasks-container">
                {tasks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <p>No tasks yet</p>
                        <span>Add a task to get started</span>
                    </div>
                ) : (
                    <div className="tasks-list">
                        {tasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onDelete={handleDeleteTask}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

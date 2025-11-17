import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Timer, formatTime } from "./timers";
import NewTodo from "./components/NewTodo";
import TodoItem from "./components/TodoItem";

const PHASES = {
    focus: { label: "Focus" },
    short_break: { label: "Short Break" },
    long_break: { label: "Long Break" }
};

const LONG_BREAK_INTERVAL = 4;

function App() {
    const [phase, setPhase] = useState("focus");
    const [isRunning, setIsRunning] = useState(false);
    const [displayTime, setDisplayTime] = useState({ minutes: 25, seconds: 0 });
    const [durations, setDurations] = useState({ focus: 25, short_break: 5, long_break: 15 });
    const [completedFocusSessions, setCompletedFocusSessions] = useState(0);
    const [todos, setTodos] = useState([]);

    const timerRef = useRef(null);
    const completionRef = useRef(() => {});

    useEffect(() => {
        timerRef.current = new Timer(
            durations.focus,
            0,
            (minutes, seconds) => setDisplayTime({ minutes, seconds }),
            () => completionRef.current()
        );

        return () => {
            timerRef.current?.pause();
        };
    }, []);

    const setTimerForPhase = (nextPhase, autoStart = false) => {
        if (!timerRef.current) {
            return;
        }

        const minutes = durations[nextPhase];
        timerRef.current.reset(minutes, 0);
        setDisplayTime({ minutes, seconds: 0 });
        setPhase(nextPhase);

        if (autoStart) {
            timerRef.current.start();
            setIsRunning(true);
        }
        else {
            setIsRunning(false);
        }
    };

    completionRef.current = () => {
        setIsRunning(false);

        if (phase === "focus") {
            setCompletedFocusSessions((prev) => {
                const nextCount = prev + 1;
                const hitLongBreak = nextCount % LONG_BREAK_INTERVAL === 0;
                const nextPhase = hitLongBreak ? "long_break" : "short_break";
                setTimerForPhase(nextPhase, true);
                return nextCount;
            });
        }
        else {
            setTimerForPhase("focus", true);
        }
    };

    const handleDurationChange = (key, value) => {
        const numericValue = Number(value);
        const sanitized = Math.min(Math.max(numericValue || 0, 1), 60);

        setDurations((prev) => {
            const updated = { ...prev, [key]: sanitized };

            if (!isRunning && key === phase && timerRef.current) {
                timerRef.current.reset(sanitized, 0);
                setDisplayTime({ minutes: sanitized, seconds: 0 });
            }

            return updated;
        });
    };

    const handleStartPause = () => {
        if (!timerRef.current) {
            return;
        }

        if (isRunning) {
            timerRef.current.pause();
            setIsRunning(false);
        }
        else {
            timerRef.current.start();
            setIsRunning(true);
        }
    };

    const handleReset = () => {
        if (!timerRef.current) {
            return;
        }

        timerRef.current.reset(durations[phase], 0);
        setDisplayTime({ minutes: durations[phase], seconds: 0 });
        setIsRunning(false);
    };

    const completedInCycle = completedFocusSessions % LONG_BREAK_INTERVAL;
    const sessionsUntilLongBreak = completedInCycle === 0 ? LONG_BREAK_INTERVAL : LONG_BREAK_INTERVAL - completedInCycle;

    const addTodo = (text) => {
        setTodos((prev) => {
            const nextId = prev.length > 0 ? Math.max(...prev.map((todo) => todo.id)) + 1 : 0;
            return [...prev, { id: nextId, text, completed: false }];
        });
    };

    const deleteTodo = (id) => {
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
    };

    const toggleTodo = (id) => {
        setTodos((prev) =>
            prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
        );
    };

    return (
        <div className="app">
            <div className="workspace-grid">
                <section className="timer-panel">
                    <p className="tagline">Focus with the Pomodoro Technique</p>
                    <h1>Pomodoro Timer</h1>

                    <div className="phase-toggle">
                        {Object.entries(PHASES).map(([key, meta]) => (
                            <button
                                key={key}
                                className={phase === key ? "active" : ""}
                                onClick={() => setTimerForPhase(key)}
                            >
                                {meta.label}
                            </button>
                        ))}
                    </div>

                    <div className="timer-display">
                        <span className="time">{formatTime(displayTime.minutes, displayTime.seconds)}</span>
                        <span className="phase-label">{PHASES[phase].label}</span>
                    </div>

                    <div className="controls">
                        <button className="primary" onClick={handleStartPause}>
                            {isRunning ? "Pause" : "Start"}
                        </button>
                        <button onClick={handleReset}>Reset</button>
                    </div>

                    <section className="details">
                        <div>
                            <h2>Session lengths (minutes)</h2>
                            <div className="duration-inputs">
                                {Object.entries(PHASES).map(([key, meta]) => (
                                    <label key={`duration-${key}`}>
                                        <span>{meta.label}</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="60"
                                            value={durations[key]}
                                            onChange={(e) => handleDurationChange(key, e.target.value)}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="stats">
                            <h2>Cycle progress</h2>
                            <p>
                                Focus sessions completed: <strong>{completedFocusSessions}</strong>
                            </p>
                            <p>
                                Long break in <strong>{sessionsUntilLongBreak}</strong> focus session(s)
                            </p>
                            <div className="progress-dots">
                                {Array.from({ length: LONG_BREAK_INTERVAL }).map((_, index) => (
                                    <span
                                        key={index}
                                        className={index < (completedFocusSessions % LONG_BREAK_INTERVAL) ? "dot filled" : "dot"}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                </section>

                <section className="todo-panel">
                    <h2>Task queue</h2>
                    <p className="hint">Plan what you want to achieve until your next break.</p>
                    <NewTodo onAdd={addTodo} />
                    <div className="todo-list">
                        {todos.length === 0 ? (
                            <p className="empty">Nothing here yet. Add a task for your next session.</p>
                        ) : (
                            todos.map((todo) => (
                                <TodoItem
                                    key={todo.id}
                                    todo={todo}
                                    onDelete={deleteTodo}
                                    onToggle={toggleTodo}
                                />
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default App;

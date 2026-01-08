import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3001/api'; // backend API base URL for all HTTP requests

function App() {
  const [token, setToken] = useState(localStorage.getItem('token')); // JWT token for authentication, persisted in browser storage
  const [email, setEmail] = useState(''); // controlled input state for email field
  const [password, setPassword] = useState(''); // controlled input state for password field
  const [isRegister, setIsRegister] = useState(false); // toggles between login and registration forms
  const [tasks, setTasks] = useState([]); // stores array of user's tasks fetched from backend
  const [newTask, setNewTask] = useState({ title: '', description: '' }); // form state for creating new tasks
  const [error, setError] = useState(''); // stores and displays authentication error messages

  useEffect(() => {
    // runs when token changes, fetches tasks if user is authenticated
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const handleAuth = async (e) => {
    // handles both login and registration form submissions
    e.preventDefault(); // prevents default form submission and page reload
    setError(''); // clears any previous error messages

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'; // determines API endpoint based on form mode
      const response = await fetch(`${API_URL}${endpoint}`, {
        // sends authentication request to backend
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // parses JSON response from server

      if (!response.ok) {
        // checks for HTTP error status
        setError(data.error || 'Authentication failed'); // displays error message from backend
        return;
      }

      if (isRegister) {
        // registration successful
        setError('Registration successful! Please login.'); // shows success message
        setIsRegister(false); // switches back to login form
      } else {
        // login successful
        localStorage.setItem('token', data.token); // persists JWT token in browser
        setToken(data.token); // updates state to trigger task fetching
      }
    } catch (err) {
      setError('Network error'); // handles connection failures
    }
  };

  const fetchTasks = async () => {
    // retrieves all tasks for authenticated user
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        // sends GET request with authentication
        headers: { Authorization: `Bearer ${token}` }, // includes JWT in Authorization header
      });
      const data = await response.json(); // parses task array from response
      setTasks(data.tasks || []); // updates state with fetched tasks
    } catch (err) {
      console.error('Failed to fetch tasks'); // logs error without disrupting UI
    }
  };

  const createTask = async (e) => {
    // creates new task via API
    e.preventDefault(); // prevents form submission page reload

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        // sends POST request to create task
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // authenticates request with JWT
        },
        body: JSON.stringify(newTask), // sends task data as JSON
      });

      if (response.ok) {
        // task created successfully
        setNewTask({ title: '', description: '' }); // clears form inputs
        fetchTasks(); // refreshes task list to include new task
      }
    } catch (err) {
      console.error('Failed to create task'); // logs error
    }
  };

  const deleteTask = async (taskId) => {
    // deletes task by ID
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        // sends DELETE request with task ID
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }, // authenticates deletion request
      });

      if (response.ok) {
        // deletion successful
        fetchTasks(); // refreshes task list to remove deleted task
      }
    } catch (err) {
      console.error('Failed to delete task'); // logs error
    }
  };

  const updateTaskStatus = async (taskId, currentStatus) => {
    // cycles task through status progression
    const statuses = ['pending', 'in_progress', 'completed']; // available task statuses
    const currentIndex = statuses.indexOf(currentStatus); // finds current status position
    const newStatus = statuses[(currentIndex + 1) % statuses.length]; // calculates next status (wraps to beginning)

    try {
      const task = tasks.find((t) => t.id === taskId); // retrieves full task object
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        // sends PUT request with updated status
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // authenticates update request
        },
        body: JSON.stringify({
          // preserves existing fields while updating status
          title: task.title,
          description: task.description,
          status: newStatus,
        }),
      });

      if (response.ok) {
        // update successful
        fetchTasks(); // refreshes task list to show new status
      }
    } catch (err) {
      console.error('Failed to update task'); // logs error
    }
  };

  const logout = () => {
    // handles user logout
    localStorage.removeItem('token'); // removes JWT from browser storage
    setToken(null); // clears token state to trigger login form display
    setTasks([]); // clears task list
  };

  if (!token) {
    return (
      <div className='App'>
        <div className='auth-container'>
          <h1>{isRegister ? 'Register' : 'Login'}</h1>
          {error && <div className='error'>{error}</div>}{' '}
          <form onSubmit={handleAuth}>
            {' '}
            <input
              type='email'
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)} // updates email state on input change
              required
            />
            <input
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)} // updates password state on input change
              required
            />
            <button type='submit'>{isRegister ? 'Register' : 'Login'}</button>{' '}
          </form>
          <p>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsRegister(!isRegister)}>
              {' '}
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='App'>
      <div className='header'>
        <h1>Task Manager</h1>
        <button onClick={logout}>Logout</button>
      </div>

      <div className='container'>
        <div className='task-form'>
          {' '}
          <h2>Create New Task</h2>
          <form onSubmit={createTask}>
            <input
              type='text'
              placeholder='Task Title'
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
            <textarea
              placeholder='Description'
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <button type='submit'>Add Task</button>
          </form>
        </div>

        <div className='tasks-list'>
          {' '}
          <h2>My Tasks ({tasks.length})</h2>
          {tasks.map((task) => (
            <div key={task.id} className={`task-item ${task.status}`}>
              {' '}
              <div className='task-content'>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <span className='status'>{task.status}</span>
              </div>
              <div className='task-actions'>
                <button onClick={() => updateTaskStatus(task.id, task.status)}>
                  {' '}
                  Change Status
                </button>
                <button onClick={() => deleteTask(task.id)} className='delete'>
                  {' '}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

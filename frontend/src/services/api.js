import axios from 'axios';

const API_URL = 'http://192.168.0.17:8080/api/v1/tasks';

export const getTasks = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error.response?.data || error.message);
    return [];
  }
};

export const addTask = async (task) => {
  try {
    const response = await axios.post(API_URL, task);
    return response.data;
  } catch (error) {
    console.error('Error adding task:', error.response?.data || error.message);
    return null;
  }
};

export const deleteTask = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error('Error deleting task:', error.response?.data || error.message);
  }
};

export const updateTask = async (id, updatedTask) => {
    try {
      console.log(`Actualizando tarea ID: ${id}`, updatedTask);
      
      const response = await axios.put(`${API_URL}/${id}`, updatedTask);
      
      console.log('Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error.response?.data || error.message);
    }
  };

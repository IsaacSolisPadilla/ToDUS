import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { getTasks, addTask, deleteTask, updateTask } from '../services/api';

const TaskScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const data = await getTasks();
    setTasks(data);
  };

  const handleAddTask = async () => {
    if (title.trim() && description.trim()) {
      const newTask = { title, description, completed: false };
      const savedTask = await addTask(newTask);
      if (savedTask) {
        setTasks([...tasks, savedTask]);
        setTitle('');
        setDescription('');
      }
    }
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    fetchTasks();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
  };

  const handleUpdateTask = async () => {
    if (editingTask) {
      const updatedTask = { ...editingTask, title, description, completed: false };
      await updateTask(updatedTask.id, updatedTask);
      setEditingTask(null);
      setTitle('');
      setDescription('');
      fetchTasks();
    }
  };

  const renderRightActions = (id) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(id)}>
      <Text style={styles.deleteText}>Eliminar</Text>
    </TouchableOpacity>
  );

  const renderLeftActions = (task) => (
    <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(task)}>
      <Text style={styles.editText}>Editar</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Tareas</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Swipeable
            renderLeftActions={() => renderLeftActions(item)}
            renderRightActions={() => renderRightActions(item.id)}
          >
            <View style={styles.taskItem}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text>{item.description}</Text>
            </View>
          </Swipeable>
        )}
      />

      <TextInput
        style={styles.input}
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
      />

      {editingTask ? (
        <Button title="Actualizar Tarea" onPress={handleUpdateTask} />
      ) : (
        <Button title="Agregar Tarea" onPress={handleAddTask} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  taskItem: { padding: 10, marginVertical: 5, backgroundColor: '#fff', borderRadius: 5 },
  taskTitle: { fontWeight: 'bold' },
  input: { borderWidth: 1, padding: 10, marginVertical: 5, borderRadius: 5 },
  deleteButton: { backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', width: 80, height: '100%' },
  deleteText: { color: 'white', fontWeight: 'bold' },
  editButton: { backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center', width: 80, height: '100%' },
  editText: { color: 'white', fontWeight: 'bold' },
});

export default TaskScreen;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTaskStore, TaskItem as TaskType } from '../store/useTaskStore';

interface TaskItemProps {
  task: TaskType;
}

const priorityColors: Record<string, string> = {
  Alta: '#f44336',
  Média: '#ff9800',
  Baixa: '#4caf50',
};

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const router = useRouter();
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const setEditingTask = useTaskStore((state) => state.setEditingTask);

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <View style={styles.task}>
      <TouchableOpacity
        style={styles.contentContainer}
        onPress={() => router.push(`/task/${task._id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.titleRow}>
          <Text style={[styles.text, !!task.completed && styles.textCompleted]}>
            {task.text}
          </Text>
          {task.priority && (
            <View style={[styles.priorityBadge, { backgroundColor: priorityColors[task.priority] }]}>
              <Text style={styles.priorityBadgeText}>{task.priority}</Text>
            </View>
          )}
        </View>
        {task.dueDate && (
          <Text style={[styles.dateText, isOverdue ? styles.dateOverdue : styles.dateOnTime]}>
            Até: {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.icons}>
        <TouchableOpacity onPress={() => setEditingTask(task)} accessibilityRole="button">
          <Feather name="edit" size={20} color="#fff" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteTask(task._id)} accessibilityRole="button">
          <AntDesign name="delete" size={20} color="#fff" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  task: {
    backgroundColor: '#000', paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 8, marginTop: 12, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentContainer: { flex: 1, marginRight: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  text: { color: '#fff', fontSize: 16, flexShrink: 1 },
  textCompleted: { textDecorationLine: 'line-through', color: '#aaa' },
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  priorityBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  dateText: { fontSize: 12, marginTop: 4, fontWeight: 'bold' },
  dateOverdue: { color: '#e53935' },
  dateOnTime: { color: '#43a047' },
  icons: { flexDirection: 'row', gap: 16 },
  icon: { padding: 2 },
});

export default TaskItem;

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTaskStore } from '../../src/store/useTaskStore';

const priorityColors: Record<string, string> = {
  Alta: '#f44336',
  Média: '#ff9800',
  Baixa: '#4caf50',
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const task = useTaskStore((state) => state.tasks.find((t) => t._id === id));
  const setEditingTask = useTaskStore((state) => state.setEditingTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  if (!task) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Tarefa não encontrada.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const handleEdit = () => {
    setEditingTask(task);
    router.back();
  };

  const handleDelete = async () => {
    await deleteTask(task._id);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View style={[styles.badge, { backgroundColor: task.completed ? '#4caf50' : '#ff9800' }]}>
            <Text style={styles.badgeText}>{task.completed ? 'Concluída' : 'Pendente'}</Text>
          </View>
          {task.priority && (
            <View style={[styles.badge, { backgroundColor: priorityColors[task.priority] }]}>
              <Text style={styles.badgeText}>Prioridade: {task.priority}</Text>
            </View>
          )}
        </View>

        <Text style={styles.taskTitle}>{task.text}</Text>

        {task.dueDate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data limite</Text>
            <Text style={[styles.infoValue, isOverdue && !task.completed ? styles.overdue : styles.onTime]}>
              {new Date(task.dueDate).toLocaleDateString('pt-BR', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
              {isOverdue && !task.completed ? '  (Atrasada)' : ''}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ID</Text>
          <Text style={styles.infoValueMono}>{task._id}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.buttonText}>Editar Tarefa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.buttonText}>Excluir Tarefa</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { padding: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 20,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4, marginBottom: 20,
  },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  taskTitle: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 20 },
  infoRow: { marginBottom: 16 },
  infoLabel: { fontSize: 12, fontWeight: 'bold', color: '#999', textTransform: 'uppercase', marginBottom: 4 },
  infoValue: { fontSize: 16, color: '#333' },
  infoValueMono: {
    fontSize: 13, color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  overdue: { color: '#e53935' },
  onTime: { color: '#43a047' },
  actions: { gap: 12 },
  editButton: {
    backgroundColor: '#000', paddingVertical: 14, borderRadius: 8,
    alignItems: 'center', elevation: 2,
  },
  deleteButton: {
    backgroundColor: '#ff4d4d', paddingVertical: 14, borderRadius: 8,
    alignItems: 'center', elevation: 2,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  notFoundText: { fontSize: 18, color: '#666', marginBottom: 16 },
  backButton: { backgroundColor: '#000', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  backButtonText: { color: '#fff', fontWeight: 'bold' },
});

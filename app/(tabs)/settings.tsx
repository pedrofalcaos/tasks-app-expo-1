import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { globalStyles } from '../../src/styles/global';
import { useTaskStore } from '../../src/store/useTaskStore';

export default function SettingsScreen() {
  const tasks = useTaskStore((state) => state.tasks);
  const deleteAllTasks = useTaskStore((state) => state.deleteAllTasks);

  const handleClearData = () => {
    Alert.alert(
      'Limpar dados',
      `Isso removerá ${tasks.length} tarefa(s) do armazenamento local. Deseja continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: deleteAllTasks },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={require('../../assets/task-app-banner.png')} style={styles.logo} />

      <Text style={styles.title}>Sobre o App</Text>

      <View style={styles.section}>
        <Text style={styles.paragraph}>
          Bem-vindo ao Gerenciador de Tarefas! Este aplicativo foi desenvolvido com o intuito de facilitar a organização do seu dia a dia, permitindo o acompanhamento de suas atividades de forma simples, rápida e eficiente.
        </Text>
        <Text style={styles.paragraph}>
          Com uma interface moderna e intuitiva, você pode adicionar novas tarefas, marcar as que já foram concluídas e definir prioridades. O objetivo principal é proporcionar uma experiência fluida para aumentar a sua produtividade.
        </Text>
      </View>

      <Text style={styles.subtitle}>Tecnologias Utilizadas</Text>
      <View style={styles.techList}>
        {['React Native', 'Expo', 'TypeScript', 'Zustand', 'Expo Router'].map((tech) => (
          <Text key={tech} style={styles.techItem}>• {tech}</Text>
        ))}
      </View>

      <Text style={styles.subtitle}>Dados</Text>
      <View style={styles.statsCard}>
        <Text style={styles.statText}>Tarefas armazenadas localmente: <Text style={styles.statValue}>{tasks.length}</Text></Text>
      </View>

      <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
        <Text style={styles.dangerButtonText}>Limpar dados locais</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 32, alignItems: 'center' },
  logo: { width: 120, height: 120, marginBottom: 24, borderRadius: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 24, textAlign: 'center' },
  subtitle: {
    fontSize: 20, fontWeight: 'bold', color: globalStyles.primaryColor,
    marginTop: 16, marginBottom: 12, alignSelf: 'flex-start',
  },
  section: { marginBottom: 24, width: '100%' },
  paragraph: { fontSize: 16, color: '#555', lineHeight: 24, marginBottom: 12, textAlign: 'justify' },
  techList: {
    width: '100%', backgroundColor: '#f5f5f5', padding: 20, borderRadius: 12,
    borderLeftWidth: 4, borderLeftColor: globalStyles.primaryColor, marginBottom: 24,
  },
  techItem: { fontSize: 16, color: '#333', fontWeight: '600', marginBottom: 8 },
  statsCard: {
    width: '100%', backgroundColor: '#f5f5f5', padding: 16,
    borderRadius: 8, marginBottom: 24,
  },
  statText: { fontSize: 16, color: '#555' },
  statValue: { fontWeight: 'bold', color: '#000' },
  dangerButton: {
    backgroundColor: '#ff4d4d', paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: 8, alignItems: 'center', width: '100%', marginBottom: 32,
  },
  dangerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProjectManagerScreen = () => {
  const projects = [
    { name: 'GTBank ATM Software Upgrade', client: 'GTBank', progress: 75, status: 'on-track', team: 8, deadline: 'Dec 15', tasks: { total: 24, completed: 18 } },
    { name: 'Access Bank New Installation', client: 'Access Bank', progress: 45, status: 'delayed', team: 6, deadline: 'Dec 20', tasks: { total: 32, completed: 14 } },
    { name: 'Zenith Bank Maintenance Rollout', client: 'Zenith Bank', progress: 90, status: 'on-track', team: 5, deadline: 'Dec 5', tasks: { total: 20, completed: 18 } },
    { name: 'UBA Software Integration', client: 'UBA', progress: 30, status: 'at-risk', team: 10, deadline: 'Jan 10', tasks: { total: 40, completed: 12 } },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return '#34C759';
      case 'delayed': return '#FF9500';
      case 'at-risk': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track': return 'check-circle';
      case 'delayed': return 'clock-alert';
      case 'at-risk': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Project Manager</Text>
          <Text style={styles.headerSubtitle}>ATM installations & implementations</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="clipboard-list" size={28} color="#007AFF" />
            <Text style={styles.statValue}>9</Text>
            <Text style={styles.statLabel}>Active Projects</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="check-circle" size={28} color="#34C759" />
            <Text style={styles.statValue}>6</Text>
            <Text style={styles.statLabel}>On Track</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="alert-circle" size={28} color="#FF3B30" />
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>At Risk</Text>
          </View>
        </View>

        {/* Projects List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Active Projects</Text>
          {projects.map((project, index) => (
            <TouchableOpacity key={index} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <View style={styles.projectMainInfo}>
                  <Icon name="folder-open" size={24} color="#00C7BE" />
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <Text style={styles.projectClient}>{project.client}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '20' }]}>
                  <Icon name={getStatusIcon(project.status)} size={14} color={getStatusColor(project.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
                    {project.status.replace('-', ' ')}
                  </Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress: {project.progress}%</Text>
                  <Text style={styles.tasksCompleted}>
                    {project.tasks.completed}/{project.tasks.total} tasks
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { 
                    width: `${project.progress}%`,
                    backgroundColor: getStatusColor(project.status)
                  }]} />
                </View>
              </View>

              <View style={styles.projectMeta}>
                <View style={styles.metaItem}>
                  <Icon name="account-group" size={16} color="#8E8E93" />
                  <Text style={styles.metaText}>{project.team} members</Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="calendar" size={16} color="#8E8E93" />
                  <Text style={styles.metaText}>Due: {project.deadline}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Upcoming Milestones</Text>
          <View style={styles.milestoneCard}>
            <View style={styles.milestoneItem}>
              <Icon name="flag-checkered" size={20} color="#34C759" />
              <View style={styles.milestoneInfo}>
                <Text style={styles.milestoneTitle}>Zenith Bank Final Testing</Text>
                <Text style={styles.milestoneDate}>Dec 3, 2025</Text>
              </View>
            </View>
            <View style={styles.milestoneItem}>
              <Icon name="flag" size={20} color="#FF9500" />
              <View style={styles.milestoneInfo}>
                <Text style={styles.milestoneTitle}>GTBank Phase 2 Deployment</Text>
                <Text style={styles.milestoneDate}>Dec 12, 2025</Text>
              </View>
            </View>
            <View style={styles.milestoneItem}>
              <Icon name="flag" size={20} color="#007AFF" />
              <View style={styles.milestoneInfo}>
                <Text style={styles.milestoneTitle}>Access Bank Site Survey</Text>
                <Text style={styles.milestoneDate}>Dec 18, 2025</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="plus-circle" size={24} color="#00C7BE" />
              <Text style={styles.quickActionText}>New Project</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="file-document" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Project Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="calendar-clock" size={24} color="#FF9500" />
              <Text style={styles.quickActionText}>Timeline View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="chart-gantt" size={24} color="#5856D6" />
              <Text style={styles.quickActionText}>Gantt Chart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollView: { flex: 1 },
  header: { padding: 20, paddingTop: 10 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 5 },
  headerSubtitle: { fontSize: 14, color: '#8E8E93' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginTop: 8 },
  statLabel: { fontSize: 11, color: '#8E8E93', marginTop: 4, textAlign: 'center' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
  projectCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, marginBottom: 12 },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  projectMainInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  projectInfo: { marginLeft: 12, flex: 1 },
  projectName: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  projectClient: { fontSize: 12, color: '#8E8E93' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  progressSection: { marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  tasksCompleted: { fontSize: 12, color: '#8E8E93' },
  progressBar: { height: 8, backgroundColor: '#2C2C2E', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  projectMeta: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#8E8E93' },
  milestoneCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16 },
  milestoneItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  milestoneInfo: { marginLeft: 12, flex: 1 },
  milestoneTitle: { fontSize: 14, color: '#FFFFFF', fontWeight: '600', marginBottom: 2 },
  milestoneDate: { fontSize: 12, color: '#8E8E93' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickActionButton: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, alignItems: 'center', width: '47%' },
  quickActionText: { fontSize: 12, color: '#FFFFFF', marginTop: 8, textAlign: 'center' },
});

export default ProjectManagerScreen;

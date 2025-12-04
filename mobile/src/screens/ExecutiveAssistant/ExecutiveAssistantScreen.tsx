import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  dueDate: string;
  completed: boolean;
}

interface Meeting {
  id: string;
  title: string;
  time: string;
  location: string;
  attendees: number;
  type: 'virtual' | 'physical';
}

const ExecutiveAssistantScreen = () => {
  const [selectedTab, setSelectedTab] = useState<'today' | 'week' | 'tasks'>('today');

  const todaySchedule: Meeting[] = [
    { id: '1', title: 'Board Meeting - Q4 Review', time: '09:00 AM', location: 'Conference Room A', attendees: 8, type: 'physical' },
    { id: '2', title: 'Client Call - GTBank ATM Project', time: '11:30 AM', location: 'Zoom', attendees: 4, type: 'virtual' },
    { id: '3', title: 'Engineering Team Standup', time: '02:00 PM', location: 'Teams', attendees: 15, type: 'virtual' },
    { id: '4', title: 'Review Financial Reports', time: '04:00 PM', location: 'Office', attendees: 2, type: 'physical' },
  ];

  const tasks: Task[] = [
    { id: '1', title: 'Approve spare parts procurement (₦4.2M)', priority: 'high', category: 'Finance', dueDate: 'Today', completed: false },
    { id: '2', title: 'Review engineer performance reports', priority: 'high', category: 'HR', dueDate: 'Today', completed: false },
    { id: '3', title: 'Sign Access Bank contract renewal', priority: 'high', category: 'Sales', dueDate: 'Today', completed: false },
    { id: '4', title: 'Prepare investor presentation', priority: 'medium', category: 'Strategy', dueDate: 'Tomorrow', completed: false },
    { id: '5', title: 'Review new ATM software features', priority: 'medium', category: 'Product', dueDate: 'This Week', completed: false },
    { id: '6', title: 'Schedule Q1 planning session', priority: 'low', category: 'Planning', dueDate: 'Next Week', completed: true },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Executive Assistant</Text>
          <Text style={styles.headerSubtitle}>Your day at a glance</Text>
        </View>

        {/* Date Card */}
        <View style={styles.dateCard}>
          <Icon name="calendar-today" size={32} color="#4A90E2" />
          <View style={styles.dateInfo}>
            <Text style={styles.dateDay}>Friday, November 29</Text>
            <Text style={styles.dateStats}>4 meetings • 5 pending tasks</Text>
          </View>
          <TouchableOpacity style={styles.calendarButton}>
            <Icon name="calendar-month" size={20} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'today' && styles.tabActive]}
            onPress={() => setSelectedTab('today')}
          >
            <Text style={[styles.tabText, selectedTab === 'today' && styles.tabTextActive]}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'week' && styles.tabActive]}
            onPress={() => setSelectedTab('week')}
          >
            <Text style={[styles.tabText, selectedTab === 'week' && styles.tabTextActive]}>
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'tasks' && styles.tabActive]}
            onPress={() => setSelectedTab('tasks')}
          >
            <Text style={[styles.tabText, selectedTab === 'tasks' && styles.tabTextActive]}>
              All Tasks
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Schedule */}
        {(selectedTab === 'today' || selectedTab === 'week') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Today's Schedule</Text>
            {todaySchedule.map((meeting) => (
              <TouchableOpacity key={meeting.id} style={styles.meetingCard}>
                <View style={styles.meetingTime}>
                  <Icon name="clock-outline" size={20} color="#4A90E2" />
                  <Text style={styles.timeText}>{meeting.time}</Text>
                </View>
                <View style={styles.meetingDetails}>
                  <Text style={styles.meetingTitle}>{meeting.title}</Text>
                  <View style={styles.meetingMeta}>
                    <View style={styles.metaItem}>
                      <Icon
                        name={meeting.type === 'virtual' ? 'video-outline' : 'map-marker'}
                        size={14}
                        color="#8E8E93"
                      />
                      <Text style={styles.metaText}>{meeting.location}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Icon name="account-group" size={14} color="#8E8E93" />
                      <Text style={styles.metaText}>{meeting.attendees} attendees</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.joinButton}>
                  <Icon name="arrow-right" size={20} color="#4A90E2" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Priority Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Priority Tasks</Text>
          {tasks.map((task) => (
            <TouchableOpacity key={task.id} style={styles.taskCard}>
              <TouchableOpacity
                style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
              >
                {task.completed && <Icon name="check" size={16} color="#FFFFFF" />}
              </TouchableOpacity>
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, task.completed && styles.taskCompleted]}>
                  {task.title}
                </Text>
                <View style={styles.taskMeta}>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                      {task.priority}
                    </Text>
                  </View>
                  <Text style={styles.categoryText}>{task.category}</Text>
                  <Text style={styles.dueDateText}>📅 {task.dueDate}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="calendar-plus" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Schedule Meeting</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="file-document-plus" size={24} color="#34C759" />
              <Text style={styles.quickActionText}>Add Task</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="email-fast" size={24} color="#FF9500" />
              <Text style={styles.quickActionText}>Important Emails</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="bell-ring" size={24} color="#FF3B30" />
              <Text style={styles.quickActionText}>Set Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Upcoming Reminders</Text>
          <View style={styles.reminderCard}>
            <Icon name="alarm" size={20} color="#FF9500" />
            <Text style={styles.reminderText}>Board meeting prep - 1 hour before</Text>
          </View>
          <View style={styles.reminderCard}>
            <Icon name="alarm" size={20} color="#007AFF" />
            <Text style={styles.reminderText}>Follow up GTBank contract - 3:00 PM</Text>
          </View>
        </View>
      </ScrollView>

      {/* AI Assistant FAB */}
      <TouchableOpacity style={styles.fab}>
        <Icon name="robot" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  dateCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateStats: {
    fontSize: 13,
    color: '#8E8E93',
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#4A90E2',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  meetingCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetingTime: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A90E2',
    marginTop: 4,
  },
  meetingDetails: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  meetingMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  joinButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A90E2',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  categoryText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  dueDateText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
  },
  quickActionText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  reminderCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default ExecutiveAssistantScreen;

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HRScreen = () => {
  const team = [
    { name: 'Chidi Okonkwo', role: 'Senior Engineer', department: 'Operations', status: 'active', avatar: 'account' },
    { name: 'Amina Yusuf', role: 'Software Engineer', department: 'Tech', status: 'active', avatar: 'account' },
    { name: 'Oluwaseun Adeyemi', role: 'Field Engineer', department: 'Operations', status: 'active', avatar: 'account' },
    { name: 'Ngozi Eze', role: 'Sales Manager', department: 'Sales', status: 'active', avatar: 'account' },
    { name: 'Ibrahim Musa', role: 'Junior Engineer', department: 'Operations', status: 'on-leave', avatar: 'account' },
  ];

  const leaveRequests = [
    { employee: 'Blessing Nwosu', type: 'Annual Leave', dates: 'Dec 10-17', status: 'pending' },
    { employee: 'Yusuf Abdullahi', type: 'Sick Leave', dates: 'Nov 28-29', status: 'approved' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>HR Management</Text>
          <Text style={styles.headerSubtitle}>Team & workforce management</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="account-group" size={28} color="#34C759" />
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Total Employees</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="account-clock" size={28} color="#FF9500" />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>On Leave</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="calendar-check" size={28} color="#007AFF" />
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Pending Requests</Text>
          </View>
        </View>

        {/* Team Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Team Members</Text>
          {team.map((member, index) => (
            <TouchableOpacity key={index} style={styles.teamCard}>
              <View style={styles.avatar}>
                <Icon name={member.avatar} size={24} color="#4A90E2" />
              </View>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{member.name}</Text>
                <Text style={styles.teamRole}>{member.role} • {member.department}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: member.status === 'active' ? '#34C75920' : '#FF950020' }]}>
                <Text style={[styles.statusText, { color: member.status === 'active' ? '#34C759' : '#FF9500' }]}>
                  {member.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Leave Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Leave Requests</Text>
          {leaveRequests.map((request, index) => (
            <View key={index} style={styles.leaveCard}>
              <View style={styles.leaveInfo}>
                <Text style={styles.leaveName}>{request.employee}</Text>
                <Text style={styles.leaveType}>{request.type} • {request.dates}</Text>
              </View>
              {request.status === 'pending' && (
                <View style={styles.leaveActions}>
                  <TouchableOpacity style={styles.approveButton}>
                    <Icon name="check" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectButton}>
                    <Icon name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
              {request.status === 'approved' && (
                <View style={[styles.statusBadge, { backgroundColor: '#34C75920' }]}>
                  <Text style={[styles.statusText, { color: '#34C759' }]}>Approved</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="account-plus" size={24} color="#34C759" />
              <Text style={styles.quickActionText}>Add Employee</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="cash-multiple" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Process Payroll</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="chart-bar" size={24} color="#5856D6" />
              <Text style={styles.quickActionText}>Performance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="calendar-month" size={24} color="#FF9500" />
              <Text style={styles.quickActionText}>Attendance</Text>
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
  teamCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2C2C2E', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  teamRole: { fontSize: 13, color: '#8E8E93' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  leaveCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leaveInfo: { flex: 1 },
  leaveName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  leaveType: { fontSize: 13, color: '#8E8E93' },
  leaveActions: { flexDirection: 'row', gap: 8 },
  approveButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#34C759', justifyContent: 'center', alignItems: 'center' },
  rejectButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF3B30', justifyContent: 'center', alignItems: 'center' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickActionButton: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, alignItems: 'center', width: '47%' },
  quickActionText: { fontSize: 12, color: '#FFFFFF', marginTop: 8, textAlign: 'center' },
});

export default HRScreen;

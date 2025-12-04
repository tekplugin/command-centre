import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Engineer {
  id: string;
  name: string;
  status: 'active' | 'on-job' | 'off-duty' | 'unavailable';
  location: string;
  specialization: string;
  assignedAtms: number;
  rating: number;
  completedToday: number;
  phone: string;
  zone: string;
}

const TeamScreen = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock engineer data
  const engineers: Engineer[] = [
    { id: 'ENG-001', name: 'Chidi Okonkwo', status: 'active', location: 'Victoria Island, Lagos', specialization: 'Hardware', assignedAtms: 15, rating: 4.8, completedToday: 3, phone: '+234 803 123 4567', zone: 'Lagos' },
    { id: 'ENG-002', name: 'Amina Yusuf', status: 'on-job', location: 'En route to Garki', specialization: 'Software', assignedAtms: 18, rating: 4.9, completedToday: 2, phone: '+234 805 234 5678', zone: 'Abuja' },
    { id: 'ENG-003', name: 'Oluwaseun Adeyemi', status: 'active', location: 'Ikeja, Lagos', specialization: 'Full Stack', assignedAtms: 22, rating: 4.7, completedToday: 4, phone: '+234 807 345 6789', zone: 'Lagos' },
    { id: 'ENG-004', name: 'Ibrahim Musa', status: 'on-job', location: 'At ATM-012', specialization: 'Hardware', assignedAtms: 12, rating: 4.6, completedToday: 1, phone: '+234 809 456 7890', zone: 'Kaduna' },
    { id: 'ENG-005', name: 'Ngozi Eze', status: 'off-duty', location: 'Off-site', specialization: 'Software', assignedAtms: 20, rating: 4.9, completedToday: 0, phone: '+234 810 567 8901', zone: 'Lagos' },
    { id: 'ENG-006', name: 'Yusuf Abdullahi', status: 'active', location: 'Wuse, Abuja', specialization: 'Network', assignedAtms: 16, rating: 4.5, completedToday: 2, phone: '+234 811 678 9012', zone: 'Abuja' },
    { id: 'ENG-007', name: 'Blessing Nwosu', status: 'unavailable', location: 'Sick Leave', specialization: 'Hardware', assignedAtms: 14, rating: 4.8, completedToday: 0, phone: '+234 812 789 0123', zone: 'Port Harcourt' },
    { id: 'ENG-008', name: 'Mohammed Ali', status: 'on-job', location: 'At ATM-045', specialization: 'Full Stack', assignedAtms: 19, rating: 4.7, completedToday: 3, phone: '+234 813 890 1234', zone: 'Kano' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#34C759';
      case 'on-job': return '#007AFF';
      case 'off-duty': return '#8E8E93';
      case 'unavailable': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'check-circle';
      case 'on-job': return 'account-wrench';
      case 'off-duty': return 'clock-outline';
      case 'unavailable': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const getSpecializationIcon = (spec: string) => {
    switch (spec) {
      case 'Hardware': return 'hammer-wrench';
      case 'Software': return 'code-tags';
      case 'Network': return 'network';
      case 'Full Stack': return 'account-cog';
      default: return 'account';
    }
  };

  const filteredEngineers = engineers.filter(eng => {
    if (filterStatus === 'all') return true;
    return eng.status === filterStatus;
  });

  const statusCounts = {
    all: engineers.length,
    active: engineers.filter(e => e.status === 'active').length,
    'on-job': engineers.filter(e => e.status === 'on-job').length,
    'off-duty': engineers.filter(e => e.status === 'off-duty').length,
    unavailable: engineers.filter(e => e.status === 'unavailable').length,
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Engineer Management</Text>
          <Text style={styles.headerSubtitle}>Track field engineers and assignments</Text>
        </View>

        {/* Quick Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="account-check" size={24} color="#34C759" />
            <Text style={styles.statValue}>{statusCounts.active}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="account-wrench" size={24} color="#007AFF" />
            <Text style={styles.statValue}>{statusCounts['on-job']}</Text>
            <Text style={styles.statLabel}>On Job</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="account-clock" size={24} color="#8E8E93" />
            <Text style={styles.statValue}>{statusCounts['off-duty']}</Text>
            <Text style={styles.statLabel}>Off Duty</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="account-alert" size={24} color="#FF3B30" />
            <Text style={styles.statValue}>{statusCounts.unavailable}</Text>
            <Text style={styles.statLabel}>Unavailable</Text>
          </View>
        </ScrollView>

        {/* Status Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[styles.filterText, filterStatus === status && styles.filterTextActive]}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')} ({count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Engineers List */}
        <View style={styles.engineerList}>
          {filteredEngineers.map((engineer) => (
            <TouchableOpacity key={engineer.id} style={styles.engineerCard}>
              <View style={styles.engineerHeader}>
                <View style={styles.engineerMainInfo}>
                  <View style={styles.avatarContainer}>
                    <Icon name="account" size={32} color="#4A90E2" />
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(engineer.status) }]} />
                  </View>
                  <View style={styles.engineerInfo}>
                    <Text style={styles.engineerName}>{engineer.name}</Text>
                    <Text style={styles.engineerId}>{engineer.id}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(engineer.status) + '20' }]}>
                  <Icon name={getStatusIcon(engineer.status)} size={14} color={getStatusColor(engineer.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(engineer.status) }]}>
                    {engineer.status.replace('-', ' ')}
                  </Text>
                </View>
              </View>

              <View style={styles.engineerDetails}>
                <View style={styles.detailRow}>
                  <Icon name="map-marker" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>{engineer.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name={getSpecializationIcon(engineer.specialization)} size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>{engineer.specialization}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="map-marker-radius" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>Zone: {engineer.zone}</Text>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metric}>
                  <Icon name="cash-multiple" size={16} color="#4A90E2" />
                  <View style={styles.metricContent}>
                    <Text style={styles.metricValue}>{engineer.assignedAtms}</Text>
                    <Text style={styles.metricLabel}>Assigned ATMs</Text>
                  </View>
                </View>
                <View style={styles.metric}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <View style={styles.metricContent}>
                    <Text style={styles.metricValue}>{engineer.rating}</Text>
                    <Text style={styles.metricLabel}>Rating</Text>
                  </View>
                </View>
                <View style={styles.metric}>
                  <Icon name="check-circle" size={16} color="#34C759" />
                  <View style={styles.metricContent}>
                    <Text style={styles.metricValue}>{engineer.completedToday}</Text>
                    <Text style={styles.metricLabel}>Done Today</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="phone" size={16} color="#34C759" />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="map-marker-path" size={16} color="#007AFF" />
                  <Text style={styles.actionButtonText}>Track</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="clipboard-text" size={16} color="#FF9500" />
                  <Text style={styles.actionButtonText}>Assign</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Quick Dispatch Button */}
      <TouchableOpacity style={styles.fab}>
        <Icon name="plus" size={24} color="#FFFFFF" />
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
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterChip: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#4A90E2',
  },
  filterText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  engineerList: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  engineerCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
  },
  engineerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  engineerMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#1C1C1E',
  },
  engineerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  engineerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  engineerId: {
    fontSize: 13,
    color: '#8E8E93',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  engineerDetails: {
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#8E8E93',
    fontSize: 13,
    marginLeft: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricContent: {
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 10,
    color: '#8E8E93',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#4A90E2',
    fontSize: 13,
    fontWeight: '600',
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

export default TeamScreen;

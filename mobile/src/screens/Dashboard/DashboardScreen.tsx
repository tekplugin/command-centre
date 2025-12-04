import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DashboardScreen = () => {
  // Executive modules data
  const executiveModules = [
    { icon: 'briefcase', title: 'Executive Assistant', color: '#007AFF', count: 8, label: 'Tasks Today' },
    { icon: 'account-tie', title: 'Personal Assistant', color: '#5856D6', count: 3, label: 'Appointments' },
    { icon: 'chart-bar', title: 'Finance Dashboard', color: '#34C759', count: '₦24M', label: 'Monthly Revenue' },
    { icon: 'account-group', title: 'HR Management', color: '#FF9500', count: 42, label: 'Team Members' },
    { icon: 'chart-line', title: 'Sales Pipeline', color: '#FF2D55', count: 15, label: 'Active Deals' },
    { icon: 'bullhorn', title: 'Marketing', color: '#AF52DE', count: 4, label: 'Campaigns' },
    { icon: 'clipboard-text', title: 'Project Manager', color: '#00C7BE', count: 9, label: 'Active Projects' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Executive Command Center</Text>
        <Text style={styles.subtitle}>ATM Software, Support & Business Management</Text>
        
        {/* Executive Modules Grid */}
        <Text style={styles.sectionTitle}>Executive Modules</Text>
        <View style={styles.modulesGrid}>
          {executiveModules.map((module, index) => (
            <TouchableOpacity key={index} style={[styles.moduleCard, { borderLeftColor: module.color }]}>
              <Icon name={module.icon} size={28} color={module.color} />
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <Text style={styles.moduleCount}>{module.count}</Text>
              <Text style={styles.moduleLabel}>{module.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ATM Maintenance Overview */}
        <Text style={styles.sectionTitle}>ATM Maintenance & Support</Text>
        
        {/* Today's Tickets from Banks */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📧 Fault Tickets (from Bank Emails)</Text>
          <View style={styles.ticketItem}>
            <View style={styles.ticketHeader}>
              <Icon name="alert-circle" size={20} color="#FF3B30" />
              <Text style={styles.ticketId}>Ticket #2024-1145</Text>
              <Text style={styles.ticketPriority}>🔴 Critical</Text>
            </View>
            <Text style={styles.ticketBank}>Bank: GTBank</Text>
            <Text style={styles.ticketLocation}>Location: Victoria Island Mall, Lagos</Text>
            <Text style={styles.ticketTerminal}>Terminal ID: GTB-VI-0234</Text>
            <Text style={styles.ticketFault}>Fault: Card reader not responding</Text>
            <Text style={styles.ticketAssigned}>Assigned to: Eng. Chidi Okonkwo</Text>
            <Text style={styles.ticketStatus}>Status: En route (ETA 25 mins)</Text>
          </View>
          
          <View style={styles.ticketItem}>
            <View style={styles.ticketHeader}>
              <Icon name="alert" size={20} color="#FF9500" />
              <Text style={styles.ticketId}>Ticket #2024-1146</Text>
              <Text style={styles.ticketPriority}>🟡 Medium</Text>
            </View>
            <Text style={styles.ticketBank}>Bank: Access Bank</Text>
            <Text style={styles.ticketLocation}>Location: Lekki Phase 1, Lagos</Text>
            <Text style={styles.ticketTerminal}>Terminal ID: ACC-LEK-0089</Text>
            <Text style={styles.ticketFault}>Fault: Dispenser jam</Text>
            <Text style={styles.ticketAssigned}>Assigned to: Eng. Oluwaseun Adeyemi</Text>
            <Text style={styles.ticketStatus}>Status: On-site, diagnosing</Text>
          </View>

          <View style={styles.ticketItem}>
            <View style={styles.ticketHeader}>
              <Icon name="information" size={20} color="#007AFF" />
              <Text style={styles.ticketId}>Ticket #2024-1147</Text>
              <Text style={styles.ticketPriority}>🟢 Low</Text>
            </View>
            <Text style={styles.ticketBank}>Bank: Zenith Bank</Text>
            <Text style={styles.ticketLocation}>Location: Garki, Abuja</Text>
            <Text style={styles.ticketTerminal}>Terminal ID: ZEN-ABJ-0156</Text>
            <Text style={styles.ticketFault}>Fault: Receipt paper out</Text>
            <Text style={styles.ticketAssigned}>Unassigned</Text>
            <Text style={styles.ticketStatus}>Status: Awaiting engineer dispatch</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.metricsRow}>
          <View style={[styles.card, styles.metricCard]}>
            <Icon name="ticket" size={24} color="#FF3B30" />
            <Text style={styles.metricValue}>12</Text>
            <Text style={styles.metricLabel}>Open Tickets</Text>
            <Text style={styles.metricChangeCritical}>3 critical</Text>
          </View>
          <View style={[styles.card, styles.metricCard]}>
            <Icon name="check-circle" size={24} color="#34C759" />
            <Text style={styles.metricValue}>45</Text>
            <Text style={styles.metricLabel}>Completed Today</Text>
            <Text style={styles.metricChange}>18 engineers active</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={[styles.card, styles.metricCard]}>
            <Icon name="clock-fast" size={24} color="#FF9500" />
            <Text style={styles.metricValue}>2.4h</Text>
            <Text style={styles.metricLabel}>Avg Response Time</Text>
            <Text style={styles.metricChange}>-15 mins vs last week</Text>
          </View>
          <View style={[styles.card, styles.metricCard]}>
            <Icon name="bank" size={24} color="#4A90E2" />
            <Text style={styles.metricValue}>8</Text>
            <Text style={styles.metricLabel}>Bank Clients</Text>
            <Text style={styles.metricLabel}>247 terminals managed</Text>
          </View>
        </View>

        {/* ATM Software Performance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🖥️ Software Performance</Text>
          <View style={styles.softwareMetric}>
            <Text style={styles.cardText}>Monitoring Software v4.2</Text>
            <Text style={styles.cardValue}>Running on 247 ATMs</Text>
          </View>
          <View style={styles.softwareMetric}>
            <Text style={styles.cardText}>Pending Updates</Text>
            <Text style={styles.cardValue}>12 ATMs require v4.3</Text>
          </View>
          <View style={styles.softwareMetric}>
            <Text style={styles.cardText}>License Renewals</Text>
            <Text style={styles.cardValue}>5 expiring this month</Text>
          </View>
        </View>

        {/* Spare Parts Inventory */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Spare Parts Inventory</Text>
          <View style={styles.inventoryItem}>
            <Text style={styles.cardText}>Card Readers</Text>
            <Text style={styles.stockLow}>Low: 8 units</Text>
          </View>
          <View style={styles.inventoryItem}>
            <Text style={styles.cardText}>Cash Dispensers</Text>
            <Text style={styles.stockGood}>Good: 15 units</Text>
          </View>
          <View style={styles.inventoryItem}>
            <Text style={styles.cardText}>Receipt Printers</Text>
            <Text style={styles.stockCritical}>Critical: 3 units</Text>
          </View>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>View Full Inventory →</Text>
          </TouchableOpacity>
        </View>

        {/* Engineer Dispatch Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👷 Engineer Dispatch</Text>
          <View style={styles.engineerItem}>
            <Text style={styles.engineerName}>Eng. John Doe - Lagos Zone</Text>
            <Text style={styles.engineerStatus}>🟢 En route to ATM #A-2341</Text>
          </View>
          <View style={styles.engineerItem}>
            <Text style={styles.engineerName}>Eng. Sarah Ahmed - Abuja Zone</Text>
            <Text style={styles.engineerStatus}>🔧 Onsite at ATM #A-1892</Text>
          </View>
          <View style={styles.engineerItem}>
            <Text style={styles.engineerName}>Eng. Michael Obi - Port Harcourt</Text>
            <Text style={styles.engineerStatus}>✅ Completed 2 jobs today</Text>
          </View>
        </View>

        {/* Procurement Pipeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Procurement Pipeline</Text>
          <View style={styles.procurementItem}>
            <Text style={styles.cardText}>PO #2341 - Card readers (50 units)</Text>
            <Text style={styles.statusPending}>Awaiting supplier quote</Text>
          </View>
          <View style={styles.procurementItem}>
            <Text style={styles.cardText}>PO #2340 - Cash cassettes (30 units)</Text>
            <Text style={styles.statusApproved}>Approved - In transit</Text>
          </View>
          <View style={styles.procurementItem}>
            <Text style={styles.cardText}>Total pending value</Text>
            <Text style={styles.cardValue}>₦4.2M across 8 orders</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  metricCard: {
    flex: 1,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  metricChange: {
    fontSize: 11,
    color: '#34C759',
  },
  metricChangeCritical: {
    fontSize: 11,
    color: '#FF453A',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  cardValue: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  softwareMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stockGood: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  stockLow: {
    fontSize: 14,
    color: '#FF9F0A',
    fontWeight: '600',
  },
  stockCritical: {
    fontSize: 14,
    color: '#FF453A',
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  engineerItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  engineerName: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  engineerStatus: {
    fontSize: 13,
    color: '#8E8E93',
  },
  procurementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusPending: {
    fontSize: 13,
    color: '#FF9F0A',
  },
  statusApproved: {
    fontSize: 13,
    color: '#34C759',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 8,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  moduleCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderLeftWidth: 3,
    borderColor: '#2C2C2E',
  },
  moduleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  moduleCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  moduleLabel: {
    fontSize: 11,
    color: '#8E8E93',
  },
  ticketItem: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  ticketId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  ticketPriority: {
    fontSize: 12,
    fontWeight: '600',
  },
  ticketBank: {
    fontSize: 13,
    color: '#4A90E2',
    marginBottom: 4,
    fontWeight: '600',
  },
  ticketLocation: {
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  ticketTerminal: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  ticketFault: {
    fontSize: 13,
    color: '#FF9500',
    marginBottom: 6,
    fontWeight: '500',
  },
  ticketAssigned: {
    fontSize: 12,
    color: '#34C759',
    marginBottom: 2,
  },
  ticketStatus: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

export default DashboardScreen;

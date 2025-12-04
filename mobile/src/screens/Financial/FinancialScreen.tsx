import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Ticket {
  id: string;
  ticketNumber: string;
  bank: string;
  location: string;
  terminalId: string;
  fault: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'unassigned' | 'assigned' | 'en-route' | 'on-site' | 'completed' | 'closed';
  assignedTo?: string;
  reportedDate: string;
  completedDate?: string;
  estimatedTime?: string;
}

const FinancialScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock ticket data from bank emails
  const tickets: Ticket[] = [
    { id: '1', ticketNumber: 'TKT-2024-1145', bank: 'GTBank', location: 'Victoria Island Mall, Lagos', terminalId: 'GTB-VI-0234', fault: 'Card reader not responding', priority: 'critical', status: 'en-route', assignedTo: 'Eng. Chidi Okonkwo', reportedDate: '2 hours ago', estimatedTime: '25 mins' },
    { id: '2', ticketNumber: 'TKT-2024-1146', bank: 'Access Bank', location: 'Lekki Phase 1, Lagos', terminalId: 'ACC-LEK-0089', fault: 'Dispenser jam', priority: 'high', status: 'on-site', assignedTo: 'Eng. Oluwaseun Adeyemi', reportedDate: '3 hours ago' },
    { id: '3', ticketNumber: 'TKT-2024-1147', bank: 'Zenith Bank', location: 'Garki, Abuja', terminalId: 'ZEN-ABJ-0156', fault: 'Receipt paper out', priority: 'low', status: 'unassigned', reportedDate: '1 hour ago' },
    { id: '4', ticketNumber: 'TKT-2024-1148', bank: 'First Bank', location: 'Port Harcourt Plaza', terminalId: 'FBN-PH-0312', fault: 'Cash cassette door open alarm', priority: 'critical', status: 'assigned', assignedTo: 'Eng. Blessing Nwosu', reportedDate: '45 mins ago' },
    { id: '5', ticketNumber: 'TKT-2024-1143', bank: 'UBA', location: 'Ikeja Shopping Complex, Lagos', terminalId: 'UBA-IKJ-0145', fault: 'Network connectivity issue', priority: 'medium', status: 'completed', assignedTo: 'Eng. Ngozi Eze', reportedDate: '5 hours ago', completedDate: '30 mins ago' },
    { id: '6', ticketNumber: 'TKT-2024-1144', bank: 'Stanbic IBTC', location: 'Wuse 2, Abuja', terminalId: 'SIB-ABJ-0089', fault: 'Software update required', priority: 'medium', status: 'on-site', assignedTo: 'Eng. Yusuf Abdullahi', reportedDate: '4 hours ago' },
    { id: '7', ticketNumber: 'TKT-2024-1142', bank: 'GTBank', location: 'Kaduna Mall', terminalId: 'GTB-KD-0067', fault: 'Display screen flickering', priority: 'low', status: 'closed', assignedTo: 'Eng. Ibrahim Musa', reportedDate: 'Yesterday', completedDate: '2 hours ago' },
    { id: '8', ticketNumber: 'TKT-2024-1149', bank: 'Ecobank', location: 'Lekki-Epe Expressway, Lagos', terminalId: 'ECO-LEK-0234', fault: 'PIN pad malfunction', priority: 'high', status: 'unassigned', reportedDate: '30 mins ago' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#FFCC00';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unassigned': return '#8E8E93';
      case 'assigned': return '#5856D6';
      case 'en-route': return '#007AFF';
      case 'on-site': return '#FF9500';
      case 'completed': return '#34C759';
      case 'closed': return '#636366';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unassigned': return 'clipboard-alert';
      case 'assigned': return 'account-check';
      case 'en-route': return 'car';
      case 'on-site': return 'wrench';
      case 'completed': return 'check-circle';
      case 'closed': return 'archive';
      default: return 'help-circle';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.bank.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.terminalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.fault.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: tickets.length,
    unassigned: tickets.filter(t => t.status === 'unassigned').length,
    assigned: tickets.filter(t => t.status === 'assigned').length,
    'en-route': tickets.filter(t => t.status === 'en-route').length,
    'on-site': tickets.filter(t => t.status === 'on-site').length,
    completed: tickets.filter(t => t.status === 'completed').length,
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Fault Tickets</Text>
          <Text style={styles.headerSubtitle}>From bank email notifications</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tickets, banks, terminals..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

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

        {/* Tickets List */}
        <View style={styles.ticketsList}>
          {filteredTickets.map((ticket) => (
            <TouchableOpacity key={ticket.id} style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <View style={styles.ticketTitleRow}>
                  <Icon name={getStatusIcon(ticket.status)} size={22} color={getStatusColor(ticket.status)} />
                  <View style={styles.ticketTitleInfo}>
                    <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
                    <Text style={styles.ticketBank}>{ticket.bank}</Text>
                  </View>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(ticket.priority) + '20' }]}>
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(ticket.priority) }]} />
                  <Text style={[styles.priorityText, { color: getPriorityColor(ticket.priority) }]}>
                    {ticket.priority}
                  </Text>
                </View>
              </View>

              <View style={styles.ticketDetails}>
                <View style={styles.detailRow}>
                  <Icon name="map-marker" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>{ticket.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="card-account-details" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>Terminal: {ticket.terminalId}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="alert-circle-outline" size={16} color="#FF9500" />
                  <Text style={styles.faultText}>{ticket.fault}</Text>
                </View>
              </View>

              <View style={styles.ticketStatus}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                  <Icon name={getStatusIcon(ticket.status)} size={14} color={getStatusColor(ticket.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                    {ticket.status.replace('-', ' ')}
                  </Text>
                </View>
                {ticket.assignedTo && (
                  <Text style={styles.assignedText}>👤 {ticket.assignedTo}</Text>
                )}
              </View>

              <View style={styles.ticketMeta}>
                <Text style={styles.metaText}>Reported: {ticket.reportedDate}</Text>
                {ticket.estimatedTime && (
                  <Text style={styles.etaText}>ETA: {ticket.estimatedTime}</Text>
                )}
                {ticket.completedDate && (
                  <Text style={styles.completedText}>✓ Completed: {ticket.completedDate}</Text>
                )}
              </View>

              {ticket.status === 'unassigned' && (
                <TouchableOpacity style={styles.assignButton}>
                  <Icon name="account-plus" size={16} color="#FFFFFF" />
                  <Text style={styles.assignButtonText}>Assign Engineer</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Add New Ticket FAB */}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 12,
    fontSize: 16,
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
  ticketsList: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  ticketCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ticketTitleInfo: {
    marginLeft: 12,
  },
  ticketNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  ticketBank: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  ticketDetails: {
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
  faultText: {
    color: '#FF9500',
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '500',
  },
  ticketStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  assignedText: {
    fontSize: 12,
    color: '#34C759',
  },
  ticketMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaText: {
    fontSize: 11,
    color: '#8E8E93',
  },
  etaText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
  },
  completedText: {
    fontSize: 11,
    color: '#34C759',
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
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

export default FinancialScreen;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#34C759';
      case 'offline': return '#FF3B30';
      case 'maintenance': return '#FF9500';
      case 'low-cash': return '#FFCC00';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return 'check-circle';
      case 'offline': return 'close-circle';
      case 'maintenance': return 'wrench';
      case 'low-cash': return 'alert';
      default: return 'help-circle';
    }
  };

  const filteredAtms = atms.filter(atm => {
    const matchesSearch = atm.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         atm.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         atm.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || atm.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: atms.length,
    online: atms.filter(a => a.status === 'online').length,
    offline: atms.filter(a => a.status === 'offline').length,
    maintenance: atms.filter(a => a.status === 'maintenance').length,
    'low-cash': atms.filter(a => a.status === 'low-cash').length,
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ATM Fleet Management</Text>
          <Text style={styles.headerSubtitle}>Real-time monitoring of all ATM units</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, ID, or city..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

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

        {/* ATM List */}
        <View style={styles.atmList}>
          {filteredAtms.map((atm) => (
            <TouchableOpacity key={atm.id} style={styles.atmCard}>
              <View style={styles.atmHeader}>
                <View style={styles.atmIdContainer}>
                  <Icon name="cash-multiple" size={24} color="#4A90E2" />
                  <View style={styles.atmInfo}>
                    <Text style={styles.atmId}>{atm.id}</Text>
                    <Text style={styles.atmLocation}>{atm.location}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(atm.status) + '20' }]}>
                  <Icon name={getStatusIcon(atm.status)} size={16} color={getStatusColor(atm.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(atm.status) }]}>
                    {atm.status.replace('-', ' ')}
                  </Text>
                </View>
              </View>

              <View style={styles.atmDetails}>
                <View style={styles.detailRow}>
                  <Icon name="map-marker" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>{atm.city}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="desktop-tower" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>{atm.model}</Text>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Uptime</Text>
                  <Text style={styles.metricValue}>{atm.uptime}%</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Cash Level</Text>
                  <View style={styles.cashLevelContainer}>
                    <View style={styles.cashLevelBar}>
                      <View style={[styles.cashLevelFill, { 
                        width: `${atm.cashLevel}%`,
                        backgroundColor: atm.cashLevel < 20 ? '#FF3B30' : atm.cashLevel < 50 ? '#FF9500' : '#34C759'
                      }]} />
                    </View>
                    <Text style={styles.metricValue}>{atm.cashLevel}%</Text>
                  </View>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Last Service</Text>
                  <Text style={styles.metricValue}>{atm.lastService}</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="chart-line" size={16} color="#4A90E2" />
                  <Text style={styles.actionButtonText}>Analytics</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="wrench" size={16} color="#4A90E2" />
                  <Text style={styles.actionButtonText}>Service</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="cash-refund" size={16} color="#4A90E2" />
                  <Text style={styles.actionButtonText}>Refill</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 12,
    fontSize: 16,
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
  atmList: {
    padding: 20,
    paddingTop: 0,
  },
  atmCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
  },
  atmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  atmIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  atmInfo: {
    marginLeft: 12,
    flex: 1,
  },
  atmId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  atmLocation: {
    fontSize: 14,
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
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  atmDetails: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#8E8E93',
    fontSize: 13,
    marginLeft: 6,
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
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cashLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cashLevelBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#2C2C2E',
    borderRadius: 3,
    overflow: 'hidden',
  },
  cashLevelFill: {
    height: '100%',
    borderRadius: 3,
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
});

export default FinancialScreen;

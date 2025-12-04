import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'reimbursed';
}

interface Travel {
  id: string;
  destination: string;
  dates: string;
  purpose: string;
  status: 'upcoming' | 'completed';
  flightBooked: boolean;
  hotelBooked: boolean;
}

const PersonalAssistantScreen = () => {
  const [selectedTab, setSelectedTab] = useState<'travel' | 'expenses'>('travel');

  const travels: Travel[] = [
    { id: '1', destination: 'Abuja', dates: 'Dec 5-7, 2025', purpose: 'Client Meeting - CBN', status: 'upcoming', flightBooked: true, hotelBooked: true },
    { id: '2', destination: 'Port Harcourt', dates: 'Dec 12-13, 2025', purpose: 'Engineer Training Workshop', status: 'upcoming', flightBooked: false, hotelBooked: false },
    { id: '3', destination: 'Lagos', dates: 'Nov 15-16, 2025', purpose: 'ATM Installation - Access Bank', status: 'completed', flightBooked: true, hotelBooked: true },
  ];

  const expenses: Expense[] = [
    { id: '1', description: 'Flight to Abuja (Round trip)', amount: 125000, category: 'Travel', date: 'Nov 28', status: 'pending' },
    { id: '2', description: 'Hotel Transcorp Hilton (2 nights)', amount: 180000, category: 'Accommodation', date: 'Nov 28', status: 'pending' },
    { id: '3', description: 'Client Dinner - GTBank Team', amount: 85000, category: 'Meals', date: 'Nov 27', status: 'approved' },
    { id: '4', description: 'Office Supplies', amount: 45000, category: 'Office', date: 'Nov 25', status: 'reimbursed' },
    { id: '5', description: 'Uber to Airport', amount: 12000, category: 'Transport', date: 'Nov 24', status: 'approved' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#007AFF';
      case 'completed': return '#34C759';
      case 'pending': return '#FF9500';
      case 'approved': return '#34C759';
      case 'reimbursed': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const totalPendingExpenses = expenses
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Personal Assistant</Text>
          <Text style={styles.headerSubtitle}>Travel & expense management</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Icon name="airplane" size={28} color="#007AFF" />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryValue}>2</Text>
              <Text style={styles.summaryLabel}>Upcoming Trips</Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Icon name="currency-ngn" size={28} color="#FF9500" />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryValue}>₦{(totalPendingExpenses / 1000).toFixed(0)}K</Text>
              <Text style={styles.summaryLabel}>Pending Expenses</Text>
            </View>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'travel' && styles.tabActive]}
            onPress={() => setSelectedTab('travel')}
          >
            <Icon name="airplane" size={20} color={selectedTab === 'travel' ? '#FFFFFF' : '#8E8E93'} />
            <Text style={[styles.tabText, selectedTab === 'travel' && styles.tabTextActive]}>
              Travel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'expenses' && styles.tabActive]}
            onPress={() => setSelectedTab('expenses')}
          >
            <Icon name="receipt" size={20} color={selectedTab === 'expenses' ? '#FFFFFF' : '#8E8E93'} />
            <Text style={[styles.tabText, selectedTab === 'expenses' && styles.tabTextActive]}>
              Expenses
            </Text>
          </TouchableOpacity>
        </View>

        {/* Travel Section */}
        {selectedTab === 'travel' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✈️ Travel Bookings</Text>
            {travels.map((travel) => (
              <TouchableOpacity key={travel.id} style={styles.travelCard}>
                <View style={styles.travelHeader}>
                  <View style={styles.travelMainInfo}>
                    <Icon name="map-marker" size={24} color="#007AFF" />
                    <View style={styles.travelInfo}>
                      <Text style={styles.travelDestination}>{travel.destination}</Text>
                      <Text style={styles.travelDates}>{travel.dates}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(travel.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(travel.status) }]}>
                      {travel.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.travelPurpose}>{travel.purpose}</Text>

                <View style={styles.bookingStatus}>
                  <View style={styles.bookingItem}>
                    <Icon
                      name={travel.flightBooked ? 'check-circle' : 'circle-outline'}
                      size={18}
                      color={travel.flightBooked ? '#34C759' : '#8E8E93'}
                    />
                    <Text style={styles.bookingText}>Flight</Text>
                  </View>
                  <View style={styles.bookingItem}>
                    <Icon
                      name={travel.hotelBooked ? 'check-circle' : 'circle-outline'}
                      size={18}
                      color={travel.hotelBooked ? '#34C759' : '#8E8E93'}
                    />
                    <Text style={styles.bookingText}>Hotel</Text>
                  </View>
                </View>

                {travel.status === 'upcoming' && !travel.flightBooked && (
                  <TouchableOpacity style={styles.bookButton}>
                    <Icon name="calendar-plus" size={16} color="#FFFFFF" />
                    <Text style={styles.bookButtonText}>Complete Booking</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.addButton}>
              <Icon name="plus" size={20} color="#4A90E2" />
              <Text style={styles.addButtonText}>Plan New Trip</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Expenses Section */}
        {selectedTab === 'expenses' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💳 Expense Reports</Text>
            {expenses.map((expense) => (
              <TouchableOpacity key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseHeader}>
                  <Icon name="receipt" size={20} color="#4A90E2" />
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseDescription}>{expense.description}</Text>
                    <Text style={styles.expenseCategory}>{expense.category} • {expense.date}</Text>
                  </View>
                </View>

                <View style={styles.expenseFooter}>
                  <Text style={styles.expenseAmount}>₦{expense.amount.toLocaleString()}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(expense.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(expense.status) }]}>
                      {expense.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.addButton}>
              <Icon name="plus" size={20} color="#4A90E2" />
              <Text style={styles.addButtonText}>Add New Expense</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="airplane-plus" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Book Flight</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="bed" size={24} color="#5856D6" />
              <Text style={styles.quickActionText}>Book Hotel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="car" size={24} color="#34C759" />
              <Text style={styles.quickActionText}>Arrange Transport</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="receipt-text" size={24} color="#FF9500" />
              <Text style={styles.quickActionText}>Submit Expense</Text>
            </TouchableOpacity>
          </View>
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
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryContent: {
    marginLeft: 12,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    gap: 8,
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
  travelCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  travelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  travelMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  travelInfo: {
    marginLeft: 12,
  },
  travelDestination: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  travelDates: {
    fontSize: 13,
    color: '#8E8E93',
  },
  travelPurpose: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  bookingStatus: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookingText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  expenseCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  expenseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  expenseDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 12,
    color: '#8E8E93',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
    borderWidth: 2,
    borderColor: '#2C2C2E',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
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
});

export default PersonalAssistantScreen;

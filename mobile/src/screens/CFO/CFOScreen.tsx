import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CFOScreen = () => {
  const financialMetrics = [
    { label: 'Monthly Revenue', value: '₦24.5M', change: '+12%', icon: 'cash-multiple', color: '#34C759' },
    { label: 'Operating Costs', value: '₦18.2M', change: '+5%', icon: 'cash-minus', color: '#FF9500' },
    { label: 'Net Profit', value: '₦6.3M', change: '+28%', icon: 'chart-line', color: '#007AFF' },
    { label: 'Cash Flow', value: '₦45.8M', change: '+8%', icon: 'bank', color: '#5856D6' },
  ];

  const revenueStreams = [
    { source: 'ATM Maintenance Contracts', amount: 14200000, percentage: 58 },
    { source: 'Software Licensing', amount: 6800000, percentage: 28 },
    { source: 'Spare Parts Sales', amount: 2500000, percentage: 10 },
    { source: 'Consulting Services', amount: 1000000, percentage: 4 },
  ];

  const pendingPayments = [
    { client: 'GTBank', amount: 8500000, dueDate: 'Dec 5', status: 'overdue' },
    { client: 'Access Bank', amount: 6200000, dueDate: 'Dec 10', status: 'upcoming' },
    { client: 'Zenith Bank', amount: 4800000, dueDate: 'Dec 15', status: 'upcoming' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Finance Dashboard</Text>
          <Text style={styles.headerSubtitle}>Financial overview & analytics</Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          {financialMetrics.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <Icon name={metric.icon} size={28} color={metric.color} />
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={[styles.metricChange, { color: metric.change.startsWith('+') ? '#34C759' : '#FF3B30' }]}>
                {metric.change} vs last month
              </Text>
            </View>
          ))}
        </View>

        {/* Revenue Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Revenue Streams</Text>
          <View style={styles.card}>
            {revenueStreams.map((stream, index) => (
              <View key={index} style={styles.revenueItem}>
                <View style={styles.revenueInfo}>
                  <Text style={styles.revenueSource}>{stream.source}</Text>
                  <View style={styles.revenueBar}>
                    <View style={[styles.revenueBarFill, { width: `${stream.percentage}%` }]} />
                  </View>
                </View>
                <View style={styles.revenueStats}>
                  <Text style={styles.revenueAmount}>₦{(stream.amount / 1000000).toFixed(1)}M</Text>
                  <Text style={styles.revenuePercentage}>{stream.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Accounts Receivable */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Accounts Receivable</Text>
          {pendingPayments.map((payment, index) => (
            <View key={index} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Icon name="bank" size={24} color="#4A90E2" />
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentClient}>{payment.client}</Text>
                  <Text style={styles.paymentDue}>Due: {payment.dueDate}</Text>
                </View>
              </View>
              <View style={styles.paymentFooter}>
                <Text style={styles.paymentAmount}>₦{(payment.amount / 1000000).toFixed(1)}M</Text>
                <View style={[styles.statusBadge, { backgroundColor: payment.status === 'overdue' ? '#FF3B3020' : '#FF950020' }]}>
                  <Text style={[styles.statusText, { color: payment.status === 'overdue' ? '#FF3B30' : '#FF9500' }]}>
                    {payment.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="file-chart" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>P&L Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="cash-flow" size={24} color="#34C759" />
              <Text style={styles.quickActionText}>Cash Flow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="calculator" size={24} color="#FF9500" />
              <Text style={styles.quickActionText}>Budget</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="account-cash" size={24} color="#5856D6" />
              <Text style={styles.quickActionText}>Payroll</Text>
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
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  metricCard: { width: '48%', backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16 },
  metricLabel: { fontSize: 12, color: '#8E8E93', marginTop: 8, marginBottom: 4 },
  metricValue: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  metricChange: { fontSize: 11, fontWeight: '600' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16 },
  revenueItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  revenueInfo: { flex: 1, marginRight: 16 },
  revenueSource: { fontSize: 14, color: '#FFFFFF', marginBottom: 8 },
  revenueBar: { height: 8, backgroundColor: '#2C2C2E', borderRadius: 4, overflow: 'hidden' },
  revenueBarFill: { height: '100%', backgroundColor: '#34C759', borderRadius: 4 },
  revenueStats: { alignItems: 'flex-end' },
  revenueAmount: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 },
  revenuePercentage: { fontSize: 12, color: '#8E8E93' },
  paymentCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, marginBottom: 12 },
  paymentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  paymentInfo: { marginLeft: 12, flex: 1 },
  paymentClient: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  paymentDue: { fontSize: 12, color: '#8E8E93' },
  paymentFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentAmount: { fontSize: 20, fontWeight: 'bold', color: '#34C759' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickActionButton: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, alignItems: 'center', width: '47%' },
  quickActionText: { fontSize: 12, color: '#FFFFFF', marginTop: 8, textAlign: 'center' },
});

export default CFOScreen;

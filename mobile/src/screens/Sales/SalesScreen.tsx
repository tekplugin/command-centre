import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SalesScreen = () => {
  const deals = [
    { client: 'First Bank', project: 'ATM Software License Renewal', value: 12500000, stage: 'negotiation', probability: 80, closeDate: 'Dec 15' },
    { client: 'Union Bank', project: '50 ATM Maintenance Contract', value: 28000000, stage: 'proposal', probability: 60, closeDate: 'Dec 30' },
    { client: 'Polaris Bank', project: 'Software Upgrade Package', value: 8500000, stage: 'qualified', probability: 40, closeDate: 'Jan 10' },
    { client: 'Sterling Bank', project: 'Full Support Package', value: 15000000, stage: 'closed-won', probability: 100, closeDate: 'Nov 20' },
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'closed-won': return '#34C759';
      case 'negotiation': return '#007AFF';
      case 'proposal': return '#FF9500';
      case 'qualified': return '#5856D6';
      default: return '#8E8E93';
    }
  };

  const totalPipelineValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const expectedRevenue = deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sales Pipeline</Text>
          <Text style={styles.headerSubtitle}>ATM software & services deals</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="chart-line" size={28} color="#34C759" />
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statLabel}>Active Deals</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="currency-ngn" size={28} color="#007AFF" />
            <Text style={styles.statValue}>₦{(totalPipelineValue / 1000000).toFixed(0)}M</Text>
            <Text style={styles.statLabel}>Pipeline Value</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="cash-check" size={28} color="#FF9500" />
            <Text style={styles.statValue}>₦{(expectedRevenue / 1000000).toFixed(1)}M</Text>
            <Text style={styles.statLabel}>Expected Revenue</Text>
          </View>
        </View>

        {/* Deal Pipeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💼 Active Deals</Text>
          {deals.map((deal, index) => (
            <TouchableOpacity key={index} style={styles.dealCard}>
              <View style={styles.dealHeader}>
                <View style={styles.dealMainInfo}>
                  <Icon name="handshake" size={24} color="#4A90E2" />
                  <View style={styles.dealInfo}>
                    <Text style={styles.dealClient}>{deal.client}</Text>
                    <Text style={styles.dealProject}>{deal.project}</Text>
                  </View>
                </View>
                <View style={[styles.stageBadge, { backgroundColor: getStageColor(deal.stage) + '20' }]}>
                  <Text style={[styles.stageText, { color: getStageColor(deal.stage) }]}>
                    {deal.stage.replace('-', ' ')}
                  </Text>
                </View>
              </View>

              <View style={styles.dealMetrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Deal Value</Text>
                  <Text style={styles.metricValue}>₦{(deal.value / 1000000).toFixed(1)}M</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Probability</Text>
                  <Text style={styles.metricValue}>{deal.probability}%</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Close Date</Text>
                  <Text style={styles.metricValue}>{deal.closeDate}</Text>
                </View>
              </View>

              <View style={styles.probabilityBar}>
                <View style={[styles.probabilityFill, { width: `${deal.probability}%`, backgroundColor: getStageColor(deal.stage) }]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sales Targets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Monthly Target</Text>
          <View style={styles.targetCard}>
            <View style={styles.targetProgress}>
              <Text style={styles.targetLabel}>November Target: ₦50M</Text>
              <Text style={styles.targetAchieved}>Achieved: ₦42M (84%)</Text>
            </View>
            <View style={styles.targetBar}>
              <View style={[styles.targetFill, { width: '84%' }]} />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="plus-circle" size={24} color="#34C759" />
              <Text style={styles.quickActionText}>New Deal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="account-plus" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Add Lead</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="file-document" size={24} color="#FF9500" />
              <Text style={styles.quickActionText}>Generate Quote</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="chart-box" size={24} color="#5856D6" />
              <Text style={styles.quickActionText}>Sales Report</Text>
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
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginTop: 8 },
  statLabel: { fontSize: 10, color: '#8E8E93', marginTop: 4, textAlign: 'center' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
  dealCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, marginBottom: 12 },
  dealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  dealMainInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dealInfo: { marginLeft: 12, flex: 1 },
  dealClient: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  dealProject: { fontSize: 13, color: '#8E8E93' },
  stageBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  stageText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  dealMetrics: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metricItem: { alignItems: 'center' },
  metricLabel: { fontSize: 11, color: '#8E8E93', marginBottom: 4 },
  metricValue: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  probabilityBar: { height: 6, backgroundColor: '#2C2C2E', borderRadius: 3, overflow: 'hidden' },
  probabilityFill: { height: '100%', borderRadius: 3 },
  targetCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16 },
  targetProgress: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  targetLabel: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
  targetAchieved: { fontSize: 14, color: '#34C759', fontWeight: '600' },
  targetBar: { height: 10, backgroundColor: '#2C2C2E', borderRadius: 5, overflow: 'hidden' },
  targetFill: { height: '100%', backgroundColor: '#34C759', borderRadius: 5 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickActionButton: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, alignItems: 'center', width: '47%' },
  quickActionText: { fontSize: 12, color: '#FFFFFF', marginTop: 8, textAlign: 'center' },
});

export default SalesScreen;

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MarketingScreen = () => {
  const campaigns = [
    { name: 'Q4 ATM Software Promotion', channel: 'Email', status: 'active', leads: 45, conversions: 12, budget: 500000 },
    { name: 'Bank Partnership Outreach', channel: 'LinkedIn', status: 'active', leads: 28, conversions: 8, budget: 300000 },
    { name: 'Maintenance Service Ads', channel: 'Google Ads', status: 'paused', leads: 67, conversions: 15, budget: 750000 },
    { name: 'Trade Show Sponsorship', channel: 'Event', status: 'completed', leads: 120, conversions: 35, budget: 2000000 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#34C759';
      case 'paused': return '#FF9500';
      case 'completed': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const conversionRate = ((totalConversions / totalLeads) * 100).toFixed(1);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Marketing</Text>
          <Text style={styles.headerSubtitle}>Campaigns & lead generation</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="account-multiple" size={28} color="#007AFF" />
            <Text style={styles.statValue}>{totalLeads}</Text>
            <Text style={styles.statLabel}>Total Leads</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="check-circle" size={28} color="#34C759" />
            <Text style={styles.statValue}>{totalConversions}</Text>
            <Text style={styles.statLabel}>Conversions</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="chart-arc" size={28} color="#FF9500" />
            <Text style={styles.statValue}>{conversionRate}%</Text>
            <Text style={styles.statLabel}>Conv. Rate</Text>
          </View>
        </View>

        {/* Campaigns */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📢 Active Campaigns</Text>
          {campaigns.map((campaign, index) => (
            <TouchableOpacity key={index} style={styles.campaignCard}>
              <View style={styles.campaignHeader}>
                <View style={styles.campaignMainInfo}>
                  <Icon name="bullhorn" size={24} color="#AF52DE" />
                  <View style={styles.campaignInfo}>
                    <Text style={styles.campaignName}>{campaign.name}</Text>
                    <Text style={styles.campaignChannel}>{campaign.channel}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(campaign.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(campaign.status) }]}>
                    {campaign.status}
                  </Text>
                </View>
              </View>

              <View style={styles.campaignMetrics}>
                <View style={styles.metricBox}>
                  <Icon name="account-multiple" size={18} color="#007AFF" />
                  <Text style={styles.metricNumber}>{campaign.leads}</Text>
                  <Text style={styles.metricLabel}>Leads</Text>
                </View>
                <View style={styles.metricBox}>
                  <Icon name="handshake" size={18} color="#34C759" />
                  <Text style={styles.metricNumber}>{campaign.conversions}</Text>
                  <Text style={styles.metricLabel}>Conversions</Text>
                </View>
                <View style={styles.metricBox}>
                  <Icon name="currency-ngn" size={18} color="#FF9500" />
                  <Text style={styles.metricNumber}>₦{(campaign.budget / 1000).toFixed(0)}K</Text>
                  <Text style={styles.metricLabel}>Budget</Text>
                </View>
              </View>

              <View style={styles.conversionBar}>
                <View style={[styles.conversionFill, { width: `${(campaign.conversions / campaign.leads) * 100}%` }]} />
              </View>
              <Text style={styles.conversionRate}>
                {((campaign.conversions / campaign.leads) * 100).toFixed(1)}% conversion rate
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lead Sources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Lead Sources</Text>
          <View style={styles.sourceCard}>
            {[
              { source: 'LinkedIn', count: 95, color: '#0077B5' },
              { source: 'Email Campaigns', count: 78, color: '#007AFF' },
              { source: 'Google Ads', count: 67, color: '#34C759' },
              { source: 'Referrals', count: 48, color: '#FF9500' },
            ].map((item, index) => (
              <View key={index} style={styles.sourceItem}>
                <View style={styles.sourceInfo}>
                  <Text style={styles.sourceName}>{item.source}</Text>
                  <View style={styles.sourceBar}>
                    <View style={[styles.sourceBarFill, { width: `${(item.count / 95) * 100}%`, backgroundColor: item.color }]} />
                  </View>
                </View>
                <Text style={styles.sourceCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="rocket-launch" size={24} color="#AF52DE" />
              <Text style={styles.quickActionText}>New Campaign</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="email-fast" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Email Blast</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="chart-timeline-variant" size={24} color="#34C759" />
              <Text style={styles.quickActionText}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="account-group" size={24} color="#FF9500" />
              <Text style={styles.quickActionText}>Manage Leads</Text>
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
  campaignCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, marginBottom: 12 },
  campaignHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  campaignMainInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  campaignInfo: { marginLeft: 12, flex: 1 },
  campaignName: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  campaignChannel: { fontSize: 12, color: '#8E8E93' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  campaignMetrics: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metricBox: { alignItems: 'center', flex: 1 },
  metricNumber: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 },
  metricLabel: { fontSize: 10, color: '#8E8E93', marginTop: 2 },
  conversionBar: { height: 6, backgroundColor: '#2C2C2E', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  conversionFill: { height: '100%', backgroundColor: '#34C759', borderRadius: 3 },
  conversionRate: { fontSize: 11, color: '#8E8E93', textAlign: 'center' },
  sourceCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16 },
  sourceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sourceInfo: { flex: 1, marginRight: 16 },
  sourceName: { fontSize: 14, color: '#FFFFFF', marginBottom: 8 },
  sourceBar: { height: 8, backgroundColor: '#2C2C2E', borderRadius: 4, overflow: 'hidden' },
  sourceBarFill: { height: '100%', borderRadius: 4 },
  sourceCount: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickActionButton: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, alignItems: 'center', width: '47%' },
  quickActionText: { fontSize: 12, color: '#FFFFFF', marginTop: 8, textAlign: 'center' },
});

export default MarketingScreen;

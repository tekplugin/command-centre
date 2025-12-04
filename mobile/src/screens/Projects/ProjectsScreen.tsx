import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Part {
  id: string;
  name: string;
  category: 'dispensers' | 'readers' | 'printers' | 'sensors' | 'power' | 'screens';
  stock: number;
  reorderPoint: number;
  unitPrice: number;
  supplier: string;
  lastOrdered: string;
  status: 'good' | 'low' | 'critical' | 'out-of-stock';
}

const ProjectsScreen = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Mock parts inventory data
  const parts: Part[] = [
    { id: 'PART-001', name: 'Card Reader Module', category: 'readers', stock: 8, reorderPoint: 15, unitPrice: 45000, supplier: 'TechParts Ltd', lastOrdered: '5 days ago', status: 'low' },
    { id: 'PART-002', name: 'Cash Dispenser Unit', category: 'dispensers', stock: 15, reorderPoint: 10, unitPrice: 125000, supplier: 'ATM Solutions', lastOrdered: '12 days ago', status: 'good' },
    { id: 'PART-003', name: 'Thermal Receipt Printer', category: 'printers', stock: 3, reorderPoint: 8, unitPrice: 28000, supplier: 'Print Tech', lastOrdered: '8 days ago', status: 'critical' },
    { id: 'PART-004', name: 'Touch Screen LCD 15"', category: 'screens', stock: 12, reorderPoint: 6, unitPrice: 65000, supplier: 'Display Pro', lastOrdered: '15 days ago', status: 'good' },
    { id: 'PART-005', name: 'UPS Battery Pack', category: 'power', stock: 0, reorderPoint: 10, unitPrice: 35000, supplier: 'Power Systems', lastOrdered: '20 days ago', status: 'out-of-stock' },
    { id: 'PART-006', name: 'Bill Validator Sensor', category: 'sensors', stock: 18, reorderPoint: 12, unitPrice: 18000, supplier: 'Sensor Tech', lastOrdered: '7 days ago', status: 'good' },
    { id: 'PART-007', name: 'Cash Cassette Lock', category: 'dispensers', stock: 22, reorderPoint: 15, unitPrice: 12000, supplier: 'Security Parts', lastOrdered: '10 days ago', status: 'good' },
    { id: 'PART-008', name: 'EMV Card Reader', category: 'readers', stock: 5, reorderPoint: 12, unitPrice: 55000, supplier: 'TechParts Ltd', lastOrdered: '6 days ago', status: 'low' },
    { id: 'PART-009', name: 'Receipt Paper Rolls (Box)', category: 'printers', stock: 45, reorderPoint: 30, unitPrice: 8500, supplier: 'Office Supplies', lastOrdered: '3 days ago', status: 'good' },
    { id: 'PART-010', name: 'Power Supply 350W', category: 'power', stock: 7, reorderPoint: 8, unitPrice: 22000, supplier: 'Power Systems', lastOrdered: '14 days ago', status: 'low' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#34C759';
      case 'low': return '#FF9500';
      case 'critical': return '#FF3B30';
      case 'out-of-stock': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dispensers': return 'cash-multiple';
      case 'readers': return 'credit-card-scan';
      case 'printers': return 'printer';
      case 'sensors': return 'radar';
      case 'power': return 'battery-charging';
      case 'screens': return 'monitor';
      default: return 'cube';
    }
  };

  const filteredParts = parts.filter(part => {
    if (filterCategory === 'all') return true;
    return part.category === filterCategory;
  });

  const categories = ['all', 'dispensers', 'readers', 'printers', 'sensors', 'power', 'screens'];
  const totalValue = parts.reduce((sum, part) => sum + (part.stock * part.unitPrice), 0);
  const lowStockCount = parts.filter(p => p.status === 'low' || p.status === 'critical').length;
  const outOfStockCount = parts.filter(p => p.status === 'out-of-stock').length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Spare Parts Inventory</Text>
          <Text style={styles.headerSubtitle}>Monitor stock levels and procurement</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Icon name="package-variant" size={24} color="#4A90E2" />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryValue}>{parts.length}</Text>
              <Text style={styles.summaryLabel}>Total Parts</Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Icon name="currency-ngn" size={24} color="#34C759" />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryValue}>₦{(totalValue / 1000000).toFixed(1)}M</Text>
              <Text style={styles.summaryLabel}>Inventory Value</Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Icon name="alert" size={24} color="#FF9500" />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryValue}>{lowStockCount}</Text>
              <Text style={styles.summaryLabel}>Low Stock</Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Icon name="close-circle" size={24} color="#FF3B30" />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryValue}>{outOfStockCount}</Text>
              <Text style={styles.summaryLabel}>Out of Stock</Text>
            </View>
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.filterChip, filterCategory === category && styles.filterChipActive]}
              onPress={() => setFilterCategory(category)}
            >
              <Icon 
                name={category === 'all' ? 'view-grid' : getCategoryIcon(category)} 
                size={16} 
                color={filterCategory === category ? '#FFFFFF' : '#8E8E93'} 
              />
              <Text style={[styles.filterText, filterCategory === category && styles.filterTextActive]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Parts List */}
        <View style={styles.partsList}>
          {filteredParts.map((part) => (
            <TouchableOpacity key={part.id} style={styles.partCard}>
              <View style={styles.partHeader}>
                <View style={styles.partMainInfo}>
                  <View style={[styles.iconContainer, { backgroundColor: getStatusColor(part.status) + '20' }]}>
                    <Icon name={getCategoryIcon(part.category)} size={24} color={getStatusColor(part.status)} />
                  </View>
                  <View style={styles.partInfo}>
                    <Text style={styles.partName}>{part.name}</Text>
                    <Text style={styles.partId}>{part.id}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(part.status) + '20' }]}>
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(part.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(part.status) }]}>
                    {part.status.replace('-', ' ')}
                  </Text>
                </View>
              </View>

              <View style={styles.partDetails}>
                <View style={styles.detailRow}>
                  <Icon name="tag" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>{part.category.charAt(0).toUpperCase() + part.category.slice(1)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="store" size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>{part.supplier}</Text>
                </View>
              </View>

              <View style={styles.stockInfo}>
                <View style={styles.stockBar}>
                  <View style={styles.stockBarTrack}>
                    <View 
                      style={[
                        styles.stockBarFill, 
                        { 
                          width: `${Math.min((part.stock / part.reorderPoint) * 100, 100)}%`,
                          backgroundColor: getStatusColor(part.status)
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.stockText}>{part.stock} / {part.reorderPoint} units</Text>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Unit Price</Text>
                  <Text style={styles.metricValue}>₦{part.unitPrice.toLocaleString()}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Stock Value</Text>
                  <Text style={styles.metricValue}>₦{(part.stock * part.unitPrice).toLocaleString()}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Last Ordered</Text>
                  <Text style={styles.metricValue}>{part.lastOrdered}</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="cart-plus" size={16} color="#4A90E2" />
                  <Text style={styles.actionButtonText}>Reorder</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="history" size={16} color="#4A90E2" />
                  <Text style={styles.actionButtonText}>History</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="file-document" size={16} color="#4A90E2" />
                  <Text style={styles.actionButtonText}>Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Quick Order Button */}
      <TouchableOpacity style={styles.fab}>
        <Icon name="cart" size={24} color="#FFFFFF" />
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
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    minWidth: '47%',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  partsList: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  partCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
  },
  partHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  partMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partInfo: {
    marginLeft: 12,
    flex: 1,
  },
  partName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  partId: {
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
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  partDetails: {
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
  stockInfo: {
    marginBottom: 12,
  },
  stockBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stockBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  stockBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  stockText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
    minWidth: 100,
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
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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

export default ProjectsScreen;

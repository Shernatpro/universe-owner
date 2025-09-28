import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import EaronSymbol from './EaronSymbol';

interface LandPurchaseCardProps {
  credits: number;
  totalLandOwned: number;
  onBuyLand: (amount: number) => void;
  getMaxAffordableLand: () => number;
  formatNumber: (num: number) => string;
  showTitle?: boolean;
  compact?: boolean;
}

export default function LandPurchaseCard({
  credits,
  totalLandOwned,
  onBuyLand,
  getMaxAffordableLand,
  formatNumber,
  showTitle = true,
  compact = false
}: LandPurchaseCardProps) {
  
  const [selectedAmount, setSelectedAmount] = useState<number>(1);
  
  const calculateCost = (amount: number) => {
    const baseCost = Math.max(1, Math.pow(1.0001, totalLandOwned));
    return baseCost * amount;
  };
  
  const formatCost = (cost: number) => {
    if (cost >= 1000000) return (cost / 1000000).toFixed(2) + 'M';
    if (cost >= 1000) return (cost / 1000).toFixed(2) + 'K';
    if (cost >= 1) return cost.toFixed(2);
    return cost.toFixed(4);
  };
  
  const maxAffordable = getMaxAffordableLand();
  const cost = calculateCost(selectedAmount);
  const canAfford = credits >= cost;

  const quantityOptions = [
    { label: 'x1', value: 1 },
    { label: 'x10', value: 10 },
    { label: 'x100', value: 100 },
    { label: 'x1000', value: 1000 },
    { label: 'MAX', value: Math.max(1, maxAffordable) }
  ];

  const handleQuantitySelect = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleBuyLand = () => {
    if (canAfford) {
      onBuyLand(selectedAmount);
      setSelectedAmount(1); // Reset to x1 after purchase
    }
  };

  return (
    <View style={[styles.purchaseCard, compact && styles.compactCard]}>
      {showTitle && (
        <View style={styles.purchaseHeader}>
          <Text style={styles.purchaseTitle}>Buy Land by Square Meter</Text>
          <Text style={styles.purchaseSubtitle}>Each m² generates 0.01 Earon/second</Text>
        </View>
      )}
      
      {!showTitle && (
        <Text style={styles.compactTitle}>🏞️ Buy Land (m²)</Text>
      )}
      
      {/* Quantity Selector */}
      <View style={styles.quantitySelector}>
        <Text style={styles.quantityLabel}>Select Amount:</Text>
        <View style={styles.quantityOptions}>
          {quantityOptions.map((option) => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.quantityButton,
                selectedAmount === option.value && styles.selectedQuantityButton,
                option.value > maxAffordable && option.label !== 'MAX' && styles.disabledQuantityButton
              ]}
              onPress={() => handleQuantitySelect(option.value)}
              disabled={option.value > maxAffordable && option.label !== 'MAX'}
            >
              <Text style={[
                styles.quantityButtonText,
                selectedAmount === option.value && styles.selectedQuantityButtonText,
                option.value > maxAffordable && option.label !== 'MAX' && styles.disabledQuantityButtonText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Purchase Details */}
      <View style={[styles.purchaseDetails, compact && styles.compactPurchaseDetails]}>
        <View style={styles.costContainer}>
          <Text style={[styles.costLabel, compact && styles.compactCostLabel]}>
            Cost for {selectedAmount === maxAffordable ? formatNumber(selectedAmount) : selectedAmount} m²:
          </Text>
          <View style={styles.costValueContainer}>
            <EaronSymbol size="small" />
            <Text style={[styles.costValue, compact && styles.compactCostValue]}>
              {formatCost(cost)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.buyButton,
            compact && styles.compactBuyButton,
            !canAfford && styles.disabledButton
          ]}
          onPress={handleBuyLand}
          disabled={!canAfford}
        >
          <Text style={[
            styles.buyButtonText,
            compact && styles.compactBuyButtonText,
            !canAfford && styles.disabledButtonText
          ]}>
            Buy {selectedAmount === maxAffordable ? formatNumber(selectedAmount) : selectedAmount} m²
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  purchaseCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  compactCard: {
    padding: 10,
    marginBottom: 6,
    borderRadius: 10,
  },
  purchaseHeader: {
    marginBottom: 8,
  },
  purchaseTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  purchaseSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '400',
  },
  compactTitle: {
    color: 'white',
    fontSize: 9,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  quantitySelector: {
    marginBottom: 12,
  },
  quantityLabel: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    textAlign: 'center',
  },
  quantityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  quantityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  selectedQuantityButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: '#3B82F6',
  },
  disabledQuantityButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: 'rgba(107, 114, 128, 0.2)',
    opacity: 0.5,
  },
  quantityButtonText: {
    color: '#D1D5DB',
    fontSize: 10,
    fontWeight: '600',
  },
  selectedQuantityButtonText: {
    color: '#3B82F6',
    fontWeight: '800',
  },
  disabledQuantityButtonText: {
    color: '#6B7280',
  },
  purchaseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactPurchaseDetails: {
    gap: 6,
  },
  costContainer: {
    flex: 1,
  },
  costLabel: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 3,
  },
  compactCostLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  costValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costValue: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 4,
  },
  compactCostValue: {
    fontSize: 14,
    marginLeft: 4,
  },
  buyButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366F1',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  compactBuyButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  compactBuyButtonText: {
    fontSize: 11,
  },
  disabledButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    borderColor: 'rgba(107, 114, 128, 0.5)',
  },
  disabledButtonText: {
    color: '#6B7280',
  },
});
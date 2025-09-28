import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Hammer, ArrowUp, Trash2, RefreshCw } from 'lucide-react-native';
import { useGameStore, BUILDING_CONFIGS, BuildingType } from '@/hooks/useGameStore';
import { useState, useEffect } from 'react';
import EaronSymbol from '@/components/EaronSymbol';

export default function DevelopmentScreen() {
  const { 
    gameState, 
    buildBuilding, 
    upgradeBuilding, 
    demolishBuilding, 
    getCurrentRegion,
    calculateBuildingIncome,
    calculateTotalBuildingIncome,
    getRegionalBonus
  } = useGameStore();
  
  const [selectedRegionId, setSelectedRegionId] = useState<number>(1);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'buildings' | 'wonders'>('buildings');
  
  // Debug gameState with more detail
  console.log('🔍 DevelopmentScreen gameState:', {
    credits: gameState.credits,
    creditsType: typeof gameState.credits,
    creditsString: String(gameState.credits),
    creditsNumber: Number(gameState.credits),
    isNaN: isNaN(gameState.credits),
    totalLandOwned: gameState.totalLandOwned,
    creditsPerSecond: gameState.creditsPerSecond
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  const currentRegion = getCurrentRegion();
  const selectedRegion = gameState.regions.find(r => r.id === selectedRegionId) || currentRegion;
  const unlockedRegions = gameState.regions.filter(r => r.unlocked);
  const totalBuildingIncome = calculateTotalBuildingIncome();

  const getUsedSlots = (regionId: number) => {
    const region = gameState.regions.find(r => r.id === regionId);
    if (!region) return 0;
    return region.buildings.reduce((total, building) => {
      return total + BUILDING_CONFIGS[building.type].slotCost;
    }, 0);
  };

  const getRegionTypeInfo = (type: string) => {
    const info = {
      island: { emoji: '🏝️', name: 'Island', color: '#3B82F6' },
      forest: { emoji: '🌲', name: 'Forest', color: '#10B981' },
      arctic: { emoji: '❄️', name: 'Arctic', color: '#8B5CF6' },
      desert: { emoji: '🏜️', name: 'Desert', color: '#F59E0B' }
    };
    return info[type as keyof typeof info] || info.island;
  };

  const getAvailableBuildings = () => {
    return Object.entries(BUILDING_CONFIGS).filter(([_, config]) => {
      const landRequirement = (config.unlockRegion - 1) * 1000000000000;
      return gameState.totalLandOwned >= landRequirement;
    });
  };

  const handleBuildBuilding = (buildingType: BuildingType) => {
    console.log('Attempting to build:', buildingType, 'in region:', selectedRegionId);
    const success = buildBuilding(selectedRegionId, buildingType);
    console.log('Build result:', success);
    if (success && typeof success === 'object' && 'success' in success && !success.success) {
      let message = 'Cannot build this building.';
      if (success.reason === 'earons') {
        message = `Not enough Earons! Need ${formatNumber(success.required)} but you have ${formatNumber(success.owned)}.`;
      } else if (success.reason === 'slots') {
        message = `Not enough slots! Need ${success.required} slots but only ${success.available} available.`;
      } else if (success.reason === 'land_requirement') {
        message = `Building locked! Need ${formatNumber(success.required)} m² land owned but you have ${formatNumber(success.owned)}.`;
      }
      Alert.alert('Cannot Build', message);
    }
  };

  const handleUpgradeBuilding = (buildingId: string) => {
    const success = upgradeBuilding(buildingId);
    if (!success) {
      Alert.alert('Cannot Upgrade', 'Not enough credits or building is already max level.');
    }
  };

  const handleDemolishBuilding = (buildingId: string) => {
    Alert.alert(
      'Demolish Building',
      'Are you sure? You will get 50% refund of total investment.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Demolish', 
          style: 'destructive',
          onPress: () => demolishBuilding(buildingId)
        }
      ]
    );
  };

  return (
    <LinearGradient colors={['#0B0D1A', '#1A1B3A', '#2D1B69']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.3)', 'rgba(245, 158, 11, 0.1)']}
            style={styles.headerIcon}
          >
            <Hammer size={32} color="#F59E0B" />
          </LinearGradient>
          <Text style={styles.headerTitle}>Development</Text>
          <Text style={styles.headerSubtitle}>Build your cosmic empire</Text>
          <Text style={styles.debugText}>Credits: {Number(gameState.credits)}</Text>
        </View>

        {/* Total Building Income */}
        <View style={styles.incomeCard}>
          <Text style={styles.incomeTitle}>🏗️ Total Building Income</Text>
          <Text style={styles.incomeValue}>+{totalBuildingIncome.toFixed(2)} Earon/sec</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'buildings' && styles.activeTabButton]}
            onPress={() => setActiveTab('buildings')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'buildings' && styles.activeTabButtonText]}>
              Buildings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'wonders' && styles.activeTabButton]}
            onPress={() => setActiveTab('wonders')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'wonders' && styles.activeTabButtonText]}>
              World Wonders
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'buildings' ? (
          <>
        {/* Region Selector */}
        <View style={styles.regionSelector}>
          <Text style={styles.sectionTitle}>Select Region</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionList}>
            {unlockedRegions.map(region => {
              const typeInfo = getRegionTypeInfo(region.type);
              const usedSlots = getUsedSlots(region.id);
              const isSelected = region.id === selectedRegionId;
              
              return (
                <TouchableOpacity
                  key={region.id}
                  style={[
                    styles.regionCard,
                    isSelected && styles.selectedRegionCard,
                    { borderColor: typeInfo.color }
                  ]}
                  onPress={() => setSelectedRegionId(region.id)}
                >
                  <Text style={styles.regionEmoji}>{typeInfo.emoji}</Text>
                  <Text style={styles.regionName}>{region.name}</Text>
                  <Text style={styles.regionType}>{typeInfo.name}</Text>
                  <Text style={styles.regionSlots}>{usedSlots}/{region.maxSlots} slots</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Selected Region Details */}
        <View style={styles.regionDetails}>
          <View style={styles.regionHeader}>
            <Text style={styles.regionTitle}>
              {getRegionTypeInfo(selectedRegion.type).emoji} {selectedRegion.name}
            </Text>
            <Text style={styles.regionInfo}>
              {getUsedSlots(selectedRegionId)}/{selectedRegion.maxSlots} slots used
            </Text>
          </View>

          {/* Regional Bonuses */}
          <View style={styles.bonusesCard}>
            <Text style={styles.bonusesTitle}>🎯 Regional Bonuses</Text>
            <View style={styles.bonusesList}>
              {Object.entries(BUILDING_CONFIGS).map(([buildingType, config]) => {
                const bonus = getRegionalBonus(buildingType as BuildingType, selectedRegion.type);
                if (bonus === 1.0) return null;
                
                return (
                  <View key={buildingType} style={styles.bonusItem}>
                    <Text style={styles.bonusEmoji}>{config.emoji}</Text>
                    <Text style={styles.bonusText}>
                      {config.name}: +{Math.round((bonus - 1) * 100)}%
                    </Text>
                  </View>
                );
              })}
              {selectedRegion.type === 'arctic' && (
                <View style={styles.bonusItem}>
                  <Text style={styles.bonusEmoji}>💰</Text>
                  <Text style={styles.bonusText}>All Buildings: -25% cost</Text>
                </View>
              )}
            </View>
          </View>

          {/* Existing Buildings */}
          {selectedRegion.buildings.length > 0 && (
            <View style={styles.buildingsSection}>
              <Text style={styles.sectionTitle}>Existing Buildings</Text>
              <View style={styles.buildingsList}>
                {selectedRegion.buildings.map(building => {
                  const config = BUILDING_CONFIGS[building.type];
                  const income = calculateBuildingIncome(building);
                  const isSelected = building.id === selectedBuildingId;
                  
                  return (
                    <TouchableOpacity
                      key={building.id}
                      style={[
                        styles.buildingCard,
                        isSelected && styles.selectedBuildingCard
                      ]}
                      onPress={() => setSelectedBuildingId(isSelected ? null : building.id)}
                    >
                      <View style={styles.buildingHeader}>
                        <Text style={styles.buildingEmoji}>{config.emoji}</Text>
                        <View style={styles.buildingInfo}>
                          <Text style={styles.buildingName}>{config.name}</Text>
                          <Text style={styles.buildingLevel}>Level {building.level}</Text>
                        </View>
                        <View style={styles.buildingIncomeContainer}>
                          {(() => {
                            const baseIncome = config.baseIncome[building.level - 1] || 0;
                            const region = gameState.regions.find(r => r.id === building.regionId);
                            const bonus = region ? getRegionalBonus(building.type, region.type) : 1;
                            const bonusIncome = baseIncome * (bonus - 1);
                            
                            if (bonus > 1) {
                              return (
                                <>
                                  <Text style={styles.buildingBaseIncome}>+{baseIncome.toFixed(2)}/s</Text>
                                  <Text style={styles.buildingBonusIncome}>+{bonusIncome.toFixed(2)}/s bonus</Text>
                                  <Text style={styles.buildingTotalIncome}>+{income.toFixed(2)}/s total</Text>
                                </>
                              );
                            } else {
                              return <Text style={styles.buildingIncome}>+{income.toFixed(2)}/s</Text>;
                            }
                          })()}
                        </View>
                      </View>
                      
                      {isSelected && (
                        <View style={styles.buildingActions}>
                          {building.level < 3 && (
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => handleUpgradeBuilding(building.id)}
                            >
                              <ArrowUp size={16} color="#10B981" />
                              <Text style={styles.actionText}>
                                Upgrade ({formatNumber(config.baseCost[building.level])})
                              </Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={[styles.actionButton, styles.demolishButton]}
                            onPress={() => handleDemolishBuilding(building.id)}
                          >
                            <Trash2 size={16} color="#EF4444" />
                            <Text style={[styles.actionText, styles.demolishText]}>Demolish</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Available Buildings */}
          <View style={styles.buildingsSection}>
            <Text style={styles.sectionTitle}>Build New</Text>
            <View style={styles.buildingsList}>
              {getAvailableBuildings().map(([buildingType, config]) => {
                const landRequirement = (config.unlockRegion - 1) * 1000000000000;
                const adjustedCost = selectedRegion.type === 'arctic' ? Math.floor(config.baseCost[0] * 0.75) : config.baseCost[0];
                const canAfford = Number(gameState.credits) >= Number(adjustedCost);
                const hasSlots = getUsedSlots(selectedRegionId) + config.slotCost <= selectedRegion.maxSlots;
                const hasLand = gameState.totalLandOwned >= landRequirement;
                const canBuild = canAfford && hasSlots && hasLand;
                const bonus = getRegionalBonus(buildingType as BuildingType, selectedRegion.type);
                
                console.log(`🏗️ Building ${buildingType} check:`, {
                  rawCredits: gameState.credits,
                  numberCredits: Number(gameState.credits),
                  creditsType: typeof gameState.credits,
                  adjustedCost,
                  costType: typeof adjustedCost,
                  comparison: Number(gameState.credits) >= Number(adjustedCost),
                  canAfford,
                  canBuild,
                  hasSlots,
                  hasLand
                });
                
                return (
                  <TouchableOpacity
                    key={buildingType}
                    onPress={() => canBuild && handleBuildBuilding(buildingType as BuildingType)}
                    disabled={!canBuild}
                  >
                    <View style={[
                      styles.newBuildingCard,
                      !canBuild && styles.disabledBuildingCard
                    ]}>
                      <View style={styles.buildingHeader}>
                        <Text style={styles.buildingEmoji}>{config.emoji}</Text>
                        <View style={styles.buildingInfo}>
                          <Text style={styles.buildingName}>{config.name}</Text>
                          <Text style={styles.buildingSlots}>{config.slotCost} slot{config.slotCost > 1 ? 's' : ''}</Text>
                        </View>
                        <View style={styles.buildingStats}>
                        <View style={styles.costContainer}>
                          <EaronSymbol size="small" />
                          <Text style={styles.buildingCost}>{formatNumber(adjustedCost)}</Text>
                        </View>
                        <Text style={styles.buildingIncome}>
                          +{formatNumber(config.baseIncome[0] * bonus)}/s
                        </Text>
                        {bonus > 1 && (
                          <Text style={styles.bonusIndicator}>+{Math.round((bonus - 1) * 100)}%</Text>
                        )}
                      </View>
                      </View>
                    
                      {!canAfford && (
                        <Text style={styles.errorText}>
                          Not enough Earons! Have: {formatNumber(Number(gameState.credits))} | Need: {formatNumber(adjustedCost)}
                        </Text>
                      )}
                      {!hasSlots && (
                        <Text style={styles.errorText}>Not enough slots</Text>
                      )}
                      {!hasLand && (
                        <Text style={styles.errorText}>Need {formatNumber(landRequirement)} m² land owned</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

        </View>
        </>
        ) : (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>World Wonders coming soon!</Text>
            <Text style={styles.comingSoonSubtext}>Check the Wonders tab for the full experience</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
  },
  incomeCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  incomeTitle: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  incomeValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  regionSelector: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  regionList: {
    flexDirection: 'row',
  },
  regionCard: {
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    minWidth: 120,
  },
  selectedRegionCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  regionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  regionName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  regionType: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
  },
  regionSlots: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '600',
  },
  regionDetails: {
    marginBottom: 20,
  },
  regionHeader: {
    marginBottom: 16,
  },
  regionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  regionInfo: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  bonusesCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  bonusesTitle: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  bonusesList: {
    gap: 8,
  },
  bonusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bonusEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  bonusText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
  },
  buildingsSection: {
    marginBottom: 20,
  },
  buildingsList: {
    gap: 12,
  },
  buildingCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedBuildingCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
  },
  newBuildingCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  disabledBuildingCard: {
    backgroundColor: 'rgba(107, 114, 128, 0.05)',
    borderColor: 'rgba(107, 114, 128, 0.2)',
    opacity: 0.6,
  },
  buildingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buildingEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  buildingInfo: {
    flex: 1,
  },
  buildingName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  buildingLevel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  buildingSlots: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '500',
  },
  buildingStats: {
    alignItems: 'flex-end',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  buildingCost: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  buildingIncome: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  buildingIncomeContainer: {
    alignItems: 'flex-end',
  },
  buildingBaseIncome: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
  },
  buildingBonusIncome: {
    color: '#8B5CF6',
    fontSize: 11,
    fontWeight: '600',
  },
  buildingTotalIncome: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700',
  },
  bonusIndicator: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
  },
  buildingActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  demolishButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  actionText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  demolishText: {
    color: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  tabSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#F59E0B',
  },
  tabButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: 'white',
  },
  comingSoon: {
    alignItems: 'center',
    padding: 40,
  },
  comingSoonText: {
    color: '#F59E0B',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  comingSoonSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  debugText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
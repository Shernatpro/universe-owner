import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Star, Lock, Info } from 'lucide-react-native';
import { useGameStore } from '@/hooks/useGameStore';
import { useState } from 'react';
import EaronSymbol from '@/components/EaronSymbol';

interface Wonder {
  id: number;
  name: string;
  location: string;
  tier: number;
  cost: number;
  income: number;
  description: string;
  unlockRequirement: number; // Total land owned requirement
  emoji: string;
}

const WORLD_WONDERS: Wonder[] = [
  // Tier 1 - Ancient Foundations (1-40)
  { id: 1, name: "Göbekli Tepe", location: "Turkey", tier: 1, cost: 10000, income: 50, description: "World's oldest temple", unlockRequirement: 1000, emoji: "🏛️" },
  { id: 2, name: "Great Pyramid of Giza", location: "Egypt", tier: 1, cost: 15000, income: 75, description: "Ancient wonder", unlockRequirement: 1500, emoji: "🔺" },
  { id: 3, name: "Stonehenge", location: "England", tier: 1, cost: 12000, income: 60, description: "Stone circle", unlockRequirement: 1200, emoji: "🗿" },
  { id: 4, name: "Petra", location: "Jordan", tier: 1, cost: 18000, income: 90, description: "Ancient city", unlockRequirement: 1800, emoji: "🏜️" },
  { id: 5, name: "Newgrange", location: "Ireland", tier: 1, cost: 8000, income: 40, description: "Passage tomb", unlockRequirement: 800, emoji: "⚱️" },
  { id: 6, name: "Persepolis", location: "Iran", tier: 1, cost: 20000, income: 100, description: "Persian capital", unlockRequirement: 2000, emoji: "🏛️" },
  { id: 7, name: "Skara Brae", location: "Scotland", tier: 1, cost: 6000, income: 30, description: "Neolithic village", unlockRequirement: 600, emoji: "🏘️" },
  { id: 8, name: "Hanging Gardens of Babylon", location: "Iraq", tier: 1, cost: 25000, income: 125, description: "Ancient wonder", unlockRequirement: 2500, emoji: "🌿" },
  { id: 9, name: "Carnac Stones", location: "France", tier: 1, cost: 7000, income: 35, description: "Megalithic alignments", unlockRequirement: 700, emoji: "🗿" },
  { id: 10, name: "Parthenon", location: "Greece", tier: 1, cost: 22000, income: 110, description: "Ancient temple", unlockRequirement: 2200, emoji: "🏛️" },
  
  // Tier 2 - Medieval Marvels (41-80)
  { id: 41, name: "Hagia Sophia", location: "Turkey", tier: 2, cost: 50000, income: 250, description: "Byzantine cathedral", unlockRequirement: 5000, emoji: "🕌" },
  { id: 42, name: "Notre-Dame de Paris", location: "France", tier: 2, cost: 45000, income: 225, description: "Gothic cathedral", unlockRequirement: 4500, emoji: "⛪" },
  { id: 43, name: "Westminster Abbey", location: "England", tier: 2, cost: 40000, income: 200, description: "Gothic abbey", unlockRequirement: 4000, emoji: "⛪" },
  { id: 44, name: "Alhambra", location: "Spain", tier: 2, cost: 55000, income: 275, description: "Moorish palace", unlockRequirement: 5500, emoji: "🏰" },
  { id: 45, name: "Angkor Wat", location: "Cambodia", tier: 2, cost: 60000, income: 300, description: "Temple complex", unlockRequirement: 6000, emoji: "🏛️" },
  { id: 46, name: "Blue Mosque", location: "Turkey", tier: 2, cost: 48000, income: 240, description: "Ottoman mosque", unlockRequirement: 4800, emoji: "🕌" },
  { id: 47, name: "Sainte-Chapelle", location: "France", tier: 2, cost: 42000, income: 210, description: "Gothic chapel", unlockRequirement: 4200, emoji: "⛪" },
  { id: 48, name: "Canterbury Cathedral", location: "England", tier: 2, cost: 38000, income: 190, description: "Gothic cathedral", unlockRequirement: 3800, emoji: "⛪" },
  { id: 49, name: "Sagrada Família", location: "Spain", tier: 2, cost: 65000, income: 325, description: "Modernist basilica", unlockRequirement: 6500, emoji: "⛪" },
  { id: 50, name: "Forbidden City", location: "China", tier: 2, cost: 70000, income: 350, description: "Imperial palace", unlockRequirement: 7000, emoji: "🏰" },
  
  // Tier 3 - Renaissance & Baroque (81-120)
  { id: 81, name: "St. Peter's Basilica", location: "Vatican", tier: 3, cost: 100000, income: 500, description: "Renaissance basilica", unlockRequirement: 10000, emoji: "⛪" },
  { id: 82, name: "Palace of Versailles", location: "France", tier: 3, cost: 120000, income: 600, description: "Baroque palace", unlockRequirement: 12000, emoji: "🏰" },
  { id: 83, name: "Taj Mahal", location: "India", tier: 3, cost: 150000, income: 750, description: "Mughal mausoleum", unlockRequirement: 15000, emoji: "🕌" },
  { id: 84, name: "Machu Picchu", location: "Peru", tier: 3, cost: 130000, income: 650, description: "Incan citadel", unlockRequirement: 13000, emoji: "🏔️" },
  { id: 85, name: "Sistine Chapel", location: "Vatican", tier: 3, cost: 90000, income: 450, description: "Renaissance chapel", unlockRequirement: 9000, emoji: "🎨" },
  { id: 86, name: "Louvre Palace", location: "France", tier: 3, cost: 110000, income: 550, description: "Renaissance palace", unlockRequirement: 11000, emoji: "🏰" },
  { id: 87, name: "Red Fort", location: "India", tier: 3, cost: 95000, income: 475, description: "Mughal fort", unlockRequirement: 9500, emoji: "🏰" },
  { id: 88, name: "Chichen Itza", location: "Mexico", tier: 3, cost: 140000, income: 700, description: "Mayan pyramid", unlockRequirement: 14000, emoji: "🔺" },
  { id: 89, name: "Vatican Museums", location: "Vatican", tier: 3, cost: 85000, income: 425, description: "Art collection", unlockRequirement: 8500, emoji: "🎨" },
  { id: 90, name: "Château de Chambord", location: "France", tier: 3, cost: 105000, income: 525, description: "Renaissance castle", unlockRequirement: 10500, emoji: "🏰" },
  
  // Tier 4 - Imperial Grandeur (121-160)
  { id: 121, name: "Schönbrunn Palace", location: "Austria", tier: 4, cost: 200000, income: 1000, description: "Baroque palace", unlockRequirement: 20000, emoji: "🏰" },
  { id: 122, name: "Peterhof Palace", location: "Russia", tier: 4, cost: 220000, income: 1100, description: "Baroque palace", unlockRequirement: 22000, emoji: "🏰" },
  { id: 123, name: "Kinkaku-ji", location: "Japan", tier: 4, cost: 180000, income: 900, description: "Golden Pavilion", unlockRequirement: 18000, emoji: "🏯" },
  { id: 124, name: "Buckingham Palace", location: "England", tier: 4, cost: 250000, income: 1250, description: "Royal residence", unlockRequirement: 25000, emoji: "🏰" },
  { id: 125, name: "Belvedere Palace", location: "Austria", tier: 4, cost: 190000, income: 950, description: "Baroque palace", unlockRequirement: 19000, emoji: "🏰" },
  { id: 126, name: "Catherine Palace", location: "Russia", tier: 4, cost: 210000, income: 1050, description: "Baroque palace", unlockRequirement: 21000, emoji: "🏰" },
  { id: 127, name: "Fushimi Inari", location: "Japan", tier: 4, cost: 170000, income: 850, description: "Shinto shrine", unlockRequirement: 17000, emoji: "⛩️" },
  { id: 128, name: "Tower of London", location: "England", tier: 4, cost: 240000, income: 1200, description: "Historic fortress", unlockRequirement: 24000, emoji: "🏰" },
  { id: 129, name: "Salzburg Cathedral", location: "Austria", tier: 4, cost: 185000, income: 925, description: "Baroque cathedral", unlockRequirement: 18500, emoji: "⛪" },
  { id: 130, name: "Winter Palace", location: "Russia", tier: 4, cost: 230000, income: 1150, description: "Baroque palace", unlockRequirement: 23000, emoji: "🏰" },
  
  // Tier 5 - Industrial Age Icons (161-185)
  { id: 161, name: "Eiffel Tower", location: "France", tier: 5, cost: 500000, income: 2500, description: "Iron tower", unlockRequirement: 50000, emoji: "🗼" },
  { id: 162, name: "Statue of Liberty", location: "USA", tier: 5, cost: 450000, income: 2250, description: "Neoclassical statue", unlockRequirement: 45000, emoji: "🗽" },
  { id: 163, name: "Sydney Opera House", location: "Australia", tier: 5, cost: 600000, income: 3000, description: "Modern architecture", unlockRequirement: 60000, emoji: "🎭" },
  { id: 164, name: "Christ the Redeemer", location: "Brazil", tier: 5, cost: 400000, income: 2000, description: "Art Deco statue", unlockRequirement: 40000, emoji: "✝️" },
  { id: 165, name: "Arc de Triomphe", location: "France", tier: 5, cost: 480000, income: 2400, description: "Triumphal arch", unlockRequirement: 48000, emoji: "🏛️" },
  { id: 166, name: "Brooklyn Bridge", location: "USA", tier: 5, cost: 420000, income: 2100, description: "Suspension bridge", unlockRequirement: 42000, emoji: "🌉" },
  { id: 167, name: "Uluru", location: "Australia", tier: 5, cost: 550000, income: 2750, description: "Sacred monolith", unlockRequirement: 55000, emoji: "🪨" },
  { id: 168, name: "Sugarloaf Mountain", location: "Brazil", tier: 5, cost: 380000, income: 1900, description: "Natural landmark", unlockRequirement: 38000, emoji: "⛰️" },
  { id: 169, name: "Opéra Garnier", location: "France", tier: 5, cost: 460000, income: 2300, description: "Opera house", unlockRequirement: 46000, emoji: "🎭" },
  { id: 170, name: "Golden Gate Bridge", location: "USA", tier: 5, cost: 520000, income: 2600, description: "Suspension bridge", unlockRequirement: 52000, emoji: "🌉" },
  
  // Tier 6 - Ultimate Modern Wonders (186-200)
  { id: 186, name: "Burj Khalifa", location: "UAE", tier: 6, cost: 1000000, income: 5000, description: "Supertall skyscraper", unlockRequirement: 100000, emoji: "🏢" },
  { id: 187, name: "CN Tower", location: "Canada", tier: 6, cost: 800000, income: 4000, description: "Communication tower", unlockRequirement: 80000, emoji: "🗼" },
  { id: 188, name: "Petronas Towers", location: "Malaysia", tier: 6, cost: 900000, income: 4500, description: "Twin skyscrapers", unlockRequirement: 90000, emoji: "🏢" },
  { id: 189, name: "Space Needle", location: "USA", tier: 6, cost: 700000, income: 3500, description: "Observation tower", unlockRequirement: 70000, emoji: "🗼" },
  { id: 190, name: "Marina Bay Sands", location: "Singapore", tier: 6, cost: 1200000, income: 6000, description: "Integrated resort", unlockRequirement: 120000, emoji: "🏨" },
  { id: 191, name: "Niagara Falls", location: "Canada/USA", tier: 6, cost: 750000, income: 3750, description: "Waterfalls", unlockRequirement: 75000, emoji: "💧" },
  { id: 192, name: "KLCC Park", location: "Malaysia", tier: 6, cost: 850000, income: 4250, description: "Urban park", unlockRequirement: 85000, emoji: "🌳" },
  { id: 193, name: "Lincoln Memorial", location: "USA", tier: 6, cost: 650000, income: 3250, description: "Neoclassical memorial", unlockRequirement: 65000, emoji: "🏛️" },
  { id: 194, name: "Gardens by the Bay", location: "Singapore", tier: 6, cost: 1100000, income: 5500, description: "Futuristic park", unlockRequirement: 110000, emoji: "🌺" },
  { id: 200, name: "International Space Station", location: "Space", tier: 6, cost: 10000000, income: 50000, description: "Orbital laboratory", unlockRequirement: 1000000, emoji: "🛰️" },
];

export default function WondersScreen() {
  const { gameState } = useGameStore();
  const [selectedTier, setSelectedTier] = useState<number>(1);
  
  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };
  
  const getAvailableWonders = (tier: number) => {
    return WORLD_WONDERS.filter(wonder => 
      wonder.tier === tier && gameState.totalLandOwned >= wonder.unlockRequirement
    );
  };
  
  const getLockedWonders = (tier: number) => {
    return WORLD_WONDERS.filter(wonder => 
      wonder.tier === tier && gameState.totalLandOwned < wonder.unlockRequirement
    );
  };
  
  const getTierInfo = (tier: number) => {
    const info = {
      1: { name: "Ancient Foundations", color: "#8B5CF6", emoji: "🏛️" },
      2: { name: "Medieval Marvels", color: "#10B981", emoji: "⛪" },
      3: { name: "Renaissance & Baroque", color: "#F59E0B", emoji: "🏰" },
      4: { name: "Imperial Grandeur", color: "#EF4444", emoji: "👑" },
      5: { name: "Industrial Age Icons", color: "#3B82F6", emoji: "🗼" },
      6: { name: "Ultimate Modern Wonders", color: "#EC4899", emoji: "🌟" }
    };
    return info[tier as keyof typeof info] || { name: "Unknown", color: "#8B5CF6", emoji: "🏛️" };
  };
  
  const canAffordWonder = (wonder: Wonder) => {
    return gameState.credits >= wonder.cost;
  };
  
  const handleBuildWonder = (wonder: Wonder) => {
    if (!canAffordWonder(wonder)) {
      Alert.alert('Cannot Build', 'Not enough credits to build this wonder.');
      return;
    }
    
    Alert.alert(
      'Build Wonder',
      `Build ${wonder.name} for ${formatNumber(wonder.cost)} Earon? This will generate ${formatNumber(wonder.income)} Earon/sec.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Build', 
          onPress: () => {
            // TODO: Implement wonder building logic in game store
            Alert.alert('Wonder Built!', `${wonder.name} has been constructed and is now generating income!`);
          }
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
            <Crown size={32} color="#F59E0B" />
          </LinearGradient>
          <Text style={styles.headerTitle}>World Wonders</Text>
          <Text style={styles.headerSubtitle}>Build iconic landmarks from around the world</Text>
        </View>
        
        {/* Tier Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tierSelector}>
          {[1, 2, 3, 4, 5, 6].map(tier => {
            const tierInfo = getTierInfo(tier);
            const isSelected = tier === selectedTier;
            const availableCount = getAvailableWonders(tier).length;
            const totalCount = WORLD_WONDERS.filter(w => w.tier === tier).length;
            
            return (
              <TouchableOpacity
                key={tier}
                style={[
                  styles.tierCard,
                  isSelected && styles.selectedTierCard,
                  { borderColor: tierInfo.color }
                ]}
                onPress={() => setSelectedTier(tier)}
              >
                <Text style={styles.tierEmoji}>{tierInfo.emoji}</Text>
                <Text style={styles.tierName}>Tier {tier}</Text>
                <Text style={styles.tierTitle}>{tierInfo.name}</Text>
                <Text style={styles.tierCount}>{availableCount}/{totalCount}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
        {/* Available Wonders */}
        <View style={styles.wondersList}>
          <Text style={styles.sectionTitle}>Available Wonders</Text>
          {getAvailableWonders(selectedTier).map(wonder => (
            <TouchableOpacity
              key={wonder.id}
              style={[
                styles.wonderCard,
                !canAffordWonder(wonder) && styles.disabledWonderCard
              ]}
              onPress={() => handleBuildWonder(wonder)}
              disabled={!canAffordWonder(wonder)}
            >
              <View style={styles.wonderHeader}>
                <Text style={styles.wonderEmoji}>{wonder.emoji}</Text>
                <View style={styles.wonderInfo}>
                  <Text style={styles.wonderName}>{wonder.name}</Text>
                  <Text style={styles.wonderLocation}>{wonder.location}</Text>
                  <Text style={styles.wonderDescription}>{wonder.description}</Text>
                </View>
                <View style={styles.wonderStats}>
                  <View style={styles.costContainer}>
                    <EaronSymbol size="small" />
                    <Text style={styles.wonderCost}>{formatNumber(wonder.cost)}</Text>
                  </View>
                  <Text style={styles.wonderIncome}>+{formatNumber(wonder.income)}/s</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
          {getAvailableWonders(selectedTier).length === 0 && (
            <View style={styles.emptyState}>
              <Lock size={32} color="#6B7280" />
              <Text style={styles.emptyStateText}>No wonders available in this tier yet</Text>
              <Text style={styles.emptyStateSubtext}>Keep expanding your land to unlock more wonders!</Text>
            </View>
          )}
        </View>
        
        {/* Locked Wonders Preview */}
        {getLockedWonders(selectedTier).length > 0 && (
          <View style={styles.wondersList}>
            <Text style={styles.sectionTitle}>Coming Soon</Text>
            {getLockedWonders(selectedTier).slice(0, 3).map(wonder => (
              <View key={wonder.id} style={[styles.wonderCard, styles.lockedWonderCard]}>
                <View style={styles.wonderHeader}>
                  <Text style={styles.wonderEmoji}>{wonder.emoji}</Text>
                  <View style={styles.wonderInfo}>
                    <Text style={styles.wonderName}>{wonder.name}</Text>
                    <Text style={styles.wonderLocation}>{wonder.location}</Text>
                    <Text style={styles.wonderDescription}>{wonder.description}</Text>
                  </View>
                  <View style={styles.wonderStats}>
                    <Text style={styles.unlockRequirement}>
                      Unlock at {formatNumber(wonder.unlockRequirement)} m²
                    </Text>
                  </View>
                </View>
              </View>
            ))}
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
  tierSelector: {
    marginBottom: 20,
  },
  tierCard: {
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    minWidth: 120,
  },
  selectedTierCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  tierEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  tierName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  tierTitle: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  tierCount: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '600',
  },
  wondersList: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  wonderCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  disabledWonderCard: {
    backgroundColor: 'rgba(107, 114, 128, 0.05)',
    borderColor: 'rgba(107, 114, 128, 0.2)',
    opacity: 0.6,
  },
  lockedWonderCard: {
    backgroundColor: 'rgba(107, 114, 128, 0.05)',
    borderColor: 'rgba(107, 114, 128, 0.2)',
    opacity: 0.7,
  },
  wonderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wonderEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  wonderInfo: {
    flex: 1,
  },
  wonderName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  wonderLocation: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  wonderDescription: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  wonderStats: {
    alignItems: 'flex-end',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  wonderCost: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  wonderIncome: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  unlockRequirement: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
});
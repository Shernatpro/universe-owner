import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings as SettingsIcon, RotateCcw, Save, Info, Globe } from 'lucide-react-native';
import { useGameStore } from '@/hooks/useGameStore';

export default function SettingsScreen() {
  const { gameState, resetGame, saveGameState } = useGameStore();

  const handleResetGame = () => {
    Alert.alert(
      'Reset Game',
      'Are you sure you want to reset all progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            resetGame();
            Alert.alert('Game Reset', 'Your progress has been reset to the beginning.');
          }
        }
      ]
    );
  };

  const handleSaveGame = () => {
    saveGameState();
    Alert.alert('Game Saved', 'Your progress has been saved.');
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  const formatArea = (squareMeters: number) => {
    if (squareMeters >= 1000000) return (squareMeters / 1000000).toFixed(1) + ' km²';
    return formatNumber(squareMeters) + ' m²';
  };

  const earthOwnershipPercentage = (gameState.totalLandOwned / 148940000000000) * 100;

  return (
    <LinearGradient colors={['#0F0C29', '#24243e', '#302B63']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <SettingsIcon size={32} color="#F59E0B" />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Game Stats Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Earth Empire Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Credits:</Text>
              <Text style={styles.summaryValue}>{formatNumber(gameState.credits)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Clicks:</Text>
              <Text style={styles.summaryValue}>{formatNumber(gameState.totalClicks)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Land Owned:</Text>
              <Text style={styles.summaryValue}>{formatArea(gameState.totalLandOwned)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Earth Ownership:</Text>
              <Text style={styles.summaryValue}>{earthOwnershipPercentage.toFixed(6)}%</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Credits per Second:</Text>
              <Text style={styles.summaryValue}>{formatNumber(gameState.creditsPerSecond)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Next m² Cost:</Text>
              <Text style={styles.summaryValue}>{formatNumber(gameState.nextLandCost)}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleSaveGame}>
            <Save size={24} color="#10B981" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Save Game</Text>
              <Text style={styles.actionDescription}>Manually save your current progress</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleResetGame}>
            <RotateCcw size={24} color="#EF4444" />
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, styles.dangerText]}>Reset Game</Text>
              <Text style={styles.actionDescription}>Start over from the beginning</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Game Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoCard}>
            <Globe size={24} color="#8B5CF6" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Universe Owner v1.0</Text>
              <Text style={styles.infoDescription}>
                Build your cosmic real estate empire by purchasing land across the Universe! Start with Earon Credits and work your way to owning entire planets and galaxies.
              </Text>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Tips</Text>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              • Your game automatically saves every 5 seconds
            </Text>
            <Text style={styles.tipText}>
              • Each square meter costs 500 Earon, increasing by 0.1% per purchase
            </Text>
            <Text style={styles.tipText}>
              • Premium land areas offer bulk purchases with bonus income
            </Text>
            <Text style={styles.tipText}>
              • Upgrades can boost your click power, income, or reduce costs
            </Text>
            <Text style={styles.tipText}>
              • Pinch to zoom and drag to rotate the Earth for better exploration
            </Text>
            <Text style={styles.tipText}>
              • Earth's total surface area is 150 million km² - can you own it all?
            </Text>
          </View>
        </View>
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
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryStats: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  summaryValue: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  actionTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dangerText: {
    color: '#EF4444',
  },
  actionDescription: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  infoTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  tipText: {
    color: '#E5E7EB',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
});
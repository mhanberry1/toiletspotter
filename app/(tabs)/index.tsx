import { StyleSheet, Platform, View } from 'react-native';

import { Map } from '@/components/Map';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Toilet Spotter</ThemedText>
      </ThemedView>
      
      <Map style={styles.map} />
      
      <ThemedView style={styles.infoContainer}>
        <ThemedText type="subtitle">Find toilets near you</ThemedText>
        <ThemedText>
          This map shows your current location. Soon you'll be able to see nearby toilets.
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  map: {
    height: 400,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  infoContainer: {
    gap: 8,
  },
});

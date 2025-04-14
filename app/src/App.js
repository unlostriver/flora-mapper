import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Mapbox, {MapView} from "@rnmapbox/maps"
import { useEffect } from 'react';
import "dotenv/config"

Mapbox.setAccessToken(process.env.MAPBOX_PUBLIC_TOKEN)

export default function App() {
    useEffect(() => {
        Mapbox.setTelemetryEnabled(false)
    }, [])

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text className="bg-red-100">Open up App.js to start working on your app!</Text>
      <MapView style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
    map: {
        flex: 1,
        backgroundColor: "red",
        width: 500,
        height: 500
    }
});

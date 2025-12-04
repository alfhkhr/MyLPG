import { MaterialIcons } from "@expo/vector-icons"; // Tambah MaterialIcons
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

type gasTypes = "3 Kg" | "5,5 Kg" | "12 Kg" | "50 Kg";

const gasData: Record<gasTypes, { image: any }> = {
  "3 Kg": { image: require("../../assets/gas/3kg.png") },
  "5,5 Kg": { image: require("../../assets/gas/55kg.png") },
  "12 Kg": { image: require("../../assets/gas/12kg_2.png") },
  "50 Kg": { image: require("../../assets/gas/50kg.png") },
};

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBjw7e84DQh2iegRoPNAosJYqbvkYfQbik",
  authDomain: "gassin-22676.firebaseapp.com",
  databaseURL: "https://gassin-22676-default-rtdb.firebaseio.com",
  projectId: "gassin-22676",
  storageBucket: "gassin-22676.firebasestorage.app",
  messagingSenderId: "280832197322",
  appId: "1:280832197322:web:dea99bc657e10d75b12a33",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function HomeScreen() {
  const router = useRouter();
  const [agents, setAgents] = useState<any[]>([]);
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    const refAgents = ref(db, "/agents");
    onValue(refAgents, (snapshot) => {
      const data = snapshot.val() || {};
      const agentsList = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
        gasList: data[key].gasTypes ? Object.keys(data[key].gasTypes) : [],
      }));
      setAgents(agentsList);
    });
  }, []);

  // Fungsi untuk arahkan map ke marker
  const goToMarker = (coordinates: string) => {
    if (!webviewRef.current) return;
    const [lat, lng] = coordinates.split(",").map(Number);
    const jsCode = `
    if (window.focusOnMarker) {
     window.focusOnMarker(${lat}, ${lng});
     }
     true;
     `;
    webviewRef.current.injectJavaScript(jsCode);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <WebView
          ref={webviewRef}
          style={styles.webview}
          source={require("../../assets/html/map.html")}
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/forminputlocation")}
        >
          <MaterialIcons name="add-location-alt" size={28} color="#03045E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 40 }}
      >
        {agents.map((station) => (
          <TouchableOpacity
            key={station.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => goToMarker(station.coordinates)}
          >
            <View style={styles.cardHeader}>
              <MaterialIcons name="storefront" size={24} color="#03045E" />
              <Text style={styles.name} numberOfLines={1}>
                {station.name}
              </Text>
            </View>

            <View style={styles.infoWrapper}>
              <MaterialIcons name="location-on" size={20} color="#03045E" />
              <Text style={styles.address} numberOfLines={2}>
                {station.address}
              </Text>
            </View>

            <View style={styles.infoWrapper}>
              <MaterialIcons name="access-time" size={20} color="#03045E" />
              <Text style={styles.info}>
                Buka: {station.openTime} - Tutup: {station.closeTime}
              </Text>
            </View>

            <View style={styles.divider} />
            <Text style={styles.gasListTitle}>Ketersediaan Gas:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gasListContainer}
            >
              {station.gasList.map((gas: string, idx: number) => {
                const gasInfoFromDB = station.gasTypes?.[gas];
                if (!gasInfoFromDB) return null;
                return (
                  <View key={idx} style={styles.gasBox}>
                    <View style={styles.gasCircle}>
                    <Image
                      source={gasData[gas as gasTypes].image} // <- pakai gasData
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                    </View>
                    <Text style={styles.gasPrice}>{gasInfoFromDB.price}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
    backgroundColor: "#F4F7F9",
  },
  mapContainer: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.58,
    backgroundColor: "#03045E",
  },
  webview: {
    flex: 1,
    borderRadius: 18,
  },
  fab: {
    position: "absolute",
    width: 55,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    right: 25,
    bottom: 25,
    backgroundColor: "#FDE047",
    borderRadius: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginBottom:-18,
  },
  list: {
    height: SCREEN_HEIGHT * 0.7,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#03045E",
  },
  card: {
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: "#E0F7FA",
    borderRadius: 16,
    padding: 20,
    marginRight: 20,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 25,
    fontWeight: "800",
    color: "#03045E",
  },
  infoWrapper: {
    flexDirection: "row",
    marginBottom: 10,
  },
  address: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    flexShrink: 1,
  },
  info: {
    fontSize: 14,
    color: "#333",
    marginRight:10,
  },

  divider: {
    height: 1,
    backgroundColor: "#03045E",
    marginVertical: 5,
  },

  gasListTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#03045E",
  },
  gasListContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  gasBox: {
    flexDirection: "column",
    alignItems: "center",
    marginRight: 15,
  },
  gasCircle: {
    width: 55,
    height: 55,
    borderRadius: 10,
    backgroundColor: "#FFFAF0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: -12,
    borderWidth: 1,
    borderColor: "#FDE047", // Border kuning
  },
});

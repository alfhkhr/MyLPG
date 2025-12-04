import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

type gasTypes = "3 Kg" | "12 Kg" | "50 Kg" | "5,5 Kg";

const gasData: Record<gasTypes, { image: any }> = {
  "3 Kg": {
    image: require("../../assets/gas/3kg.png"),
  },
  "5,5 Kg": {
    image: require("../../assets/gas/55kg.png"),
  },
  "12 Kg": {
    image: require("../../assets/gas/12kg_2.png"),
  },
  "50 Kg": {
    image: require("../../assets/gas/50kg.png"),
  },
};

// Daftar Filter Gas
const GAS_FILTERS = ["Semua", "3 Kg", "5,5 Kg", "12 Kg", "50 Kg"];

// Firebase
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

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 10) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
};

export default function HomeScreen() {
  const router = useRouter();
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("Semua");
  const filterScrollRef = useRef<ScrollView | null>(null);

  const [userLocation, setUserLocation] = useState<string>("Mencari lokasi...");
  const greeting = getGreeting();

  // Ambil Lokasi
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setUserLocation("Izin lokasi ditolak");
        return;
      }

      try {
        let loc = await Location.getCurrentPositionAsync({});
        const address = await Location.reverseGeocodeAsync(loc.coords);

        if (address.length > 0) {
          const a = address[0];

          const street = a.street || "";
          const subdistrict = a.subregion || a.subdistrict || "";
          const city = a.city || a.district || "";

          const finalLocation = street
            ? `${street}, ${subdistrict}`
            : subdistrict
            ? `${subdistrict}, ${city}`
            : city
            ? city
            : "Lokasi tidak ditemukan";

          setUserLocation(finalLocation);
        } else {
          setUserLocation("Lokasi tidak ditemukan");
        }
      } catch (e) {
        console.error("Gagal mendapatkan lokasi:", e);
        setUserLocation("Lokasi tidak ditemukan");
      }
    })();
  }, []);

  // Fetch realtime DB
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

  // Filter agen berdasarkan selectedFilter
  const filteredAgents =
    selectedFilter === "Semua"
      ? agents
      : agents.filter((item) => item.gasList.includes(selectedFilter));

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#FFFFFF", dark: "#03045E" }}
      headerImage={<View style={{ height: 0 }} />}
    >
      <View style={styles.welcomeContainer}>
        <ThemedText style={styles.welcomeTitle}>Selamat Datang! 👋</ThemedText>
        <ThemedText style={styles.greetingText}>{greeting}</ThemedText>
      </View>

      <View style={styles.locationSection}>
        <ThemedView style={styles.locationWrapper}>
          <MaterialIcons name="location-on" size={18} color="#03045E" />
          <ThemedText style={styles.locationText} numberOfLines={1}>
            {userLocation}
          </ThemedText>
        </ThemedView>
      </View>

      <ThemedView style={styles.infoWrapper}>
        <ThemedText style={styles.infoTitle}>
          MY LPG Siap Melayani Anda! 🚀
        </ThemedText>
        <ThemedText style={styles.infoDesc}>
          MY LPG membantu Anda menemukan agen gas resmi terdekat secara
          real-time dan mengecek ketersediaan serta harga LPG rumah tangga.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.searchWrapper}>
        <MaterialIcons
          name="location-pin"
          size={26}
          color="#03045E"
          style={{ marginRight: 10 }}
        />
        <ThemedText style={styles.searchText}>
          Cari agen gas terdekat
        </ThemedText>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => router.push("/mapwebview")}
        >
          <ThemedText style={styles.searchButtonText}>Cari Agen</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedText style={styles.sectionTitleFilter}>
        Filter Berdasarkan Jenis Gas
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true} // <-- DIKEMBALIKAN: True untuk menampilkan scroll indicator
        contentContainerStyle={styles.filterContainer}
      >
        {GAS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <ThemedText
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ThemedText style={styles.sectionTitleAgen}>Stok Agen Terdekat</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.agentListContainer}
      >
        {filteredAgents.length > 0 ? (
          filteredAgents.map((station) => (
            <ThemedView key={station.id} style={styles.cardHorizontal}>
              <View style={styles.agentHeader}>
                <MaterialIcons name="storefront" size={26} color="#03045E" />
                <ThemedText style={styles.agentTitle} numberOfLines={1}>
                  {station.name}
                </ThemedText>
              </View>

              <ThemedText style={styles.agentAddress} numberOfLines={2}>
                {station.address}
              </ThemedText>

              <ThemedText style={styles.agentHours}>
                ⏰ Buka: {station.openTime} - Tutup: {station.closeTime}
              </ThemedText>

              <View style={styles.separator} />

              <ThemedText style={styles.listTitle}>Stok Tersedia:</ThemedText>
              <View style={styles.listContainer}>
                {station.gasList.map((gas: string, index: number) => {
                  const priceFromDB = station.gasTypes?.[gas]; // Ambil harga langsung dari DB
                  if (!priceFromDB) return null;

                  return (
                    <View key={index} style={styles.gasBox}>
                    <Image
                      source={gasData[gas as gasTypes].image}
                      style={styles.gasImage}
                      contentFit="contain"
                    />
                  </View>
                  );
                })}
              </View>
            </ThemedView>
          ))
        ) : (
          <ThemedText style={styles.noAgentText}>
            Tidak ada agen yang ditemukan untuk filter **{selectedFilter}**.
          </ThemedText>
        )}
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  welcomeContainer: {
    marginTop: 20, 
    paddingHorizontal: 10,
  },
  welcomeTitle: {
    fontSize: 35,
    fontWeight: "900",
    color: "#FDE047",
    marginBottom: 10, 
    paddingTop: 10,
    paddingBottom: 5, 
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },

  locationSection: {
    paddingHorizontal: 10,
    marginTop: 10, 
    marginBottom: 8, 
  },
  locationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F7FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
    maxWidth: SCREEN_WIDTH - 40,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#03045E",
    fontWeight: "500",
    flexShrink: 1,
  },

  infoWrapper: {
    marginHorizontal: 10,
    marginTop: 10,
    padding: 18,
    borderRadius: 15,
    backgroundColor: "#E0F7FA", 
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#03045E",
    marginBottom: 6,
  },
  infoDesc: {
    fontSize: 15,
    color: "#333",
    lineHeight: 18,
  },

  searchWrapper: {
    flexDirection: "row",
    backgroundColor: "#E0F7FA",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 20,
    elevation: 4,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    color: "#03045E",
    fontWeight: "600",
  },
  searchButton: {
    backgroundColor: "#FDE047",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },

  sectionTitleFilter: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginTop: 10,
    marginBottom: 5, 
    paddingHorizontal: 10,
  },
  filterContainer: {
    paddingHorizontal: 10,
    marginBottom: 5, 
  },
  filterButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#B3E5FC",
  },
  filterButtonActive: {
    backgroundColor: "#FDE047", 
    borderColor: "#FDE047",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#03045E",
  },
  filterTextActive: {
    color: "#000", 
  },

  sectionTitleAgen: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginTop: 10, 
    marginBottom: 8, 
    paddingHorizontal: 10,
  },

  agentListContainer: {
    paddingHorizontal: 10,
    paddingBottom: 15, 
  },
  cardHorizontal: {
    width: SCREEN_WIDTH - 55,
    backgroundColor: "#E0F7FA", 
    padding: 12,
    borderRadius: 15,
    marginRight: 15,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#B3E5FC",
  },
  agentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  agentTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: "#03045E",
    marginLeft: 10,
  },
  agentAddress: {
    paddingLeft: 5,
    marginTop: 3,
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  agentHours: {
    paddingLeft: 5,
    marginTop: 10,
    fontSize: 15,
    color: "#555",
    fontWeight: "600",
    paddingBottom:5,
  },
  separator: {
    paddingLeft: 5,
    height: 1,
    backgroundColor: "#B3E5FC",
    marginVertical: 15,
  },
  listTitle: {
    paddingLeft: 5,
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  listContainer: {
    flexDirection: "row",
    gap: 8,
  },
  gasBox: {
    paddingLeft: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FDE047",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#FFFBEB",
    width: 80,
    height: 80,
    justifyContent: "space-between",
  },
  gasImage: {
    width: 60,
    height: 60,
  },
  noAgentText: {
    paddingLeft: 10,
    fontSize: 16,
    color: "#888",
  },
});
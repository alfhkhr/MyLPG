import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, remove } from "firebase/database";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// Firebase config
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

export default function LokasiScreen() {
  const router = useRouter();
  const [sections, setSections] = useState<{ title: string; data: any[] }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handlePress = (coordinates: string) => {
    if (!coordinates) return;
    const [latitude, longitude] = coordinates
      .split(",")
      .map((coord) => coord.trim());
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Hapus Lokasi",
      "Apakah Anda yakin ingin menghapus lokasi ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => remove(ref(db, `agents/${id}`)),
        },
      ]
    );
  };

  const handleEdit = (item: any) => {
    router.push({
      pathname: "/formeditlocation",
      params: {
        id: item.id,
        name: item.name || "",
        address: item.address || "",
        openTime: item.openTime || "",
        closeTime: item.closeTime || "",
        coordinates: item.coordinates || "",
        accuration: item.accuration || "",
        gasTypes: item.gasTypes || {},
      },
    });
  };

  useEffect(() => {
    const agentsRef = ref(db, "agents/");
    const unsubscribe = onValue(
      agentsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const agentsArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
            gasList: data[key].gasTypes
              ? Object.keys(data[key].gasTypes).filter(
                  (k) => data[key].gasTypes[k]
                )
              : [],
          }));
          setSections([{ title: "Lokasi Tersimpan", data: agentsArray }]);
        } else {
          setSections([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      {sections.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                <ThemedText style={styles.itemText}>{item.address}</ThemedText>

                <ThemedText style={styles.itemText}>
                  Jam: {item.openTime || "-"} s/d {item.closeTime || "-"}
                </ThemedText>

                <ThemedText style={styles.itemText}>
                  {item.coordinates} ({item.accuration})
                </ThemedText>

                <View style={styles.badgeRow}>
                  {item.gasList.length > 0 ? (
                    item.gasList.map((gas) => (
                      <View key={gas} style={styles.badge}>
                        <ThemedText style={styles.badgeText}>{gas}</ThemedText>
                      </View>
                    ))
                  ) : (
                    <View style={styles.badge}>
                      <ThemedText style={styles.badgeText}>-</ThemedText>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => handlePress(item.coordinates)}
                  style={styles.mapButton}
                >
                  <MaterialIcons name="map" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleEdit(item)}
                  style={styles.editButton}
                >
                  <MaterialIcons
                    name="mode-edit-outline"
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  style={styles.deleteButton}
                >
                  <MaterialIcons name="delete-sweep" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <ThemedText style={styles.header}>{title}</ThemedText>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={{ color: "#fff" }}>
            Tidak ada data lokasi tersimpan.
          </ThemedText>
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#03045E" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "#E0F7FA",
    color: "#03045E",
    padding: 12,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E0F7FA",
    marginHorizontal: 12,
    marginVertical: 12,
    padding: 18,
    borderRadius: 25,
  },
  itemName: {
    fontSize: 25,
    fontWeight: "800",
    color: "#03045E",
    marginLeft: 10,
  },
  itemText: {
    paddingLeft: 5,
    marginTop: 3,
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  badge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  badgeText: { color: "#000", fontSize: 12 },
  actionButtons: { justifyContent: "space-between", alignItems: "center" },
  mapButton: {
    backgroundColor: "#00b894",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: "#fbbf24",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  deleteButton: { backgroundColor: "#ef4444", padding: 8, borderRadius: 8 },
});

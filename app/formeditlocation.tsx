import * as Location from "expo-location";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { getApps, initializeApp } from "firebase/app";
import { getDatabase, onValue, push, ref, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

type GasKey = "3 Kg" | "12 Kg" | "50 Kg" | "5,5 Kg";
const defaultGasTypes: Record<GasKey, boolean> = {
  "3 Kg": false,
  "12 Kg": false,
  "50 Kg": false,
  "5,5 Kg": false,
};

const App = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;

  // Firebase setup
  const firebaseConfig = {
    apiKey: "AIzaSyBjw7e84DQh2iegRoPNAosJYqbvkYfQbik",
    authDomain: "gassin-22676.firebaseapp.com",
    databaseURL: "https://gassin-22676-default-rtdb.firebaseio.com",
    projectId: "gassin-22676",
    storageBucket: "gassin-22676.firebasestorage.app",
    messagingSenderId: "280832197322",
    appId: "1:280832197322:web:dea99bc657e10d75b12a33",
  };

  let app;
  try {
    app = initializeApp(firebaseConfig);
  } catch (error: any) {
    if (error.code === "app/duplicate-app") {
      app = getApps()[0];
    } else throw error;
  }
  const db = getDatabase(app);

  // State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [accuration, setAccuration] = useState("");
  const [gasTypes, setGasTypes] = useState<Record<GasKey, boolean>>({
    ...defaultGasTypes,
  });

  const toggleGas = (key: GasKey) => {
    setGasTypes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (!id) return;
    const agentRef = ref(db, `agents/${id}`);
    onValue(agentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setName(data.name || "");
        setAddress(data.address || "");
        setOpenTime(data.openTime || "");
        setCloseTime(data.closeTime || "");
        setCoordinates(data.coordinates || "");
        setAccuration(data.accuration || "");
        if (data.gasTypes) {
          setGasTypes({
            "3 Kg": !!data.gasTypes["3 Kg"],
            "12 Kg": !!data.gasTypes["12 Kg"],
            "50 Kg": !!data.gasTypes["50 Kg"],
            "5,5 Kg": !!data.gasTypes["5,5 Kg"],
          });
        }
      }
    });
  }, [id]);

  const getCoordinates = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin lokasi ditolak");
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setCoordinates(`${loc.coords.latitude},${loc.coords.longitude}`);
    setAccuration(`${loc.coords.accuracy} m`);
  };

  const saveData = () => {
    const selectedGas = (Object.keys(gasTypes) as GasKey[]).filter(
      (k) => gasTypes[k]
    );
    if (!name || !address || selectedGas.length === 0) {
      Alert.alert("Error", "Isi nama, alamat, dan pilih minimal 1 gas");
      return;
    }

    const data = {
      name,
      address,
      gasTypes,
      openTime,
      closeTime,
      coordinates,
      accuration,
    };

    if (id) {
      const agentRef = ref(db, `agents/${id}`);
      update(agentRef, data)
        .then(() =>
          Alert.alert("Berhasil", "Data diperbarui", [
            { text: "OK", onPress: () => router.back() },
          ])
        )
        .catch(() => Alert.alert("Gagal", "Tidak bisa memperbarui data"));
    } else {
      push(ref(db, "agents/"), data)
        .then(() =>
          Alert.alert("Berhasil", "Data tersimpan", [
            { text: "OK", onPress: () => router.back() },
          ])
        )
        .catch(() => Alert.alert("Gagal", "Tidak bisa menyimpan data"));
    }
  };

  const renderSelectedGasBadges = () =>
    Object.keys(gasTypes)
      .filter((k) => gasTypes[k as GasKey])
      .map((k) => (
        <View key={k} style={styles.badge}>
          <Text style={styles.badgeText}>{k}</Text>
        </View>
      ));

  return (
    <SafeAreaProvider style={{ backgroundColor: "#03045E", flex: 1 }}>
      <SafeAreaView>
        <Stack.Screen
          options={{ title: id ? "Edit Agen Gas" : "Input Agen Gas" }}
        />
        <ScrollView contentContainerStyle={{ padding: 12 }}>
          <View style={styles.card}>
            <Text style={styles.label}>Nama Agen</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Masukkan nama agen"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Alamat</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Alamat lengkap"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Jam Operasional</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                style={[styles.input, { marginRight: 12 }]}
                value={openTime}
                onChangeText={setOpenTime}
                placeholder="08:00"
              />
              <Text style={styles.textItem}>s/d</Text>
              <TextInput
                style={[styles.input, { marginLeft: 12 }]}
                value={closeTime}
                onChangeText={setCloseTime}
                placeholder="21:00"
              />
            </View>
          </View>

          {/* Koordinat Manual + Get Current */}
                    <View style={styles.card}>
                      <Text style={styles.label}>Koordinat</Text>
          
                      <TextInput
                        style={styles.input}
                        value={coordinates}
                        onChangeText={setCoordinates}
                        placeholder="contoh: -7.123,110.123 (manual)"
                      />
          
                      <Text style={styles.itemText}>
                        {accuration ? `Akurasi: ${accuration}` : ""}
                      </Text>
          
                      <View style={{ borderRadius: 15, overflow: "hidden" }}>
                        <Button
                          title="Get Current Location"
                          onPress={getCoordinates}
                          color="#FDE047"
                        />
                      </View>
                    </View>

           {/* Gas Tersedia */}
                    <View style={styles.card}>
                      <Text style={styles.label}>Gas Tersedia</Text>
          
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ marginTop: 6 }}
                      >
                        {(Object.keys(gasTypes) as GasKey[]).map((key) => (
                          <TouchableOpacity
                            key={key}
                            onPress={() => toggleGas(key)}
                            activeOpacity={0.7}
                            style={[
                              styles.badge,
                              gasTypes[key]
                                ? styles.badgeSelected
                                : styles.badgeUnselected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeText,
                                gasTypes[key]
                                  ? styles.badgeTextSelected
                                  : styles.badgeTextUnselected,
                              ]}
                            >
                              {key}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

          <View style={{ margin: 12, borderRadius: 15, overflow: "hidden" }}>
            <Button
              title={id ? "Update" : "Simpan"}
              onPress={saveData}
              color="#FDE047"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#E0F7FA",
    marginTop: 15,
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 15,
    marginVertical: 5,
  },
    label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#03045E",
    marginBottom: 6
    },
  input: {
    borderRadius: 8,
    fontWeight: "500",
    paddingVertical: 6,
    backgroundColor: "#E0F7FA",
    color: "#03045E",
  },
  itemText: { fontSize: 14, color: "#000", marginBottom: 6, fontWeight: "500" },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeSelected: {
    backgroundColor: "#FDE047",
    borderWidth: 1,
    borderColor: "#FBC02D",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeUnselected: {
    backgroundColor: "#E0E0E0",
    borderWidth: 1,
    borderColor: "#BDBDBD",
  },
  badgeText: { fontSize: 14 },
  badgeTextSelected: { color: "#000", fontWeight: "600" },
  badgeTextUnselected: { color: "#555", fontWeight: "500" },
  textItem: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginHorizontal: 4,
  },
});

export default App;

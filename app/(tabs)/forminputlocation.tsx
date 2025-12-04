import * as Location from "expo-location";
import { Stack, useRouter } from "expo-router";
import { initializeApp } from "firebase/app";
import { getDatabase, push, ref } from "firebase/database";
import React, { useState } from "react";
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

type GasKey = "3 Kg" | "5,5 Kg" | "12 Kg" | "50 Kg";

const App = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");

  // Gas Types
  const [gasTypes, setGasTypes] = useState<Record<GasKey, boolean>>({
    "3 Kg": false,
    "12 Kg": false,
    "50 Kg": false,
    "5,5 Kg": false,
  });

  const toggleGas = (key: GasKey) =>
    setGasTypes((prev) => ({ ...prev, [key]: !prev[key] }));

  // Coordinates (manual + auto)
  const [coordinates, setCoordinates] = useState("");
  const [accuration, setAccuration] = useState("");

  const getCoordinates = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin lokasi ditolak");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setCoordinates(`${loc.coords.latitude},${loc.coords.longitude}`);
    setAccuration(`${loc.coords.accuracy} m`);
  };

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

  // RESET FORM
  const resetForm = () => {
    setName("");
    setAddress("");
    setOpenTime("");
    setCloseTime("");
    setCoordinates("");
    setAccuration("");

    setGasTypes({
      "3 Kg": false,
      "12 Kg": false,
      "50 Kg": false,
      "5,5 Kg": false,
    });
  };

  // Save Data
  const saveData = () => {
    const selectedGas = (Object.keys(gasTypes) as GasKey[]).filter(
      (k) => gasTypes[k]
    );

    if (!name || !address || selectedGas.length === 0) {
      Alert.alert("Error", "Isi nama, alamat, dan pilih minimal 1 gas");
      return;
    }

    push(ref(db, "agents/"), {
      name,
      address,
      gasTypes,
      openTime,
      closeTime,
      coordinates,
      accuration,
    })
      .then(() => {
        Alert.alert("Berhasil", "Data tersimpan", [
          {
            text: "OK",
            onPress: () => {
              resetForm(); // kosongkan
              router.push("/lokasi"); // pindah halaman
            },
          },
        ]);
      })
      .catch(() => Alert.alert("Gagal", "Tidak bisa menyimpan data"));
  };

  return (
    <SafeAreaProvider style={{ backgroundColor: "#03045E", flex: 1 }}>
      <SafeAreaView>
        <Stack.Screen options={{ title: "Input Agen Gas" }} />

        <ScrollView contentContainerStyle={{ padding: 12 }}>
          {/* Nama Agen */}
          <View style={styles.card}>
            <Text style={styles.label}>Nama Agen</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Masukkan nama agen"
            />
          </View>

          {/* Alamat */}
          <View style={styles.card}>
            <Text style={styles.label}>Alamat</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Alamat lengkap"
            />
          </View>

          {/* Jam Operasional */}
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

          {/* Tombol Simpan */}
          <View style={{ margin: 12, borderRadius: 15, overflow: "hidden" }}>
            <Button title="Simpan" onPress={saveData} color="#FDE047" />
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
    marginBottom: 6,
  },
  input: {
    borderRadius: 8,
    paddingVertical: 6,
    backgroundColor: "#E0F7FA",
    paddingHorizontal: 10,
    fontWeight: "500",
    color: "#03045E",
  },
  itemText: {
    fontSize: 16,
    color: "#000",
    marginVertical: 6,
    fontWeight: "500",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeSelected: {
    backgroundColor: "#FDE047",
    borderColor: "#FBC02D",
    borderWidth: 1,
  },
  badgeUnselected: {
    backgroundColor: "#E0E0E0",
    borderColor: "#BDBDBD",
    borderWidth: 1,
  },
  badgeText: { fontSize: 14 },
  badgeTextSelected: { color: "#000", fontWeight: "700" },
  badgeTextUnselected: { color: "#555", fontWeight: "600" },
  textItem: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    marginHorizontal: 4,
  },
});

export default App;

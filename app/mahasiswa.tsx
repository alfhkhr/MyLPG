import React from 'react';
import {StyleSheet, Text, View, SectionList, StatusBar} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { MaterialCommunityIcons } from '@expo/vector-icons';


const DATA = [
  {
    title: 'Kelas A',
    data: ['Myla','Angel','Cece', 'Fay', 'Nanda'],
  },
  {
    title: 'Kelas B',
    data: ['Alifah', 'Atika', 'Galuh', 'Zahra', 'Meiva', 'Zidni', 'Aul'],
  },
  {
    title: 'Asisten ',
    data: ['Hayyu', 'Veronica', 'Rini', 'Syaiful'],
  },
];

const App = () => (
  <SafeAreaProvider>
    <SafeAreaView style={styles.container} edges={['top']}>
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({item}) => (
          <View style={styles.item}>
                <Text
                    style={styles.title}>
                    <MaterialIcons size={28} name="people-outline" />
                
                    {' '}
                    {item} 
                    </Text>
          </View>
        )}
        renderSectionHeader={({section: {title}}) => (
          <Text style={styles.header}>{title}</Text>
        )}
      />
    </SafeAreaView>
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    marginHorizontal: 16,
  },
  item: {
    backgroundColor: '#dac2ffff',
    padding: 12,
      marginVertical: 0,
    borderRadius: 10,
  },
  header: {
    fontSize: 30,
      backgroundColor: '#a2aef5ff',
      fontWeight: '600',
      paddingLeft: 5,
      marginTop: 10,
  },
  title: {
    fontSize: 24,
  },
});

export default App;
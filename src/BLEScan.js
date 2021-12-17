import {BleManager} from 'react-native-ble-plx';
import React, {useState, useEffect, Component} from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  useColorScheme,
  StyleSheet,
  Appearance,
} from 'react-native';
import {PERMISSIONS, request} from 'react-native-permissions';
import * as Console from 'console';

class BLEScan extends Component {
  constructor() {
    super();
    this.manager = new BleManager();
    this.deviceId = '';
    this.state = {
      scanning: false,
      info: '',
    };
    this.deviceList = [];
    this.subscriptMonitor = null;
  }
  handleStart = async () => {
    if (!this.state.scanning) {
      this.setState({scanning: true});
      if (Platform.OS == 'ios') {
        this.manager.onStateChange(state => {
          if (state === 'PoweredOn') {
            this.scanAndConnect();
          }
        });
      } else {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            {
              title: 'Request for Location Permission',
              message:
                'Bluetooth Scanner requires access to Fine Location Permission',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted == PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Localtion permissions granted');
            this.scanAndConnect();
            return true;
          } else {
            console.log('Location permission denied');
            return false;
          }
        } catch (error) {
          console.log(error.message);
          return false;
        }
      }
    } else {
      alert('Scan is already running');
    }
  };
  scanAndConnect() {
    this.manager.startDeviceScan(null, null, (error, device) => {
      this.info = 'Scanning..';
      if (error) {
        this.error(error.message);
        return;
      }
      var found = this.deviceList.some(item => item.name === device.name);
      if (!found) {
        let deviceName = device.name;
        if (deviceName && deviceName.includes('micro:bit')) {
          this.deviceList.push({name: device.name, id: device.id});
        }
      }
    });
  }
  async connectToDevice(item) {
    console.log('Connecting to device ' + item.name);
    this.setState({scanning: false});
    this.manager.stopDeviceScan();
    this.info('Connected to device ' + item.name);
    const {id} = await this.manager.connectToDevice(item.id);
    this.deviceList = [];

    const device =
      await this.manager.discoverAllServicesAndCharacteristicsForDevice(
        item.id,
      );
    const services = await device.services();
    const charPromises = services.map(service => service.characteristics());
    const characteristics = await Promise.all(
      charPromises.map(p => p.catch(e => console.log(e.message))),
    );
    const service = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
    const characteristic = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
    const data = await device.readCharacteristicForService(
      service,
      characteristic,
    );
  }
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View>
          <Text>Test</Text>
        </View>
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    //marginTop: StatusBar.currentHeight || 0,
  },
  title: {
    fontSize: 32,
  },
  itemStyle: {
    padding: 30,
    fontSize: 20,
  },
  buttonContainer: {},
});
export default BLEScan;

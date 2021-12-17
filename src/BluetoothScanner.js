/**
 *BLE Code from https://github.com/basukiwinoto/BluetoothScannerApp/blob/master/src/BluetoothScanner.js
 * Permission request for BLE from https://stackoverflow.com/questions/57114239/location-permission-on-ios-in-react-native-not-working/57114700
 * Flatlist code from: https://snack.expo.dev/embedded/@aboutreact/react-native-scroll-up-or-down-the-listview-on-the-click-of-button-?iframeId=lec6tn7bd&preview=true&platform=ios&theme=dark
 */
import React, {useState, useEffect} from 'react';
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
import {BleManager} from 'react-native-ble-plx';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {Colors} from 'react-native/Libraries/NewAppScreen';
export const manager = new BleManager();
const requestPermission = async () => {
  const granted = await request(
    Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ios: PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
    }),
    {
      title: 'Request for Location Permission',
      message: 'Bluetooth Scanner requires access to Fine Location Permission',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    },
  );
  return granted === RESULTS.GRANTED;
};

// BlueetoothScanner does:
// - scan bluetooth devices in the area
// - list the scanned devices
const BluetoothScanner = () => {
  const [logData, setLogData] = useState([]);
  const [logCount, setLogCount] = useState(0);
  const [scannedDevices, setScannedDevices] = useState({});
  const [deviceCount, setDeviceCount] = useState(0);

  /**
   *Check BLE stack status
   */
  useEffect(() => {
    manager.onStateChange(state => {
      const subscription = manager.onStateChange(async state => {
        console.log(state);
        const newLogData = logData;
        newLogData.push(state);
        await setLogCount(newLogData.length);
        await setLogData(newLogData);
        subscription.remove();
      }, true);
      return () => subscription.remove();
    });
  }, [manager]);
  /**
   * Separators between each item in device list
   * @returns {JSX.Element}
   * @constructor
   */
  const ItemSeparatorView = () => {
    return (
      <View
        style={{
          height: 0.5,
          width: '100%',
          backgroundColor: '#C8C8C8',
        }}
      />
    );
  };
  /**
   *View the actual device in the list
   * @param item
   * @returns {JSX.Element}
   * @constructor
   */
  const ItemView = ({item}) => {
    return (
      // Flat List Item
      <Text style={styles.itemStyle} onPress={() => connectDevice(item)}>
        {`${item.name} (${item.id})`}
      </Text>
    );
  };
  /**
   * Click on an item and connect
   * @param device
   */
  const connectDevice = async device => {
    // Function for click on an item
    manager.stopDeviceScan(); //Stop scanning for BLE-devices
    //this.manager.connectToDevice(device);
    //console.log(device.services());
    device
      .connect()
      .then(device => {
        return manager.discoverAllServicesAndCharacteristicsForDevice(
          device.id,
        );
      })
      .then(device => {
        // Do work on device with services and characteristics
        const services = device.services();
        const service = ''; //6e400001-b5a3-f393-e0a9-e50e24dcca9e
        const characteristic = ''; //6e400002-b5a3-f393-e0a9-e50e24dcca9e
        const data = device.readCharacteristicForService(
          service,
          characteristic,
        );
        console.log(services);
      })
      .catch(error => {
        // Handle errors
        alert('An error occurred while connecting to ' + device.name);
        console.log(error.message);
        throw error;
      });
  };
  /**
   * Method for scanning BLE-devices
   * @returns {Promise<boolean>}
   */
  const scanDevices = async () => {
    // explicitly ask for user's permission
    const permission = await requestPermission();
    if (permission) {
      manager.startDeviceScan(null, null, async (error, device) => {
        // error handling
        if (error) {
          console.log(error.message);
          return;
        }
        // found a bluetooth device
        if (device.name != null) {
          console.log(`${device.id} (${device.id})}`);
          const newScannedDevices = scannedDevices;
          newScannedDevices[device.id] = device;
          await setDeviceCount(Object.keys(newScannedDevices).length);
          await setScannedDevices(scannedDevices);
        }
        /*
        if (device.name === 'BBC mirco:bit[tuziv]') {
          // Stop scanning as it's not necessary if you are scanning for one device.
          manager.stopDeviceScan();

          // Proceed with connection.
          device
            .connect()
            .then(device => {
              return device.discoverAllServicesAndCharacteristics();
            })
            .then(device => {
              // Do work on device with services and characteristics
              console.log(device);
            })
            .catch(error => {
              // Handle errors
            });
        }*/
      });
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={Object.values(scannedDevices)}
        keyExtractor={(device, index) => index.toString()}
        ItemSeparatorComponent={ItemSeparatorView}
        renderItem={ItemView}
      />
      <View>
        <Button title="Scan Devices" onPress={scanDevices} />
      </View>
    </SafeAreaView>
  );
};

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
export default BluetoothScanner;

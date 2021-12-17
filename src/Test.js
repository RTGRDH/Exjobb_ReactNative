import React from 'react';
import {
  Button,
  FlatList,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {BleManager} from 'react-native-ble-plx';

class Test extends React.Component {
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
  ItemSeparatorView = () => {
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
  ItemView = ({item}) => {
    return (
      // Flat List Item
      <Text style={styles.itemStyle}>{`${item.name} (${item.id})`}</Text>
    );
  };
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
            console.log('Location permissions granted');
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
      console.log('Scanning...');
      if (error) {
        this.error(error.message);
        return;
      }
      var found = this.deviceList.some(item => item.name === device.name);
      if (!found) {
        let deviceName = device.name;
        if (deviceName != null) {
          this.deviceList.push({name: device.name, id: device.id});
          console.log('Added device: ' + device.name + ' to device list');
        }
      }
    });
  }
  function() {
    console.log(this.deviceList);
}
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={this.deviceList}
          //keyExtractor={item => item.name.toString()}
          ItemSeparatorComponent={this.ItemSeparatorView}
          renderItem={this.ItemView}
        />
        <View>
          <Button title="Scan Devices" onPress={this.handleStart} />
          <Button title="Test" onPress={this.function} />
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
export default Test;

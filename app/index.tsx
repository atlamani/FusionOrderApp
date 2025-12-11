import { useFonts } from "expo-font";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CustomButton } from './customButton';


export const HomeScreen = () => {
  const  [fontsLoaded] = useFonts ({
    "ConcertOne-Regular": require("../assets/Fonts/ConcertOne-Regular.ttf")
  });

  if (!fontsLoaded) {
    return null;
  }
  
  return(
    <View className="HOMESCREEN" style={styles.homeScreen}>
      <View className="Login-area" style={styles.loginArea}>
        <View className="content" style={styles.content}>
           <Text style={styles.text}>One Cart One Driver</Text>
          
        </View>

        <View className="ButtonArea" style={styles.buttonArea}>
          <CustomButton
            title="Login"
            href="/LoginScreen"
            onPress={() => console.log('Login pressed')}
            style={{ backgroundColor: 'rgba(79, 111, 82, 0.75)'}}
            textStyle={{ fontSize: 16 }}
          />

          <CustomButton
            title="Sign Up"
            href='/registerScreen'
            onPress={() => console.log('Signing Up')}
            style={{ backgroundColor: 'rgba(115, 144, 114, 0.50)'}}
            textStyle={{ fontSize: 16, width: 153 }}
          />

          <CustomButton
            title="Continue as Guest"
            href='/LoginScreen'
            onPress={() => console.log('Welcome Guest')}
            style={{ backgroundColor: 'rgba(115, 144, 114, 0.50)'}}
            textStyle={{ fontSize: 16, width: 156 }}
          />   
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create ({
  homeScreen: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 50,
    height: 932,
    width: 430,
    backgroundColor: '#ECE3CE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginArea: {
    display: 'flex',
    height: 629.01,
    padding: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexShrink: 0,
  },

  content: {
    display: 'flex',
    width: 350,
    height: 175,
    padding: 10,
    flexDirection: 'column',
    gap: 50,
    flexShrink: 0,
  },

  text: {
    width: 330,
    height: 320,
    flexShrink: 0,
    color: 'black',
    textAlign: 'center',
    fontFamily: 'ConcertOne-Regular',
    fontSize: 40,
    lineHeight: undefined,
  },

  buttonArea: {
    display: 'flex',
    width: 350,
    height: 220,
    padding: 10,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    flexShrink: 0,
  },
});

export default HomeScreen;

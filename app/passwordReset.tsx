import { useFonts } from "expo-font";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { CustomButton } from './customButton';
import { CustomInput } from "./customTextField";

export const PassResetScreen = () => {
    const [identifier, setIdentifier] = useState('');
    const canSubmit = identifier.trim().length > 0

    const  [fontsLoaded] = useFonts ({
            "ConcertOne-Regular": require("../assets/Fonts/ConcertOne-Regular.ttf")
        });
        
        if (!fontsLoaded) {
            return null;
        }

    const handleReset = () => {
        if (!canSubmit) return;
        Alert.alert('Request requested', 'We will send a reset link to: ${indentifier}');
    };

    return (
        <View className="RESETSCREEN" style={styles.resetScreen}>
            <View className="Frame" style={styles.frame}>
                <Text style={{
                    width: 110,
                    height: 50,
                    flexShrink: 0,
                    color: '#000',
                    textAlign: 'center',
                    fontFamily: 'ConcertOne-Regular',
                    fontSize: 40,
                }}>OOPS!</Text>
                <Text style={{
                    width: 200,
                    height: 18,
                    flexShrink: 0,
                    color: '#000',
                    textAlign: 'center',
                    fontFamily: 'ConcertOne-Regular',
                    fontSize: 16,
                }}>Please Reset Your Password</Text>
            </View>

            <View className="userInput" style={styles.userInput}>
                <Text style={{
                    width: 315,
                    height: 65,
                    flexShrink: 0,
                    fontFamily: 'ConcertOne-Regular',
                    fontSize: 14,
                }}>Please enter your phone number or email. Once you press submit, an email will be sent to you regarding a link to reset your password.</Text>
                
                <CustomInput
                    inputProps={{
                        placeholder: 'Phone Number or Email:',
                        keyboardType: 'default',
                        value: identifier,
                        onChangeText: setIdentifier,
                        autoCapitalize: 'none',
                    }}
                    containerStyle={styles.textField}
                                                
                />
            </View>

            <View className="Submit Area" style={styles.submitArea}>
                <Text style={{
                    width: 300,
                    height: 40,
                    flexShrink: 0,
                    fontFamily: 'ConcertOne-Regular',
                    fontSize: 14
                }}>Click “Submit” when you entered your information above.</Text>
                <CustomButton
                    title="Submit"
                    href='..'
                    onPress={handleReset}
                    disabled={!canSubmit}
                    style={{ backgroundColor: 'rgba(79, 111, 82, 0.75)', opacity: canSubmit ? 1 : 0.5 }}
                    textStyle={{ fontSize: 16, width: 153, height: 24, textAlign: 'center' }}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create ({
    resetScreen: {
        display: 'flex',
        width: 430,
        height: 932,
        paddingVertical: 100,
        paddingHorizontal: 40,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 75,
        borderRadius: 50,
        backgroundColor: '#ECE3CE',
    },

    frame: {
        display: 'flex',
        width: 215,
        height: 100,
        paddingHorizontal: 7,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
    },

    userInput: {
        display: 'flex',
        width: 350,
        height: 200,
        paddingVertical: 25,
        paddingHorizontal: 10,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
        flexShrink: 0,
    },

    textField:{
        display: 'flex',
        fontFamily: 'ConcertOne-Regular',
        height: 50,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 10,
        flexShrink: 0,
        alignSelf: 'stretch',
        borderRadius: 15,
        backgroundColor: '#4F6F52',
    },

    submitArea: {
        display: 'flex',
        width: 350,
        height: 125,
        paddingVertical: 12,
        paddingHorizontal: 0,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
    }
})

export default PassResetScreen;
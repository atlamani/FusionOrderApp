import { useFonts } from "expo-font";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { CustomButton } from './customButton';
import { CustomInput } from "./customTextField";

export const RegisterScreen = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const passwordMatch = password.trim().length > 0 && password === confirm;
    const allFilled =
        identifier.trim().length > 0 &&
        password.trim().length > 0 &&
        confirm.trim().length > 0;
    
    const canSubmit = allFilled && passwordMatch;
    const  [fontsLoaded] = useFonts ({
        "ConcertOne-Regular": require("../assets/Fonts/ConcertOne-Regular.ttf")
    });
        
    if (!fontsLoaded) {
        return null;
    }
    
    const handleSignUp = () => {
        if (!canSubmit) return;
        Alert.alert('Account created', 'Using: ${identifier}');
    };

    return (
        <View className="REGISTERSCREEN" style={styles.registerScreen}>
            <View className="BackFrame" style={styles.backFrame}>
                <CustomButton
                    title="<"
                    href=".."
                    onPress={() => console.log("Back pressed")}
                    style={styles.backButton}
                    textStyle={{ color: '#ECE3CE', height: 30, width: 30, fontSize: 24 }}
                />
            </View>

            <View className="content" style={styles.content}>
                <View className="textArea" style={styles.textArea}>
                    <Text style={{
                        height: 38,
                        width: 160,
                        alignSelf: 'stretch',
                        color: 'black',
                        textAlign: 'center',
                        fontFamily: 'ConcertOne-Regular',
                        fontSize: 32
                    }}>HELLO!</Text>
                    <Text style={{
                        height: 24,
                        width: 160,
                        alignSelf: 'stretch',
                        color: 'black',
                        textAlign: 'center',
                        fontFamily: 'ConcertOne-Regular',
                        fontSize: 16,
                    }}>Glad You&apos;re Joining us</Text>
                </View>

                <View className="registerArea" style={styles.registerArea}>
                    <View className="textFieldArea" style={styles.textFieldArea}>
                        <CustomInput
                            inputProps={{
                                placeholder: 'Phone Number or Email:',
                                keyboardType: 'default',
                                autoCapitalize: 'none',
                                value: identifier,
                                onChangeText: setIdentifier,
                            }}
                            containerStyle={styles.textField}
                                                        
                        />
                        
                        <CustomInput
                            inputProps={{
                            placeholder: 'Password:',
                            secureTextEntry: true,
                            autoCapitalize: 'none',
                            value: password,
                            onChangeText: setPassword,
                            }}
                            containerStyle={styles.textField}
                        />

                        <CustomInput
                            inputProps={{
                            placeholder: 'Repeat Password:',
                            secureTextEntry: true,
                            autoCapitalize: 'none',
                            value: confirm,
                            onChangeText: setConfirm,
                            }}
                            containerStyle={styles.textField}
                        />
                    </View>

                    <View className="LoginButton" style={styles.loginButton}>
                        <CustomButton
                            title="Submit"
                            href='..'
                            onPress={handleSignUp}
                            disabled={!canSubmit}
                            style={{ backgroundColor: 'rgba(79, 111, 82, 0.75)', opacity: canSubmit ? 1 : 0.5 }}
                            textStyle={{ fontSize: 16, width: 153, height: 24, textAlign: 'center' }}
                        />
                    </View>
                </View>
            </View>

            <View className="frame" style={styles.frame}>
                <Text style={{
                    display: 'flex',
                    width: 350,
                    height: 24,
                    paddingVertical: 5,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                    flexShrink: 0,
                    opacity: 0.5,
                }}>Or Continue With</Text>
            </View>

            <View className="iconArea" style={styles.icons}>
                <CustomButton
                    title="F"
                    href='https://www.facebook.com'
                    style={{ width: 50, height: 50, backgroundColor: '#FFF' }}
                />
                
                <CustomButton
                    title="G"
                    href='https://www.gmail.com'
                    style={{ width: 50, height: 50, backgroundColor: '#FFF' }}
                />
                
                <CustomButton
                    title="A"
                    href='https://www.apple.com'
                    style={{ width: 50, height: 50, backgroundColor: '#FFF' }}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create ({
    registerScreen: {
        display: 'flex',
        width: 430,
        height: 932,
        paddingVertical: 72,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 50,
        borderRadius: 50,
        backgroundColor: '#ECE3CE'
    },

    backFrame: {
        display: 'flex',
        position: 'relative',
        flex: 1,
        left: 0,
        top: 70,
        width: 430,
        height: 50,
        paddingTop: 0,
        paddingRight: 57,
        paddingBottom: 0,
        paddingLeft: 57,
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
    },

    backButton: {
        display: 'flex',
        position: 'absolute',
        flex: 1,
        left: 57,
        top: 0,
        width: 50,
        height: 50,
        padding: 15,
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
        borderRadius: 15,
        backgroundColor: '#739072',
    },

    content: {
        display: 'flex',
        width: 350,
        height: 465,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 50,
    },

    textArea: {
        display: 'flex',
        width: 160,
        height: 62,
        flexDirection: 'column',
        alignItems: 'center',
    },

    registerArea: {
        display: 'flex',
        height: 355,
        width: 350,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 75,
        alignSelf: 'stretch',
    },

    textFieldArea: {
        display: 'flex',
        width: 350,
        height: 200,
        paddingHorizontal: 10,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 25,
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 0,
    },

    textField:{
        display: 'flex',
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

    loginButton: {
        display: 'flex',
        height: 80,
        padding: 0,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
    },

    frame: {
        display: 'flex',
        width: 350,
        height: 24,
        paddingVertical: 5,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
        opacity: 0.5,
    },

    icons: {
        width: 198,
        height: 50,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 24,
    }
});

export default RegisterScreen;
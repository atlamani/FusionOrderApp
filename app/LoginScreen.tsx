import { useFonts } from "expo-font";
import { Link } from 'expo-router';
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CustomButton } from "./customButton";
import { CustomInput } from "./customTextField";

export const LoginScreen= () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const canSubmit = email.trim().length > 0 && password.trim().length > 0;

    const  [fontsLoaded] = useFonts ({
        "ConcertOne-Regular": require("../assets/Fonts/ConcertOne-Regular.ttf")
    });
    
    if (!fontsLoaded) {
        return null;
    }

    const handleLogin = () => {
        if (!canSubmit) return;
    };

    return (
        <View className="LOGINSCREEN" style={styles.loginScreen}>
            <View className="BackFrame" style={styles.backFrame}>
                <CustomButton
                    title="<"
                    href=".."
                    onPress={() => console.log("Back pressed")}
                    style={styles.backButton}
                    textStyle={{ color: '#ECE3CE', height: 30, width: 30, fontSize: 24 }}
                />
            </View>

            <View className="WelcomeCard" style={styles.welcomeCard}>
                <View className="Frame" style={styles.frame}>
                    <View className="Frame2" style={styles.frame2}>
                        <Text style={styles.welcomeText}>WELCOME!</Text>
                        <Text style={styles.caption}>Hungry again, aren&apos;t you?</Text>
                    </View>

                    <View className="AreaLogin" style={styles.areaLogin}>
                        <View className="Frame3" style={styles.frame3}>
                            <CustomInput
                                inputProps={{
                                    placeholder: 'Phone Number or Email:',
                                    keyboardType: 'default',
                                    autoCapitalize: 'none',
                                    value: email,
                                    onChangeText: setEmail,
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

                            <Link href='/passwordReset' style={{
                                width: 140,
                                height: 18,
                                fontFamily: "ConcertOne-Regular",
                                fontSize: 14,
                                textDecorationLine: 'underline',
                                opacity: 0.6,
                                color: 'black',
                            }}>Forgot Your Password?</Link>
                        </View>

                        <View className="LoginButton" style={styles.loginButton}>
                            <CustomButton
                                title="Login"
                                href='/Dashboard'
                                onPress={handleLogin}
                                disabled={!canSubmit}
                                style={{ backgroundColor: 'rgba(79, 111, 82, 0.75)'}}
                                textStyle={{ fontSize: 16 }}
                            />
                        </View>

                        <View className="IconSocialMedia" style={styles.icons}>
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
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create ({
    loginScreen: {
        display: 'flex',
        width: 430,
        height: 932,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 247,
        borderRadius: 50,
        backgroundColor: '#ECE3CE',
    },

    welcomeText: {
        height: 38,
        alignSelf: 'stretch',
        color: '#000',
        textAlign: 'center',
        fontFamily: 'ConcertOne-Regular',
        fontSize: 32,
    },

    caption: {
        height: 24,
        alignSelf: 'stretch',
        color: '#000',
        textAlign: 'center',
        fontFamily: 'ConcertOne-Regular',
        fontSize: 16,
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

    welcomeCard: {
        display: 'flex',
        position: 'absolute',
        flex: 1,
        left: 0,
        top: 367,
        width: 430,
        height: 565,
        padding: 10,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },

    frame: {
        display: 'flex',
        position: 'absolute',
        flex: 1,
        left: 40,
        top: 67.5,
        width: 350,
        height: 430,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 48,
        flexShrink: 0,
    },

    frame2: {
        display: 'flex',
        width: 268,
        paddingVertical: 5,
        paddingHorizontal: 0,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#739072',
    },

    areaLogin: {
        display: 'flex',
        width: 350,
        height: 310,
        padding: 10,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
    },

    frame3: {
        display: 'flex',
        width: 350,
        height: 152,
        padding: 10,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 10,
        flexShrink: 0,
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
        paddingVertical: 1,
        paddingHorizontal: 0,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
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

export default LoginScreen;
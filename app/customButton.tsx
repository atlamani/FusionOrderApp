import { useFonts } from "expo-font";
import { Href, router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

type CustomButtonProps = {
    title: string;
    onPress?: () => void;
    href: Href;
    disabled?: boolean;
    style?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle | TextStyle[];
};

export const CustomButton = ({
    title,
    onPress,
    href,
    disabled = false,
    style,
    textStyle,
}: CustomButtonProps) => {
    const  [fontsLoaded] = useFonts ({
        "ConcertOne-Regular": require("../assets/Fonts/ConcertOne-Regular.ttf")
    });
    
    if (!fontsLoaded) {
        return null;
    }

    const handlePress = () => {
        if (onPress) {
            onPress();
        }

        router.push(href);
    };

    return (
        <TouchableOpacity
            style={[styles.button, style, disabled && styles.disabled]}
            onPress={handlePress}
            disabled={disabled}
        >
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        display: 'flex',
        backgroundColor: '#3A4D39',
        width: 350,
        height: 50,
        paddingTop: 17,
        paddingBottom: 9,
        paddingHorizontal: 0,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
        borderRadius: 15,
    }, 

    disabled: {
        backgroundColor: '#739072',
    },

    text: {
        width: 44,
        height: 24,
        flexShrink: 0,
        color: 'black',
        textAlign: 'center',
        fontFamily: 'ConcertOne-Regular',
        fontSize: 16,
        lineHeight: undefined,
    },
});

export default CustomButton;
import { useFonts } from "expo-font";
import React from "react";
import { TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';

type CustomInputProps = {
    inputProps?: TextInputProps;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
};

export const CustomInput =({
    inputProps,
    containerStyle,
    inputStyle,
}: CustomInputProps) => {
    const  [fontsLoaded] = useFonts ({
            "ConcertOne-Regular": require("../assets/Fonts/ConcertOne-Regular.ttf")
        });
        
        if (!fontsLoaded) {
            return null;
        }
        
    return (
        <View style={[
            {
                width: '100%',
                height: 50,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                justifyContent: 'center',
            },
            containerStyle,
        ]}
        >
            <TextInput
                style={[
                    {
                        fontFamily: 'ConertOne-Regular',
                        color: '#000',
                    },
                    inputStyle,
                ]}
                placeholderTextColor='#FFF'
                {...inputProps}
            />
        </View>
    );
};

export default CustomInput;
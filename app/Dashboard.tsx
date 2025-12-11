import { useFonts } from "expo-font";
import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { DotsSlider } from '../app/slider';
//import { CustomButton } from './customButton';
//import { CustomInput } from "./customTextField";

export const Dashboard = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const  [fontsLoaded] = useFonts ({
        "ConcertOne-Regular": require("../assets/Fonts/ConcertOne-Regular.ttf")
    });
            
    if (!fontsLoaded) {
        return null;
    }

    return (
        <View className="DASHBOARD" style={styles.dashboard}>
            <View className="frame" style={styles.frame}></View>

            <View className="frame2" style={styles.frame2}>
                <Text style={{
                    color: '#FFF',
                    textAlign: 'center',
                    fontFamily: 'ConcertOne-Regular',
                    fontSize: 40,
                }}>FusionOrder</Text>
            </View>

            <View className="searchBar" style={styles.searchBar}>
                <Text style={{
                    display: 'flex',
                    width: 265,
                    height: 24,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    color: '#FFF',
                    fontFamily: 'ConcertOne-Regular',
                    fontSize: 16,
                }}>Search Your Next Craving</Text>

                <Image source={require('../assets/images/Search.png')} style={{ height: 40, width: 40 }}/>
            </View>

            <View className="RecRestaurants" style={styles.recRestaurant}>
                <Text style ={{
                    display: 'flex',
                    width: 200,
                    height: 36,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#FFF',
                    fontFamily: 'ConcertOne-Regular',
                    fontSize: 32,
                }}>Recommended</Text>

                <View className="Restaurant" style={styles.restaurant}>
                    <Image source={require('../assets/images/PizzaPlace.png')} style={{ height: 150, width: 350 }} />

                    <View className="textArea" style={styles.textArea}>
                        <Text style={{
                            display: 'flex',
                            width: 100,
                            height: 24,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: '#FFF',
                            fontFamily: 'ConcertOne-Regular',
                            fontSize: 16,
                        }}>NY PizzaPlace</Text>
                        <Text style={{
                            display: 'flex',
                            width: 100,
                            height: 24,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: '#FFF',
                            fontFamily: 'ConcertOne-Regular',
                            fontSize: 12,
                            opacity: 0.75
                        }}>4.3/5</Text>
                    </View>
                </View>

                <View className="slider" style={styles.slider}>
                    <DotsSlider
                        count={3}
                        activeIndex={activeIndex}
                        onChange={setActiveIndex}
                    />
                </View>
            </View>

            <View className="FoodPlaces" style={styles.foodPlaces}>
                <View className="OtherRestaurant" style={styles.otherRestaurants}>
                    <Image source={require('../assets/images/Tacos.png')} style={{ height: 112.5, width: 150 }} />
                    <View className="textArea" style={styles.textArea2}>
                        <Text style={{
                            display: 'flex',
                            width: 120,
                            height: 24,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: '#FFF',
                            fontFamily: 'ConcertOne-Regular',
                            fontSize: 16,
                        }}>TACOS NUMERO 1</Text>
                        <Text style={{
                            display: 'flex',
                            width: 30,
                            height: 24,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: '#FFF',
                            fontFamily: 'ConcertOne-Regular',
                            fontSize: 12,
                            opacity: 0.75,
                        }}>4.7/5</Text>
                    </View>
                </View>

                <View className="OtherRrestaurant2" style={styles.otherRestaurants}>
                    <Image source={require('../assets/images/Greek.png')} style={{ height: 112.5, width: 150 }} />
                    <View className="textArea" style={styles.textArea2}>
                        <Text style={{
                            display: 'flex',
                            width: 120,
                            height: 24,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: '#FFF',
                            fontFamily: 'ConcertOne-Regular',
                            fontSize: 16,
                        }}>Pillars of Athens</Text>
                        <Text style={{
                            display: 'flex',
                            width: 30,
                            height: 24,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: '#FFF',
                            fontFamily: 'ConcertOne-Regular',
                            fontSize: 12,
                            opacity: 0.75,
                        }}>4.6/5</Text>
                    </View>
                </View>

                <View className="OtherRestaurant3" style={styles.otherRestaurants}>
                    <Image source={require('../assets/images/Dessert (1).png')} style={{ height: 112.5, width: 150 }} />
                    <View className="textArea" style={styles.textArea2}>
                        <Text style={{
                            display: 'flex',
                            width: 120,
                            height: 24,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: '#FFF',
                            fontFamily: 'ConcertOne-Regular',
                            fontSize: 16,
                        }}>OUI OUI Desserts</Text>
                        <Text style={{
                            display: 'flex',
                            width: 30,
                            height: 24,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: '#FFF',
                            fontFamily: 'ConcertOne-Regular',
                            fontSize: 12,
                            opacity: 0.75,
                        }}>4.4/5</Text>
                    </View>
                </View>
            </View>

            <View className="NavigationBar" style={styles.navBar}>
                <View className="frame" style={styles.frame3}></View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create ({
    dashboard: {
        display: 'flex',
        width: 430,
        height: 932,
        borderRadius: 50,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#3A4D39",
        gap: 25,
    },

    frame: {
        display: 'flex',
        width: 430,
        height: 75,
        padding: 10,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        backgroundColor: '#ECE3CE',
    },

    frame2: {
        display: 'flex',
        height: 50,
        paddingHorizontal: 95,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },

    searchBar: {
        display: 'flex',
        width: 400,
        height: 75,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 60,
        borderRadius: 60,
        backgroundColor: '#739072',
    },

    recRestaurant: {
        display: 'flex',
        width: 400,
        height: 325,
        paddingVertical: 17,
        paddingHorizontal: 25,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 21,
        borderRadius: 15,
        backgroundColor: '#739072',
    },

    restaurant: {
        display: 'flex',
        height: 230,
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 10,
        flexShrink: 0,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        backgroundColor: '#3A4D39',
    },

    textArea: {
        display: 'flex',
        width: 160,
        height: 60,
        paddingVertical: 7,
        paddingHorizontal: 10,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 5,
        flexShrink: 0,
    },

    textArea2: {
        display: 'flex',
        width: 125,
        height: 60,
        paddingVertical: 7,
        paddingHorizontal: 10,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 5,
        flexShrink: 0,
    },

    slider: {
        display: 'flex',
        width: 72,
        height: 10,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    otherRestaurants: {
        display: 'flex',
        width: 150,
        height: 200,
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 10,
        borderRadius: 10,
        backgroundColor: '#4F6F52',
    },

    foodPlaces: {
        display: 'flex',
        width: 400,
        height: 200,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 20,
    },

    navBar: {
        display: 'flex',
        width: 430,
        height: 100,
        paddingVertical: 25,
        paddingHorizontal: 27,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        borderBottomRightRadius: 50,
        borderBottomLeftRadius: 50,
        backgroundColor: '#ECE3CE'
    },

    frame3: {
        display: 'flex',
        paddingHorizontal: 1,
        flexDirection:'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 75,
        alignSelf: 'stretch',
    }
})

export default Dashboard;
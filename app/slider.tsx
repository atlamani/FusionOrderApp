import React from "react";
import { Pressable, View } from 'react-native';

type DotsSliderProps = {
    count: number;
    activeIndex: number;
    onChange?: (index: number) => void;
};

export const DotsSlider: React.FC<DotsSliderProps> = ({
    count,
    activeIndex,
    onChange,
}) => {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {Array.from({ length: count }).map((_, index) => {
                const isActive = index === activeIndex;

                const dotStyle = {
                    width: isActive ? 25 : 10,
                    height: 10,
                    borderRadius: 99,
                    borderColor: '#FFF',
                    backgroundColor: isActive ? '#FFF' : '#4F6F52',
                } as const;

                const DotWrapper = onChange ? Pressable : View;

                return (
                    <DotWrapper
                        key={index}
                        {...(onChange && { onPress: () => onChange(index) })}
                        style={dotStyle}
                    />
                );
            })}
        </View>
    );
};

export default DotsSlider;
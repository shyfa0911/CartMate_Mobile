import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Text } from "react-native-paper";

export default function Detail() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text variant="headlineMedium">Detail List ID: {id}</Text>
    </View>
  );
}

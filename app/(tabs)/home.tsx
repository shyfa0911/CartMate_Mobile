import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { Card, FAB, Searchbar, Text } from "react-native-paper";
import { createList, getAllList } from "../../database/db";
import { router } from "expo-router";

export default function Home() {
  const [lists, setLists] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  async function loadLists() {
    const data = await getAllList();
    setLists(data);
  }

  async function handleAddList() {
    await createList("Belanja Baru", "Supermarket");
    loadLists();
  }

  useEffect(() => {
    loadLists();
  }, []);

  const filteredLists = lists.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <View
        style={{
          backgroundColor: "#1976D2",
          paddingTop: 90,
          paddingHorizontal: 20,
          paddingBottom: 20,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
      >
        <Text
          variant="headlineMedium"
          style={{ color: "white", fontWeight: "bold" }}
        >
          Good Morning, Shyfa
        </Text>

        <Text style={{ color: "white", opacity: 0.8 }}>
          Manage your shopping smartly
        </Text>

        <Searchbar
          placeholder="Search list..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            marginTop: 30,
            marginBottom: 10,
            borderRadius: 15,
          }}
        />
      </View>

      <View style={{ flex: 1, padding: 20, marginTop: -20 }}>
        <FlatList
          data={filteredLists}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 50 }}>
              No shopping list yet
            </Text>
          }
          renderItem={({ item }) => (
            <Card
              onPress={() => router.push(`./list/${item.id}`)}
              style={{
                marginBottom: 15,
                borderRadius: 20,
                backgroundColor: "white",
              }}
            >
              <Card.Content>
                <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                  {item.title}
                </Text>
                <Text variant="bodyMedium" style={{ color: "gray" }}>
                  {item.label}
                </Text>
              </Card.Content>
            </Card>
          )}
        />
      </View>

      <FAB
        icon="plus"
        style={{
          position: "absolute",
          right: 20,
          bottom: 30,
          backgroundColor: "#1976D2",
        }}
        color="white"
        onPress={handleAddList}
      />
    </View>
  );
}

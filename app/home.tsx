import { deleteList, getAllList } from "@/database/db";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { Card, FAB, IconButton, Searchbar, Text } from "react-native-paper";

const colors = {
  citrusZest: "#FAA62B",
  seaBreeze: "#86C5FF",
  amalfiTile: "#2E5AA7",
  creamGelato: "#F8E6A0",
};

export default function HomePage() {
  const [list, setList] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  async function loadList() {
    const data = await getAllList();
    setList(data);
  }

  useEffect(() => {
    loadList();
  }, []);

  const filteredList = list.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  async function handleDelete(id: number) {
    try {
      await deleteList(id);
      setList((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      Alert.alert("Error", "Failed to delete list");
      console.error(e);
    }
  }

  return (
    <>
      <View style={{ flex: 1, backgroundColor: "#ffff" }}>
        {/* header */}
        <View
          style={{
            backgroundColor: colors.amalfiTile,
            paddingTop: 60,
            paddingHorizontal: 20,
            paddingBottom: 40,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <View style={{ position: "relative", zIndex: 2 }}>
            <Text
              variant="headlineMedium"
              style={{
                color: "white",
                fontWeight: "bold",
                marginBottom: 4,
              }}
            >
              {getGreeting()}, Shyfa
            </Text>

            <Text
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 16,
                marginBottom: 24,
              }}
            >
              Ready to shop today?
            </Text>

            <Searchbar
              placeholder="Search your list..."
              value={search}
              onChangeText={setSearch}
              style={{
                borderRadius: 25,
                backgroundColor: "white",
                marginBottom: 10,
              }}
              iconColor={colors.amalfiTile}
              placeholderTextColor="#999"
            />
          </View>

          <View
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              top: -50,
              right: -50,
            }}
          />
          <View
            style={{
              position: "absolute",
              width: 150,
              height: 150,
              borderRadius: 75,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              bottom: -80,
              left: -40,
            }}
          />
        </View>

        <View style={{ paddingBlock: 20 }}>
          <FlatList
            data={filteredList}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 100,
            }}
            ListEmptyComponent={
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 50,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: colors.amalfiTile,
                    marginBottom: 8,
                  }}
                >
                  Belum ada list
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    color: "#999",
                    textAlign: "center",
                    maxWidth: "80%",
                  }}
                >
                  Tekan button + untuk membuat list baru
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Card
                onPress={() => router.push(`./list/${item.id}`)}
                style={{
                  marginBottom: 15,
                  borderRadius: 20,
                  backgroundColor: "white",
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                }}
              >
                <Card.Content>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "bold",
                          color: colors.amalfiTile,
                        }}
                      >
                        {item.title}
                      </Text>
                      {item.label && (
                        <Text
                          style={{ color: "#666", fontSize: 14, marginTop: 4 }}
                        >
                          {item.label}
                        </Text>
                      )}
                    </View>

                    <View style={{ flexDirection: "row", gap: 5 }}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        containerColor={colors.creamGelato}
                        iconColor={colors.amalfiTile}
                        onPress={() => router.push(`/addnewlist?id=${item.id}`)}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        containerColor="#FFE5E5"
                        iconColor="#FF6B6B"
                        onPress={() =>
                          Alert.alert(
                            "Hapus List",
                            `Kamu yakin untuk menghapus "${item.title}"?`,
                            [
                              { text: "Batal", style: "cancel" },
                              {
                                text: "Hapus",
                                onPress: () => handleDelete(item.id),
                                style: "destructive",
                              },
                            ],
                          )
                        }
                      />
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignContent: "center",
                    }}
                  >
                    <View>
                      <Text style={{ color: "#999", fontSize: 12 }}>
                        Total Items
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: colors.amalfiTile,
                        }}
                      >
                        {item.item_count || 0}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ color: "#999", fontSize: 12 }}>Total</Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: colors.amalfiTile,
                        }}
                      >
                        Rp {(item.total || 0).toLocaleString("id-ID")}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            )}
          />
        </View>

        <FAB
          icon="plus"
          style={{
            position: "absolute",
            padding: 3,
            right: 30,
            bottom: 45,
            backgroundColor: colors.citrusZest,
            borderRadius: 100,
          }}
          color="white"
          onPress={() => router.push(`/addnewlist`)}
        />
      </View>
    </>
  );
}

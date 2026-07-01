import {
  addItem,
  deleteItem,
  getItemsById,
  getShopListById,
  toggleItem,
} from "@/database/db";
import { ItemType, ShopListType } from "@/database/shop_types";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Card,
  Checkbox,
  FAB,
  IconButton,
  Text,
  TextInput,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const colors = {
  citrusZest: "#FAA62B",
  seaBreeze: "#86C5FF",
  amalfiTile: "#2E5AA7",
  creamGelato: "#F8E6A0",
};

type Items = {
  id: number;
  shop_list_id: number;
  name: string;
  price: number;
  quantity: number;
  checked: number;
};

type NewItem = {
  name: string;
  price: number;
  quantity: number;
};

export default function ListDetail() {
  const { id } = useLocalSearchParams();
  const [shopList, setShopList] = useState<ShopListType | null>(null);
  const [items, setItems] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newItem, setNewItem] = useState<NewItem>({
    name: "",
    price: 0,
    quantity: 1,
  });
  const insets = useSafeAreaInsets();

  async function loadData() {
    try {
      setLoading(true);

      const listData = (await getShopListById(Number(id))) as any[];
      if (listData && listData.length > 0) {
        setShopList({
          id: listData[0].id,
          title: listData[0].title,
          label: listData[0].label || "",
        });
      }

      const itemData = (await getItemsById(Number(id))) as Items[];
      if (itemData) {
        const formatItem: ItemType[] = itemData.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          checked: item.checked === 1,
        }));
        setItems(formatItem);
      }
    } catch (error) {
      console.error("Error loading detail:", error);
      Alert.alert("Error", "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  const handleToggle = async (itemId: number, currentChecked: boolean) => {
    try {
      await toggleItem(itemId, currentChecked ? 0 : 1);
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, checked: !currentChecked } : item,
        ),
      );
    } catch (error) {
      Alert.alert("Error", "Gagal mengupdate item");
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    Alert.alert("Hapus Item", "Yakin mau hapus item ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        onPress: async () => {
          try {
            await deleteItem(itemId);
            await loadData();
            Alert.alert("Sukses", "Item berhasil dihapus");
          } catch (error) {
            Alert.alert("Error", "Gagal menghapus item");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      Alert.alert("Error", "Nama item tidak boleh kosong");
      return;
    }

    try {
      await addItem(Number(id), newItem.name, newItem.price, newItem.quantity);

      setNewItem({ name: "", price: 0, quantity: 1 });
      setModalVisible(false);
      await loadData();
      Alert.alert("Sukses", "Item berhasil ditambahkan");
    } catch (error) {
      Alert.alert("Error", "Gagal menambahkan item");
    }
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const checkedItems = items.filter((item) => item.checked).length;

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  // Render halaman
  const renderContent = () => {
    if (loading) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Loading...</Text>
        </View>
      );
    }

    if (!shopList) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: insets.top,
          }}
        >
          <Text style={{ marginTop: 10, color: "#999" }}>
            List tidak ditemukan
          </Text>
          <IconButton
            icon="arrow-left"
            onPress={() => router.back()}
            style={{ marginTop: 20 }}
          />
        </View>
      );
    }

    return (
      <>
        <View
          style={{
            backgroundColor: "white",
            margin: 20,
            marginBottom: 0,
            padding: 20,
            borderRadius: 12,
            elevation: 2,
            paddingTop: insets.top,
          }}
        >
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: colors.amalfiTile,
              }}
            >
              {shopList.title}
            </Text>
            {shopList.label && (
              <Text style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
                {shopList.label}
              </Text>
            )}
          </View>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View>
              <Text style={{ color: "#999", fontSize: 12 }}>Total Items</Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: colors.amalfiTile,
                }}
              >
                {items.length}
              </Text>
            </View>
            <View>
              <Text style={{ color: "#999", fontSize: 12 }}>Selesai</Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: colors.citrusZest,
                }}
              >
                {checkedItems}
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
                {formatCurrency(total)}
              </Text>
            </View>
          </View>
        </View>

        {/* list item */}
        <FlatList
          data={items}
          keyExtractor={(item) => (item.id || Math.random()).toString()}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: colors.amalfiTile,
                marginBottom: 12,
              }}
            >
              Daftar Belanja
            </Text>
          }
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 40,
                backgroundColor: "white",
                borderRadius: 12,
                marginTop: 10,
              }}
            >
              <Text style={{ marginTop: 10, color: "#999", fontSize: 14 }}>
                Belum ada item
              </Text>
              <Text style={{ color: "#999", fontSize: 12, marginTop: 4 }}>
                Tap tombol + di bawah untuk menambah
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card
              style={{
                marginBottom: 10,
                borderRadius: 12,
                backgroundColor: "white",
                elevation: 1,
                opacity: item.checked ? 0.8 : 1,
              }}
            >
              <Card.Content>
                <View
                  style={{ flexDirection: "row", alignItems: "flex-start" }}
                >
                  <Checkbox
                    status={item.checked ? "checked" : "unchecked"}
                    onPress={() => handleToggle(item.id!, item.checked)}
                    color={colors.citrusZest}
                  />

                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "500",
                        textDecorationLine: item.checked
                          ? "line-through"
                          : "none",
                        color: item.checked ? "#999" : colors.amalfiTile,
                        marginBottom: 4,
                      }}
                    >
                      {item.name}
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#666", fontSize: 13 }}>
                        {item.quantity} x {formatCurrency(item.price)}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "bold",
                            color: colors.amalfiTile,
                          }}
                        >
                          {formatCurrency(item.price * item.quantity)}
                        </Text>
                        <IconButton
                          icon="delete"
                          size={16}
                          iconColor="#FF6B6B"
                          onPress={() => handleDeleteItem(item.id!)}
                          style={{ margin: 0 }}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
        />

        <FAB
          icon="plus"
          style={{
            position: "absolute",
            right: 20,
            bottom: 12 + insets.bottom,
            backgroundColor: colors.citrusZest,
            borderRadius: 16,
            elevation: 8,
          }}
          color="white"
          label="Tambah Item"
          onPress={() => setModalVisible(true)}
        />
      </>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      <Stack.Screen
        options={{
          title: "Detail List",
          headerShown: true,
          headerStyle: { backgroundColor: "#2E5AA7" },
          headerTintColor: "#fff",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => console.log("Tombol Edit Ditekan")}
              style={{ marginRight: 10 }}
            >
              <IconButton
                icon="pencil"
                size={22}
                iconColor="white"
                onPress={() => router.push(`/addnewlist?id=${id}`)}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {renderContent()}

      {/* Modal Tambah Item */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 28, // Radius lebih smooth ala iOS/Modern Android
              borderTopRightRadius: 28,
              paddingHorizontal: 24,
              paddingTop: 8,
              paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 24,
              maxHeight: "85%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 24,
            }}
          >
            <View
              style={{
                width: 40,
                height: 5,
                backgroundColor: "#E0E0E0",
                borderRadius: 3,
                alignSelf: "center",
                marginBottom: 16,
              }}
            />

            {/* Header Modal */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  color: colors.amalfiTile,
                }}
              >
                Tambah Item Baru
              </Text>
              <IconButton
                icon="close"
                size={24}
                iconColor="#757575"
                style={{ margin: 0, backgroundColor: "#F5F5F5" }}
                onPress={() => {
                  setModalVisible(false);
                  setNewItem({ name: "", price: 0, quantity: 1 });
                }}
              />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              <Card
                elevation={0}
                style={{
                  borderRadius: 16,
                  backgroundColor: "white",
                  borderWidth: 1,
                  borderColor: "#F0F0F0",
                  marginBottom: 24,
                }}
              >
                <Card.Content style={{ gap: 16, paddingVertical: 16 }}>
                  {/* Input Nama Item */}
                  <TextInput
                    label="Nama Item"
                    placeholder="Misal: Susu Kotak"
                    value={newItem.name}
                    onChangeText={(text) =>
                      setNewItem({ ...newItem, name: text })
                    }
                    mode="outlined"
                    outlineColor="#E0E0E0"
                    activeOutlineColor={colors.amalfiTile}
                    style={{ backgroundColor: "white" }}
                  />

                  {/* Input Harga */}
                  <TextInput
                    label="Harga Satuan"
                    placeholder="0"
                    value={newItem.price === 0 ? "" : newItem.price.toString()}
                    onChangeText={(text) =>
                      setNewItem({ ...newItem, price: Number(text) || 0 })
                    }
                    keyboardType="numeric"
                    left={<TextInput.Affix text="Rp " />}
                    mode="outlined"
                    outlineColor="#E0E0E0"
                    activeOutlineColor={colors.amalfiTile}
                    style={{ backgroundColor: "white" }}
                  />

                  {/* Input Jumlah Kuantitas */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "600",
                        color: "#616161",
                        fontSize: 15,
                      }}
                    >
                      Jumlah Kuantitas
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#F5F5F5",
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "#E0E0E0",
                        width: 130,
                        padding: 2,
                      }}
                    >
                      <IconButton
                        icon="minus"
                        size={20}
                        onPress={() =>
                          newItem.quantity > 1 &&
                          setNewItem({
                            ...newItem,
                            quantity: newItem.quantity - 1,
                          })
                        }
                        style={{
                          margin: 0,
                          backgroundColor: "white",
                          borderRadius: 10,
                        }}
                        iconColor={colors.amalfiTile}
                      />
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color: colors.amalfiTile,
                          }}
                        >
                          {newItem.quantity}
                        </Text>
                      </View>
                      <IconButton
                        icon="plus"
                        size={20}
                        onPress={() =>
                          setNewItem({
                            ...newItem,
                            quantity: newItem.quantity + 1,
                          })
                        }
                        style={{
                          margin: 0,
                          backgroundColor: "white",
                          borderRadius: 10,
                        }}
                        iconColor={colors.amalfiTile}
                      />
                    </View>
                  </View>

                  {/* Subtotal Section */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 8,
                      paddingTop: 16,
                      borderTopWidth: 1,
                      borderTopColor: "#F5F5F5",
                    }}
                  >
                    <Text
                      style={{
                        color: "#757575",
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      Subtotal Item:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: colors.amalfiTile,
                      }}
                    >
                      {formatCurrency(newItem.price * newItem.quantity)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>

              {/* Action Buttons */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setModalVisible(false);
                    setNewItem({ name: "", price: 0, quantity: 1 });
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    borderColor: colors.amalfiTile,
                    borderWidth: 1,
                  }}
                  labelStyle={{ fontWeight: "bold", paddingVertical: 4 }}
                  textColor={colors.amalfiTile}
                >
                  Batal
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddItem}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    backgroundColor: colors.citrusZest,
                  }}
                  labelStyle={{ fontWeight: "bold", paddingVertical: 4 }}
                  textColor="white"
                >
                  Tambah
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

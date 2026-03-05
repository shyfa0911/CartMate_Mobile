import {
  getItemsById,
  getShopListById,
  toggleItem,
  deleteItem,
  deleteList,
  addItem,
} from "@/database/db";
import { ItemType, ShopListType } from "@/database/shop_types";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, View, Modal, ScrollView } from "react-native";
import { Card, Checkbox, FAB, IconButton, Text, TextInput, Button } from "react-native-paper";

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

  const handleDeleteList = async () => {
    Alert.alert(
      "Hapus List",
      `Yakin mau hapus "${shopList?.title}"? Semua item akan ikut terhapus.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          onPress: async () => {
            try {
              await deleteList(Number(id));
              Alert.alert("Sukses", "List berhasil dihapus");
              router.back();
            } catch (error) {
              Alert.alert("Error", "Gagal menghapus list");
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      Alert.alert("Error", "Nama item tidak boleh kosong");
      return;
    }

    try {
      await addItem(
        Number(id),
        newItem.name,
        newItem.price,
        newItem.quantity
      );
      
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
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Loading...</Text>
        </View>
      );
    }

    if (!shopList) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={{ color: "#999", fontSize: 12 }}>Total Items</Text>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.amalfiTile }}>
                {items.length}
              </Text>
            </View>
            <View>
              <Text style={{ color: "#999", fontSize: 12 }}>Selesai</Text>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.citrusZest }}>
                {checkedItems}
              </Text>
            </View>
            <View>
              <Text style={{ color: "#999", fontSize: 12 }}>Total</Text>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.amalfiTile }}>
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
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
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
                        textDecorationLine: item.checked ? "line-through" : "none",
                        color: item.checked ? "#999" : colors.amalfiTile,
                        marginBottom: 4,
                      }}
                    >
                      {item.name}
                    </Text>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ color: "#666", fontSize: 13 }}>
                        {item.quantity} x {formatCurrency(item.price)}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.amalfiTile }}>
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
            bottom: 30,
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
          title: shopList?.title || "Detail List",
          headerStyle: { backgroundColor: colors.amalfiTile },
          headerTintColor: "white",
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
        <View style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}>
          <View style={{
            backgroundColor: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: "80%",
          }}>
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: "bold",
                color: colors.amalfiTile,
              }}>
                Tambah Item
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => {
                  setModalVisible(false);
                  setNewItem({ name: "", price: 0, quantity: 1 });
                }}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Card style={{
                borderRadius: 12,
                backgroundColor: "white",
                elevation: 1,
                marginBottom: 20,
              }}>
                <Card.Content>
                  <View style={{ marginBottom: 16 }}>
                    <TextInput
                      label="Nama Item"
                      value={newItem.name}
                      onChangeText={(text) => setNewItem({...newItem, name: text})}
                      mode="outlined"
                      outlineColor="#E0E0E0"
                      activeOutlineColor={colors.amalfiTile}
                      style={{ backgroundColor: "white" }}
                    />
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <TextInput
                      label="Harga"
                      value={newItem.price.toString()}
                      onChangeText={(text) => 
                        setNewItem({...newItem, price: Number(text) || 0})
                      }
                      keyboardType="numeric"
                      mode="outlined"
                      outlineColor="#E0E0E0"
                      activeOutlineColor={colors.amalfiTile}
                      style={{ backgroundColor: "white" }}
                    />
                  </View>

                  <View>
                    <Text style={{ marginBottom: 8, color: "#666" }}>
                      Jumlah
                    </Text>
                    <View style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#F5F5F5",
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#E0E0E0",
                    }}>
                      <IconButton
                        icon="minus"
                        size={20}
                        onPress={() =>
                          newItem.quantity > 1 &&
                          setNewItem({...newItem, quantity: newItem.quantity - 1})
                        }
                        style={{
                          margin: 0,
                          backgroundColor: "white",
                          borderRadius: 6,
                        }}
                        iconColor={colors.amalfiTile}
                      />
                      <View style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <Text style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: colors.amalfiTile,
                        }}>
                          {newItem.quantity}
                        </Text>
                      </View>
                      <IconButton
                        icon="plus"
                        size={20}
                        onPress={() =>
                          setNewItem({...newItem, quantity: newItem.quantity + 1})
                        }
                        style={{
                          margin: 0,
                          backgroundColor: "white",
                          borderRadius: 6,
                        }}
                        iconColor={colors.amalfiTile}
                      />
                    </View>
                  </View>

                  <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 20,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: "#F0F0F0",
                  }}>
                    <Text style={{ color: "#666", fontSize: 16 }}>Subtotal:</Text>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: colors.amalfiTile,
                    }}>
                      {formatCurrency(newItem.price * newItem.quantity)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>

              <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setModalVisible(false);
                    setNewItem({ name: "", price: 0, quantity: 1 });
                  }}
                  style={{ flex: 1, borderRadius: 8 }}
                  textColor={colors.amalfiTile}
                >
                  Batal
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddItem}
                  style={{ 
                    flex: 1, 
                    borderRadius: 8,
                    backgroundColor: colors.citrusZest,
                  }}
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
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Button, Card, IconButton, Text, TextInput } from "react-native-paper";

import { ItemType, ShopListType } from "@/database/shop_types";
import {
  addItem,
  addList,
  deleteItem,
  deleteList,
  getItemsById,
  getShopListById,
} from "../database/db";

const colors = {
  citrusZest: "#FAA62B",
  seaBreeze: "#86C5FF",
  amalfiTile: "#2E5AA7",
  creamGelato: "#F8E6A0",
};

type ShopListFromDB = {
  id: number;
  title: string;
  label: string | null;
  created_at: string;
};

type ItemFromDB = {
  id: number;
  shop_list_id: number;
  name: string;
  price: number;
  quantity: number;
  checked: number;
};

export default function AddList() {
  const { id } = useLocalSearchParams();
  const isEditMode = !!id;

  const [shopList, setShopList] = useState<ShopListType>({
    title: "",
    label: "",
  });

  const [items, setItems] = useState<ItemType[]>([
    {
      name: "",
      price: 0,
      quantity: 1,
      checked: false,
    },
  ]);

  useEffect(() => {
    if (isEditMode) {
      loadListData();
    }
  }, [id]);

  const loadListData = async () => {
    try {
      console.log("Loading data untuk ID:", id);

      // Ambil data list
      const listData = (await getShopListById(Number(id))) as ShopListFromDB[];
      console.log("List data:", listData);

      if (listData && listData.length > 0) {
        const listItem = listData[0];
        setShopList({
          title: listItem.title,
          label: listItem.label || "",
        });
      } else {
        Alert.alert("Error", "List tidak ditemukan");
        router.back();
        return;
      }

      // Ambil items
      const itemsData = (await getItemsById(Number(id))) as ItemFromDB[];
      console.log("Items data:", itemsData);

      if (itemsData && itemsData.length > 0) {
        // Convert dari DB format ke ItemType format
        const formattedItems: ItemType[] = itemsData.map(
          (item: ItemFromDB) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            checked: item.checked === 1,
          }),
        );
        setItems(formattedItems);
      }
    } catch (error) {
      console.error("Error loading list data:", error);
      Alert.alert("Error", "Gagal memuat data");
    }
  };

  const addNewItem = () => {
    setItems((prev) => [
      ...prev,
      { name: "", price: 0, quantity: 1, checked: false },
    ]);
  };

  const updateItem = <K extends keyof ItemType>(
    index: number,
    key: K,
    value: ItemType[K],
  ) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index][key] = value;
      return newItems;
    });
  };

  const removeItem = async (index: number) => {
    // Hapus item berdasarkan index, minimal harus ada 1 item
    const itemToRemove = items[index];

    // Kalau ini item yang sudah ada di database (punya id), hapus dari database
    if (isEditMode && itemToRemove.id) {
      try {
        await deleteItem(itemToRemove.id);
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }

    // Hapus dari state
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Fungsi untuk menghapus seluruh list
  const handleDeleteList = () => {
    Alert.alert(
      "Hapus List",
      "Apakah Anda yakin ingin menghapus list ini? Semua item di dalamnya akan ikut terhapus.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteList(Number(id));
              Alert.alert("Berhasil!", "List berhasil dihapus", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert("Error", "Gagal menghapus list");
            }
          },
        },
      ],
    );
  };

  const handleSave = async () => {
    if (!shopList.title.trim()) {
      Alert.alert("Error", "Title tidak boleh kosong!");
      return;
    }

    try {
      if (isEditMode) {
        // TODO: Implement update list (title dan label)
        // Untuk sekarang, kita handle update items dulu
        // Note: Perlu buat fungsi updateList di db.ts

        // Handle items yang baru ditambahkan (tanpa id)
        for (let item of items) {
          if (item.name.trim() !== "" && !item.id) {
            await addItem(Number(id), item.name, item.price, item.quantity);
          }
          // Untuk item yang sudah ada, perlu fungsi updateItem
          // if (item.id) {
          //   await updateItem(item.id, item.name, item.price, item.quantity);
          // }
        }

        Alert.alert("Berhasil!", "List berhasil diupdate", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        const result = await addList(shopList.title, shopList.label);
        const shopListId = result.lastInsertRowId;

        for (let item of items) {
          if (item.name.trim() !== "") {
            await addItem(shopListId, item.name, item.price, item.quantity);
          }
        }

        Alert.alert("Berhasil!", "List berhasil disimpan", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Gagal menyimpan, coba lagi");
    }
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ffff" }}>
      <Stack.Screen
        options={{
          title: isEditMode ? "Edit List" : "Buat List Baru",
          headerStyle: { backgroundColor: colors.amalfiTile },
          headerTintColor: "white",
          headerTitleStyle: { fontWeight: "bold" },
          // Tambahkan tombol hapus di header untuk mode edit
          headerRight: () =>
            isEditMode ? (
              <IconButton
                icon="delete"
                iconColor="white"
                size={24}
                onPress={handleDeleteList}
                style={{ marginRight: 8 }}
              />
            ) : null,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={{ paddingHorizontal: 20 }}>
          <Card
            style={{
              borderRadius: 20,
              backgroundColor: "white",
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              marginVertical: 20,
            }}
          >
            <Card.Content style={{ gap: 16 }}>
              <Text
                variant="titleLarge"
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                  color: colors.amalfiTile,
                  marginBottom: 2,
                }}
              >
                List Information
              </Text>

              <TextInput
                label="Title"
                value={shopList.title}
                onChangeText={(text) =>
                  setShopList((prev) => ({ ...prev, title: text }))
                }
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor={colors.amalfiTile}
                style={{ backgroundColor: "white" }}
              />

              <TextInput
                label="Label (Optional)"
                value={shopList.label}
                onChangeText={(text) =>
                  setShopList((prev) => ({ ...prev, label: text }))
                }
                mode="outlined"
                outlineColor="#E0E0E0"
                activeOutlineColor={colors.amalfiTile}
                style={{ backgroundColor: "white" }}
              />
            </Card.Content>
          </Card>

          {/* Title Items */}
          <Text
            variant="titleLarge"
            style={{
              fontWeight: "bold",
              color: colors.amalfiTile,
              marginBottom: 12,
              marginLeft: 4,
            }}
          >
            Items
          </Text>

          {/* Daftar Items */}
          {items.map((item, index) => (
            <Card
              key={index}
              style={{
                borderRadius: 20,
                backgroundColor: "white",
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                marginBottom: 12,
              }}
            >
              <Card.Content>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: colors.creamGelato,
                      }}
                    >
                      <Text
                        style={{ color: colors.amalfiTile, fontWeight: "bold" }}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <TextInput
                      placeholder="Nama item"
                      value={item.name}
                      onChangeText={(text) => updateItem(index, "name", text)}
                      mode="outlined"
                      outlineColor="#E0E0E0"
                      activeOutlineColor={colors.amalfiTile}
                      style={{ flex: 1, backgroundColor: "white" }}
                    />
                  </View>

                  {/* Tombol X untuk menghapus item - SEKARANG TERSEDIA UNTUK SEMUA MODE (edit DAN baru) */}
                  {items.length > 1 && (
                    <IconButton
                      icon="close"
                      size={18}
                      onPress={() => removeItem(index)}
                      iconColor="#FF6B6B"
                      style={{ margin: 0 }}
                    />
                  )}
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <TextInput
                      label="Harga"
                      value={item.price.toString()}
                      onChangeText={(text) =>
                        updateItem(index, "price", Number(text) || 0)
                      }
                      keyboardType="numeric"
                      mode="outlined"
                      outlineColor="#E0E0E0"
                      activeOutlineColor={colors.amalfiTile}
                      style={{ backgroundColor: "white" }}
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#F5F5F5",
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "#E0E0E0",
                      width: 120,
                    }}
                  >
                    <IconButton
                      icon="minus"
                      size={20}
                      onPress={() =>
                        item.quantity > 1 &&
                        updateItem(index, "quantity", item.quantity - 1)
                      }
                      style={{
                        margin: 0,
                        backgroundColor: "white",
                        borderRadius: 8,
                      }}
                      iconColor={colors.amalfiTile}
                    />
                    <View
                      style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: colors.amalfiTile,
                        }}
                      >
                        {item.quantity}
                      </Text>
                    </View>
                    <IconButton
                      icon="plus"
                      size={20}
                      onPress={() =>
                        updateItem(index, "quantity", item.quantity + 1)
                      }
                      style={{
                        margin: 0,
                        backgroundColor: "white",
                        borderRadius: 8,
                      }}
                      iconColor={colors.amalfiTile}
                    />
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 12,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: "#F0F0F0",
                  }}
                >
                  <Text style={{ color: "#666" }}>Subtotal:</Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: colors.amalfiTile,
                    }}
                  >
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))}

          <Button
            mode="outlined"
            onPress={addNewItem}
            style={{
              marginVertical: 16,
              borderRadius: 25,
              borderColor: colors.amalfiTile,
              borderWidth: 1,
            }}
            labelStyle={{ color: colors.amalfiTile, fontWeight: "bold" }}
            icon="plus"
          >
            Tambah Item
          </Button>

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          paddingHorizontal: 20,
          paddingTop: 15,
          paddingBottom: 25,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <View
          style={{
            backgroundColor: colors.creamGelato,
            padding: 15,
            borderRadius: 15,
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: colors.amalfiTile,
                fontWeight: "bold",
              }}
            >
              Total Belanja:
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: colors.amalfiTile,
              }}
            >
              {formatCurrency(total)}
            </Text>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          style={{
            borderRadius: 15,
            paddingVertical: 8,
            backgroundColor: colors.citrusZest,
          }}
        >
          {isEditMode ? "Update List" : "Simpan List"}
        </Button>
      </View>
    </View>
  );
}

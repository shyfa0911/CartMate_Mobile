import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("cartmate.db", { useNewConnection: true });

export async function initDatabase() {
  try {
    await db.execAsync(`
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS shop_list(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            title TEXT NOT NULL,
            label TEXT
            );

            CREATE TABLE IF NOT EXISTS item_list(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shop_list_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            price INTEGER DEFAULT 0,
            quantity INTEGER DEFAULT 1,
            checked INTEGER DEFAULT 0, 
            FOREIGN KEY(shop_list_id) REFERENCES shop_list(id) ON DELETE CASCADE
            )
            `);
  } catch (error) {}
}

export async function getAllList() {
  return await db.getAllAsync(`SELECT * FROM shop_list ORDER BY id DESC`);
}

export async function getItemsById(shop_list_id: number) {
  return await db.getAllAsync(
    `SELECT * FROM item_list where shop_list_id = ? ORDER BY id DESC`,
    [shop_list_id],
  );
}
export async function getShopListById(shop_list_id: number) {
  return await db.getAllAsync(`SELECT * FROM shop_list where id = ?`, [
    shop_list_id,
  ]);
}

export async function addList(title: string, label: string) {
  return await db.runAsync(
    `INSERT INTO shop_list (title, label) VALUES (?, ?)`,
    [title, label],
  );
}

export async function addItem(
  shop_list_id: number,
  name: string,
  price: number,
  quantity: number,
) {
  return await db.runAsync(
    "INSERT INTO item_list (shop_list_id, name, price, quantity) VALUES (?, ?, ?, ?)",
    [shop_list_id, name, price, quantity],
  );
}

export async function toggleItem(id: number, checked: number) {
  return await db.runAsync("UPDATE item_list SET checked = ? WHERE id = ?", [
    checked,
    id,
  ]);
}

export async function deleteList(id: number) {
  return await db.runAsync("DELETE FROM shop_list WHERE id = ?", [id]);
}

export async function deleteItem(id: number) {
  return await db.runAsync("DELETE FROM item_list WHERE id = ?", [id]);
}

export default db;

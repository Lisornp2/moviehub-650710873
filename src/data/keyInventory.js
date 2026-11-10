
const INVENTORY_KEY = 'gamekey_inventory';

function createKeys(game) {
  const prefix = String(game.title)
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 4)
    .toUpperCase()
    .padEnd(4, 'X');

  const keys = [];

  for (let i = 1; i <= 100; i++) {
    const part1 = String(game.id).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const part2 = i.toString(36).toUpperCase().padStart(4, '0');
    const part3 = (i * 7919).toString(36).toUpperCase().padStart(4, '0');

    keys.push(`${prefix}-${part1}-${part2}-${part3}`);
  }

  return keys;
}

function getInventory() {
  return JSON.parse(localStorage.getItem(INVENTORY_KEY) || '{}');
}

function saveInventory(inventory) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}

export function getGameKeys(game) {
  const inventory = getInventory();
  const gameId = String(game.id);

  if (!inventory[gameId]) {
    inventory[gameId] = createKeys(game);
    saveInventory(inventory);
  }

  return inventory[gameId];
}

export function purchaseGameKeys(game, quantity) {
  const inventory = getInventory();
  const gameId = String(game.id);

  if (!inventory[gameId]) {
    inventory[gameId] = createKeys(game);
  }

  if (inventory[gameId].length < quantity) {
    throw new Error(
      `คีย์เกมเหลือไม่เพียงพอ มีเหลือ ${inventory[gameId].length} คีย์`
    );
  }

  const purchasedKeys = inventory[gameId].slice(0, quantity);

  inventory[gameId] = inventory[gameId].slice(quantity);

  saveInventory(inventory);

  return purchasedKeys;
}

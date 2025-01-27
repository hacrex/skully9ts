const { getDatabase, ref, set, get, update, remove } = require('firebase/database');
const db = require('./firebaseConfig');

// Add a new user to Realtime Database
async function addUserRealtime(data) {
  try {
    const dbRef = ref(getDatabase(), 'users/' + data.email); // Use email as ID
    await set(dbRef, data);
    return data.email; // Return user ID
  } catch (e) {
    console.error('Error adding user: ', e);
    throw e;
  }
}

// Get user from Realtime Database
async function getUserRealtime(userId) {
  const dbRef = ref(getDatabase(), 'users/' + userId);
  const snapshot = await get(dbRef);
  return snapshot.val();
}

// Update user in Realtime Database
async function updateUserRealtime(userId, data) {
  try {
    const dbRef = ref(getDatabase(), 'users/' + userId);
    await update(dbRef, data);
  } catch (e) {
    console.error('Error updating user: ', e);
    throw e;
  }
}

// Delete user from Realtime Database
async function deleteUserRealtime(userId) {
  try {
    const dbRef = ref(getDatabase(), 'users/' + userId);
    await remove(dbRef);
  } catch (e) {
    console.error('Error deleting user: ', e);
    throw e;
  }
}

// Add a new product to Realtime Database
async function addProductRealtime(data) {
  try {
    const dbRef = ref(getDatabase(), 'products/' + data.id); // Use product ID
    await set(dbRef, data);
    return data.id; // Return product ID
  } catch (e) {
    console.error('Error adding product: ', e);
    throw e;
  }
}

// Get product from Realtime Database
async function getProductRealtime(productId) {
  const dbRef = ref(getDatabase(), 'products/' + productId);
  const snapshot = await get(dbRef);
  return snapshot.val();
}

// Update product in Realtime Database
async function updateProductRealtime(productId, data) {
  try {
    const dbRef = ref(getDatabase(), 'products/' + productId);
    await update(dbRef, data);
  } catch (e) {
    console.error('Error updating product: ', e);
    throw e;
  }
}

// Delete product from Realtime Database
async function deleteProductRealtime(productId) {
  try {
    const dbRef = ref(getDatabase(), 'products/' + productId);
    await remove(dbRef);
  } catch (e) {
    console.error('Error deleting product: ', e);
    throw e;
  }
}

// Add an order to Realtime Database
async function addOrderRealtime(data) {
  try {
    const dbRef = ref(getDatabase(), 'orders/' + data.id); // Use order ID
    await set(dbRef, data);
    return data.id; // Return order ID
  } catch (e) {
    console.error('Error adding order: ', e);
    throw e;
  }
}

// Get order from Realtime Database
async function getOrderRealtime(orderId) {
  const dbRef = ref(getDatabase(), 'orders/' + orderId);
  const snapshot = await get(dbRef);
  return snapshot.val();
}

// Update order in Realtime Database
async function updateOrderRealtime(orderId, data) {
  try {
    const dbRef = ref(getDatabase(), 'orders/' + orderId);
    await update(dbRef, data);
  } catch (e) {
    console.error('Error updating order: ', e);
    throw e;
  }
}

// Delete order from Realtime Database
async function deleteOrderRealtime(orderId) {
  try {
    const dbRef = ref(getDatabase(), 'orders/' + orderId);
    await remove(dbRef);
  } catch (e) {
    console.error('Error deleting order: ', e);
    throw e;
  }
}

// Get orders for a user from Realtime Database
async function getOrdersRealtime(userId) {
  const dbRef = ref(getDatabase(), 'orders');
  const snapshot = await get(dbRef);
  const orders = snapshot.val();
  return Object.values(orders).filter(order => order.user === userId);
}

module.exports = {
  addUserRealtime,
  getUserRealtime,
  updateUserRealtime,
  deleteUserRealtime,
  addProductRealtime,
  getProductRealtime,
  updateProductRealtime,
  deleteProductRealtime,
  addOrderRealtime,
  getOrderRealtime,
  updateOrderRealtime,
  deleteOrderRealtime,
  getOrdersRealtime
};
// Chrome Extension Background Service Worker
console.log('POS Extension background service worker loaded');

// Initialize storage if empty
chrome.runtime.onInstalled.addListener(() => {
  console.log('POS Extension installed');
  
  // Initialize default data
  chrome.storage.local.get(['products', 'categories', 'users'], (result) => {
    if (!result.products) {
      chrome.storage.local.set({
        products: [
          {
            id: 'c4628b62-667a-4f59-b7fd-0e7b7b6ddaee',
            name: 'Meja 1',
            sku: 'BLR001',
            price: 20000,
            stock: 9987,
            categoryId: '3c2313a0-a2aa-44d7-b8f4-0413ad1520ed',
            categoryName: 'Lainnya'
          }
        ],
        categories: [
          { id: '65cd3617-77f0-4ae2-9c2a-72b3f88706d6', name: 'Makanan' },
          { id: 'a49b4f30-5501-4f8f-a254-cccc1967fddb', name: 'Minuman' },
          { id: '3e6a9282-80ad-417a-a793-adeaf5610235', name: 'Snack' },
          { id: '88452ab8-f27f-40b6-82ad-4bc97779bb5d', name: 'Rokok' },
          { id: '3c2313a0-a2aa-44d7-b8f4-0413ad1520ed', name: 'Lainnya' }
        ],
        users: [
          { id: 'faf63929-a0c5-4a4b-8ccd-22580a871b67', name: 'Admin Utama', username: 'admin', password: 'admin', role: 'admin' },
          { id: 'a8abda62-5c75-4785-befd-0b3084ec12e9', name: 'Kasir Satu', username: 'kasir1', password: 'kasir1', role: 'cashier' }
        ]
      });
    }
  });
});

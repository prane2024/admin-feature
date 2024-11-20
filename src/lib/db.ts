import { openDB } from 'idb';

const dbName = 'nezarts-jewelry-store';
const dbVersion = 2; // Increment version to trigger upgrade

export const initDb = async () => {
  const db = await openDB(dbName, dbVersion, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // If products store doesn't exist, create it
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        productStore.createIndex('productNumber', 'productNumber', { unique: true });
        productStore.createIndex('category', 'category');
      } else {
        // Ensure indexes exist on existing store
        const productStore = transaction.objectStore('products');
        if (!productStore.indexNames.contains('category')) {
          productStore.createIndex('category', 'category');
        }
        if (!productStore.indexNames.contains('productNumber')) {
          productStore.createIndex('productNumber', 'productNumber', { unique: true });
        }
      }

      // If images store doesn't exist, create it
      if (!db.objectStoreNames.contains('images')) {
        const imageStore = db.createObjectStore('images', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        imageStore.createIndex('productId', 'productId');
      } else {
        // Ensure index exists on existing store
        const imageStore = transaction.objectStore('images');
        if (!imageStore.indexNames.contains('productId')) {
          imageStore.createIndex('productId', 'productId');
        }
      }
    },
  });
  return db;
};

export const createProduct = async (data: {
  productNumber: string;
  category: string;
  price: number;
  images: string[];
}) => {
  const db = await initDb();
  const tx = db.transaction(['products', 'images'], 'readwrite');

  try {
    // Create product
    const product = {
      productNumber: data.productNumber,
      category: data.category,
      price: data.price,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const productId = await tx.objectStore('products').add(product);

    // Store images
    const imageStore = tx.objectStore('images');
    await Promise.all(
      data.images.map(imageData =>
        imageStore.add({
          url: imageData,
          productId,
          createdAt: new Date(),
        })
      )
    );

    await tx.done;
    return { id: productId, ...data };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const getProductsByCategory = async (category: string) => {
  const db = await initDb();
  const tx = db.transaction(['products', 'images'], 'readonly');
  
  try {
    const productStore = tx.objectStore('products');
    const imageStore = tx.objectStore('images');
    
    // Get all products for the category
    const categoryIndex = productStore.index('category');
    const products = await categoryIndex.getAll(category);
    
    // Get images for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const imageIndex = imageStore.index('productId');
        const images = await imageIndex.getAll(product.id);
        return {
          ...product,
          images: images.map(img => img.url),
        };
      })
    );
    
    return productsWithImages;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Clear all data (useful for testing)
export const clearDatabase = async () => {
  const db = await initDb();
  const tx = db.transaction(['products', 'images'], 'readwrite');
  await tx.objectStore('products').clear();
  await tx.objectStore('images').clear();
  await tx.done;
};
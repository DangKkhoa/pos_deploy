const productData = require('../model/product/ProductModel')


async function updateProduct(productId, productImagePath, productData, con) {
  try {
    const { editProductname, editImportprice, editRetailprice, editManufacturer, editCategory } = productData;

    // Update user profile in the database
    await con.execute(
      'UPDATE Products SET product_name = ?, import_price = ?, retail_price = ?, manufacturer = ?, category = ?, image = ? WHERE product_id = ?',
      [editProductname, editImportprice, editRetailprice, editManufacturer, editCategory, productImagePath, productId]
    );

    console.log('Product updated successfully.');
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

module.exports = { updateProduct };


import { useEffect, useState } from "react";
import api from "../services/api";
import AdminNavbar from "../components/AdminNavbar";

const emptyForm = {
  item_name: "",
  description: "",
  cost_price: "",
  sell_price: "",
  category: "",
  quantity: "",
};

function Items() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [loading, setLoading] = useState(false);

  // Bulk deletion
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Image previews
  const [previewImages, setPreviewImages] = useState([]);

  // Active or deleted products view
  const [viewDeleted, setViewDeleted] = useState(false);

  // Create temporary previews for newly selected images.
  useEffect(() => {
    const previews = selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviewImages(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedFiles]);

  useEffect(() => {
    getItems();
  }, []);

  // Fetch active products.
  const getItems = async () => {
    try {
      const response = await api.get("/items");
      const fetchedItems = response.data.items || [];

      setItems(fetchedItems);

      setSelectedItemIds((previous) =>
        previous.filter((id) =>
          fetchedItems.some((item) => item._id === id),
        ),
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to get products",
      );
    }
  };

  // Fetch soft-deleted products.
  const getDeletedItems = async () => {
    try {
      const response = await api.get("/items/deleted");

      setItems(response.data.items || []);
      setSelectedItemIds([]);
      setViewDeleted(true);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to fetch deleted products",
      );
    }
  };

  // Switch back to the active products list.
  const showActiveItems = async () => {
    setViewDeleted(false);
    setSelectedItemIds([]);
    setMessage("");
    await getItems();
  };

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingItem(null);
    setSelectedFiles([]);
    setExistingImages([]);
    setImagesToRemove([]);

    const fileInput = document.getElementById("item-images");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") &&
        file.size <= 5 * 1024 * 1024,
    );

    if (validFiles.length !== files.length) {
      setMessage(
        "Choose image files only. Each image must be 5 MB or smaller.",
      );
    } else {
      setMessage("");
    }

    if (selectedFiles.length + validFiles.length > 10) {
      setMessage("You can select up to 10 new images at a time.");
      e.target.value = "";
      return;
    }

    setSelectedFiles((previous) => [...previous, ...validFiles]);

    // Allow the same file to be selected again if needed.
    e.target.value = "";
  };

  const removeSelectedFile = (indexToRemove) => {
    setSelectedFiles((previous) =>
      previous.filter((_, index) => index !== indexToRemove),
    );
  };

  const toggleExistingImageRemoval = (imageId) => {
    setImagesToRemove((previous) =>
      previous.includes(imageId)
        ? previous.filter((id) => id !== imageId)
        : [...previous, imageId],
    );
  };

  // Create or update a product.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();

      data.append("item_name", formData.item_name);
      data.append("description", formData.description);
      data.append("cost_price", String(Number(formData.cost_price)));
      data.append("sell_price", String(Number(formData.sell_price)));
      data.append("category", formData.category);
      data.append("quantity", String(Number(formData.quantity)));

      selectedFiles.forEach((file) => {
        data.append("images", file);
      });

      if (editingItem) {
        if (imagesToRemove.length > 0) {
          data.append(
            "remove_image_ids",
            JSON.stringify(imagesToRemove),
          );
        }

        const response = await api.put(
          `/items/${editingItem._id}`,
          data,
        );

        setMessage(
          response.data.message || "Product updated successfully",
        );
      } else {
        const response = await api.post("/items", data);

        setMessage(
          response.data.message || "Product created successfully",
        );
      }

      resetForm();
      setViewDeleted(false);
      setSelectedItemIds([]);

      await getItems();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to save product",
      );
    } finally {
      setLoading(false);
    }
  };

  // Populate the form for editing an active product.
  const handleEdit = (item) => {
    if (viewDeleted) return;

    setEditingItem(item);

    setFormData({
      item_name: item.item_name || "",
      description: item.description || "",
      cost_price: item.cost_price ?? "",
      sell_price: item.sell_price ?? "",
      category: item.category || "",
      quantity: item.stock?.quantity ?? 0,
    });

    setExistingImages(
      (item.images || []).filter((image) => !image.deleted_at),
    );

    setImagesToRemove([]);
    setSelectedFiles([]);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    resetForm();
    setMessage("");
  };

  // Soft-delete one active product.
  const handleDelete = async (id) => {
    if (viewDeleted) return;

    const confirmed = window.confirm(
      "Are you sure you want to move this product to Deleted Products?",
    );

    if (!confirmed) return;

    try {
      const response = await api.delete(`/items/${id}`);

      setSelectedItemIds((previous) =>
        previous.filter((selectedId) => selectedId !== id),
      );

      if (editingItem?._id === id) {
        resetForm();
      }

      setMessage(
        response.data.message || "Product moved to Deleted Products",
      );

      await getItems();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to delete product",
      );
    }
  };

  // Select or deselect one active product.
  const toggleItemSelection = (itemId) => {
    if (viewDeleted) return;

    setSelectedItemIds((previous) =>
      previous.includes(itemId)
        ? previous.filter((id) => id !== itemId)
        : [...previous, itemId],
    );
  };

  // Check whether every currently displayed active product is selected.
  const allItemsSelected =
    !viewDeleted &&
    items.length > 0 &&
    items.every((item) => selectedItemIds.includes(item._id));

  const toggleSelectAll = () => {
    if (viewDeleted) return;

    if (allItemsSelected) {
      setSelectedItemIds((previous) =>
        previous.filter(
          (id) => !items.some((item) => item._id === id),
        ),
      );
    } else {
      setSelectedItemIds((previous) => [
        ...new Set([
          ...previous,
          ...items.map((item) => item._id),
        ]),
      ]);
    }
  };

  // Soft-delete selected active products.
  const handleBulkDelete = async () => {
    if (viewDeleted) return;

    if (selectedItemIds.length === 0) {
      setMessage("Please select at least one product.");
      return;
    }

    const confirmed = window.confirm(
      `Move ${selectedItemIds.length} selected product(s) to Deleted Products?`,
    );

    if (!confirmed) return;

    setBulkDeleting(true);
    setMessage("");

    try {
      const response = await api.delete("/items/bulk", {
        data: { ids: selectedItemIds },
      });

      const deletedIds = new Set(selectedItemIds);

      if (editingItem && deletedIds.has(editingItem._id)) {
        resetForm();
      }

      setSelectedItemIds([]);

      setMessage(
        response.data.message ||
          "Selected products moved to Deleted Products",
      );

      await getItems();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to delete selected products",
      );
    } finally {
      setBulkDeleting(false);
    }
  };

  // Restore a soft-deleted product.
  const handleRestore = async (id) => {
    try {
      const response = await api.patch(`/items/${id}/restore`);

      setSelectedItemIds([]);

      setMessage(
        response.data.message || "Product restored successfully",
      );

      if (viewDeleted) {
        await getDeletedItems();
      } else {
        await getItems();
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to restore product",
      );
    }
  };

  return (
    <div>
      <AdminNavbar />

      <h1>Product Management</h1>

      {!viewDeleted && (
        <>
          <h2>{editingItem ? "Edit Product" : "Add Product"}</h2>

          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="item_name">Item Name</label>
              <input
                id="item_name"
                type="text"
                name="item_name"
                value={formData.item_name}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </div>

            <div>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="cost_price">Cost Price</label>
              <input
                id="cost_price"
                type="number"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label htmlFor="sell_price">Selling Price</label>
              <input
                id="sell_price"
                type="number"
                name="sell_price"
                value={formData.sell_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label htmlFor="category">Category</label>
              <input
                id="category"
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="quantity">Stock Quantity</label>
              <input
                id="quantity"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                step="1"
                required
              />
            </div>

            <hr />

            <div>
              <label htmlFor="item-images">Product Images</label>
              <p>Select image files, up to 5 MB each.</p>

              <input
                id="item-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </div>

            {existingImages.length > 0 && (
              <div>
                <h3>Current Images</h3>
                <p>
                  Mark images you want to remove when you save your
                  changes.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  {existingImages.map((image) => {
                    const markedForRemoval =
                      imagesToRemove.includes(image._id);

                    return (
                      <div
                        key={image._id || image.image_path}
                        style={{
                          width: 150,
                          border: "1px solid #ccc",
                          padding: 8,
                        }}
                      >
                        <img
                          src={image.image_path}
                          alt="Existing product"
                          style={{
                            width: "100%",
                            height: 100,
                            objectFit: "cover",
                            opacity: markedForRemoval ? 0.4 : 1,
                          }}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            toggleExistingImageRemoval(image._id)
                          }
                          disabled={!image._id}
                        >
                          {markedForRemoval
                            ? "Keep Image"
                            : "Remove Image"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {previewImages.length > 0 && (
              <div>
                <h3>New Image Previews</h3>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  {previewImages.map((preview, index) => (
                    <div
                      key={`${preview.file.name}-${index}`}
                      style={{
                        width: 150,
                        border: "1px solid #ccc",
                        padding: 8,
                      }}
                    >
                      <img
                        src={preview.url}
                        alt={preview.file.name}
                        style={{
                          width: "100%",
                          height: 100,
                          objectFit: "cover",
                        }}
                      />

                      <p>{preview.file.name}</p>

                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <br />

            <button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : editingItem
                  ? "Update Product"
                  : "Create Product"}
            </button>

            {editingItem && (
              <button type="button" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </form>
        </>
      )}

      {message && <p role="status">{message}</p>}

      <hr />

      <h2>{viewDeleted ? "Deleted Products" : "Active Products"}</h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={showActiveItems}
          disabled={!viewDeleted}
        >
          Active Products
        </button>

        <button
          type="button"
          onClick={getDeletedItems}
          disabled={viewDeleted}
        >
          Deleted Products
        </button>
      </div>

      {!viewDeleted && items.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <input
              type="checkbox"
              checked={allItemsSelected}
              onChange={toggleSelectAll}
              aria-label="Select all active products"
            />
            Select All Products
          </label>

          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={
              selectedItemIds.length === 0 || bulkDeleting
            }
          >
            {bulkDeleting
              ? "Deleting..."
              : `Delete Selected (${selectedItemIds.length})`}
          </button>
        </div>
      )}

      {items.length === 0 && (
        <p>
          {viewDeleted
            ? "No deleted products found."
            : "No active products found."}
        </p>
      )}

      {items.map((item) => (
        <div
          key={item._id}
          style={{
            border:
              !viewDeleted && selectedItemIds.includes(item._id)
                ? "2px solid #2563eb"
                : "1px solid #ccc",
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          {!viewDeleted && (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <input
                type="checkbox"
                checked={selectedItemIds.includes(item._id)}
                onChange={() => toggleItemSelection(item._id)}
                aria-label={`Select ${item.item_name}`}
              />
              Select this product
            </label>
          )}

          <h3>{item.item_name}</h3>

          {viewDeleted && (
            <p>
              <strong>Status:</strong> Deleted
              {item.deleted_at
                ? ` on ${new Date(item.deleted_at).toLocaleString()}`
                : ""}
            </p>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 12,
            }}
          >
            {(item.images || [])
              .filter(
                (image) => !image.deleted_at && image.image_path,
              )
              .map((image) => (
                <img
                  key={image._id || image.image_path}
                  src={image.image_path}
                  alt={item.item_name}
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />
              ))}
          </div>

          <p>Description: {item.description}</p>
          <p>Cost Price: {item.cost_price}</p>
          <p>Selling Price: {item.sell_price}</p>
          <p>Category: {item.category}</p>
          <p>Stock: {item.stock?.quantity ?? 0}</p>

          {viewDeleted ? (
            <button
              type="button"
              onClick={() => handleRestore(item._id)}
            >
              Restore Product
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleEdit(item)}
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => handleDelete(item._id)}
              >
                Delete
              </button>
            </>
          )}

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Items;

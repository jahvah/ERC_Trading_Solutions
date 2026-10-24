
import { useEffect, useState } from "react";

function ItemForm({
  editingItem,
  formData,
  onChange,
  onSubmit,
  onCancel,
  loading,
  selectedFiles,
  onFileChange,
  onRemoveSelectedFile,
  existingImages,
  imagesToRemove,
  onToggleExistingImageRemoval,
}) {
  const [previewImages, setPreviewImages] = useState([]);

  // Generate temporary previews for selected image files.
  useEffect(() => {
    const previews = selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviewImages(previews);

    // Release temporary image URLs when files change or the component unmounts.
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedFiles]);

  return (
    <section>
      <h2>{editingItem ? "Edit Product" : "Add Product"}</h2>

      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="item_name">Item Name</label>
          <input
            id="item_name"
            type="text"
            name="item_name"
            value={formData.item_name}
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
            min="0"
            step="1"
            required
          />
        </div>

        <hr />

        <div>
          <label htmlFor="item-images">Product Images</label>
          <p>
            Select image files up to 5 MB each. You can select up to
            10 new images.
          </p>

          <input
            id="item-images"
            type="file"
            accept="image/*"
            multiple
            onChange={onFileChange}
          />
        </div>

        {existingImages.length > 0 && (
          <div>
            <h3>Current Images</h3>
            <p>
              Mark images you want to remove when you save your changes.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              {existingImages.map((image) => {
                const markedForRemoval = imagesToRemove.includes(
                  image._id
                );

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
                        onToggleExistingImageRemoval(image._id)
                      }
                      disabled={!image._id}
                    >
                      {markedForRemoval ? "Keep Image" : "Remove Image"}
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
                    onClick={() => onRemoveSelectedFile(index)}
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
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </form>
    </section>
  );
}

export default ItemForm;


import AdminNavbar from "../components/AdminNavbar";
import ItemForm from "../components/items/ItemForm";
import ItemList from "../components/items/ItemList";
import useItems from "../hooks/useItems";

function Items() {
  const {
    items,
    message,
    editingItem,
    formData,
    selectedFiles,
    existingImages,
    imagesToRemove,
    loading,
    selectedItemIds,
    bulkDeleting,
    bulkRestoring,
    viewDeleted,

    handleShowDeletedItems,
    showActiveItems,
    handleChange,
    handleFileChange,
    removeSelectedFile,
    toggleExistingImageRemoval,
    handleSubmit,
    handleEdit,
    handleCancelEdit,
    handleDelete,
    toggleItemSelection,
    toggleSelectAll,
    handleBulkDelete,
    handleRestore,
    handleBulkRestore,
  } = useItems();

  return (
    <div>
      <AdminNavbar />

      <h1>Product Management</h1>

      {!viewDeleted && (
        <ItemForm
          editingItem={editingItem}
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
          loading={loading}
          selectedFiles={selectedFiles}
          onFileChange={handleFileChange}
          onRemoveSelectedFile={removeSelectedFile}
          existingImages={existingImages}
          imagesToRemove={imagesToRemove}
          onToggleExistingImageRemoval={
            toggleExistingImageRemoval
          }
        />
      )}

      {message && <p role="status">{message}</p>}

      <hr />

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
          onClick={handleShowDeletedItems}
          disabled={viewDeleted}
        >
          Deleted Products
        </button>
      </div>

      <ItemList
        items={items}
        viewDeleted={viewDeleted}
        selectedItemIds={selectedItemIds}
        bulkDeleting={bulkDeleting}
        bulkRestoring={bulkRestoring}
        onToggleSelection={toggleItemSelection}
        onToggleSelectAll={toggleSelectAll}
        onBulkDelete={handleBulkDelete}
        onBulkRestore={handleBulkRestore}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
      />
    </div>
  );
}

export default Items;

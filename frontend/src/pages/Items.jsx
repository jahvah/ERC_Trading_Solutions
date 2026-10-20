import { useEffect, useState } from "react";
import api from "../services/api";
import AdminNavbar from "../components/AdminNavbar";

function Items() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    item_name: "",
    description: "",
    cost_price: "",
    sell_price: "",
    category: "",
    quantity: "",
  });

  useEffect(() => {
    getItems();
  }, []);

  const getItems = async () => {
    try {
      const response = await api.get("/items");

      setItems(response.data.items);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to get items");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingItem) {
        const response = await api.put(`/items/${editingItem._id}`, {
          item_name: formData.item_name,
          description: formData.description,
          cost_price: Number(formData.cost_price),
          sell_price: Number(formData.sell_price),
          category: formData.category,
          stock: {
            quantity: Number(formData.quantity),
          },
        });

        setMessage(response.data.message);

        setEditingItem(null);
      } else {
        const response = await api.post("/items", {
          item_name: formData.item_name,
          description: formData.description,
          cost_price: Number(formData.cost_price),
          sell_price: Number(formData.sell_price),
          category: formData.category,
          stock: {
            quantity: Number(formData.quantity),
          },
        });

        setMessage(response.data.message);
      }

      setFormData({
        item_name: "",
        description: "",
        cost_price: "",
        sell_price: "",
        category: "",
        quantity: "",
      });

      getItems();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save item");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);

    setFormData({
      item_name: item.item_name,
      description: item.description,
      cost_price: item.cost_price,
      sell_price: item.sell_price,
      category: item.category,
      quantity: item.stock?.quantity || 0,
    });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);

    setFormData({
      item_name: "",
      description: "",
      cost_price: "",
      sell_price: "",
      category: "",
      quantity: "",
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/items/${id}`);

      setMessage(response.data.message);

      getItems();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete item");
    }
  };

  return (
    <div>
      <AdminNavbar />

      <h1>Items</h1>

      <h2>{editingItem ? "Edit Item" : "Add Item"}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Item Name</label>

          <input
            type="text"
            name="item_name"
            value={formData.item_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Description</label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Cost Price</label>

          <input
            type="number"
            name="cost_price"
            value={formData.cost_price}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Sell Price</label>

          <input
            type="number"
            name="sell_price"
            value={formData.sell_price}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Category</label>

          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Stock Quantity</label>

          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <button type="submit">
          {editingItem ? "Update Item" : "Create Item"}
        </button>

        {editingItem && (
          <button type="button" onClick={handleCancelEdit}>
            Cancel
          </button>
        )}
      </form>

      {message && <p>{message}</p>}

      <hr />

      <h2>Item List</h2>

      {items.map((item) => (
        <div key={item._id}>
          <h3>{item.item_name}</h3>

          <p>Description: {item.description}</p>

          <p>Cost Price: {item.cost_price}</p>

          <p>Sell Price: {item.sell_price}</p>

          <p>Category: {item.category}</p>

          <p>Stock: {item.stock?.quantity || 0}</p>

          <button onClick={() => handleEdit(item)}>Edit</button>

          <button onClick={() => handleDelete(item._id)}>Delete</button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Items;

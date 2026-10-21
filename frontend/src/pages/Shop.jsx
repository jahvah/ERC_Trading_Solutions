import { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import api from '../services/api'
import { getToken } from '../utils/auth'
import CustomerNavbar from "../components/CustomerNavbar";


function Shop() {
    const [items, setItems] = useState([])
    const [message, setMessage] = useState('')

    useEffect(() => {
        getItems()
    }, [])

    const getItems = async () => {
        try {
            const response = await api.get('/items')

            setItems(response.data.items)

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to get items'
            )
        }
    }

    const addToCart = async (itemId) => {
        try {
            const response = await api.post(
                '/cart',
                {
                    item_id: itemId,
                    quantity: 1
                },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            )

            setMessage(response.data.message)

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to add item to cart'
            )
        }
    }

    return (
        <div>

            <CustomerNavbar />
            
            <h1>Shop</h1>

            {message && (
                <p>{message}</p>
            )}

            {items.map((item) => (
                <div key={item._id}>

                    <h3>
                        {item.item_name}
                    </h3>

                    <p>
                        {item.description}
                    </p>

                    <p>
                        Price: {item.sell_price}
                    </p>

                    <p>
                        Category: {item.category}
                    </p>

                    <p>
                        Stock: {item.stock?.quantity || 0}
                    </p>

                    <button
                        onClick={() => addToCart(item._id)}
                        disabled={
                            (item.stock?.quantity || 0) <= 0
                        }
                    >
                        Add to Cart
                    </button>

                    <hr />

                </div>
            ))}
        </div>
    )
}

export default Shop
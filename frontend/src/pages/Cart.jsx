import { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import api from '../services/api'
import { getToken } from '../utils/auth'
import CustomerNavbar from "../components/CustomerNavbar";

function Cart() {
    const [cart, setCart] = useState(null)
    const [message, setMessage] = useState('')

    useEffect(() => {
        getCart()
    }, [])

    const getCart = async () => {
        try {
            const response = await api.get('/cart', {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })

            setCart(response.data.cart)

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to get cart'
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

            setCart(response.data.cart)
            setMessage(response.data.message)

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to add item to cart'
            )
        }
    }

    const updateQuantity = async (itemId, quantity) => {
        try {
            const response = await api.put(
                `/cart/${itemId}`,
                {
                    quantity: Number(quantity)
                },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            )

            setCart(response.data.cart)
            setMessage(response.data.message)

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to update cart'
            )
        }
    }

    const removeFromCart = async (itemId) => {
        try {
            const response = await api.delete(
                `/cart/${itemId}`,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            )

            setCart(response.data.cart)
            setMessage(response.data.message)

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to remove item'
            )
        }
    }

    const createOrder = async () => {
        try {
            const response = await api.post(
                '/orders',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            )

            setMessage(response.data.message)

            getCart()

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to create order'
            )
        }
    }

    return (
        <div>

             <CustomerNavbar />
             
            <h1>Shopping Cart</h1>

            {message && (
                <p>{message}</p>
            )}

            {!cart && (
                <p>Loading cart...</p>
            )}

            {cart && cart.items.length === 0 && (
                <p>Your cart is empty.</p>
            )}

            {cart && cart.items.length > 0 && (
                <div>
                    <button onClick={createOrder}>
                        Checkout
                    </button>

                    <hr />

                    {cart.items.map((cartItem) => (
                        <div key={cartItem.item._id}>
                            <h3>
                                {cartItem.item.item_name}
                            </h3>

                            <p>
                                Price: {cartItem.item.sell_price}
                            </p>

                            <p>
                                Quantity: {cartItem.quantity}
                            </p>

                            <button
                                onClick={() =>
                                    updateQuantity(
                                        cartItem.item._id,
                                        cartItem.quantity + 1
                                    )
                                }
                            >
                                +
                            </button>

                            <button
                                onClick={() =>
                                    updateQuantity(
                                        cartItem.item._id,
                                        cartItem.quantity - 1
                                    )
                                }
                                disabled={
                                    cartItem.quantity <= 1
                                }
                            >
                                -
                            </button>

                            <button
                                onClick={() =>
                                    removeFromCart(
                                        cartItem.item._id
                                    )
                                }
                            >
                                Remove
                            </button>

                            <hr />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Cart


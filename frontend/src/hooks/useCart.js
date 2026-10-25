
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
    getCart as fetchCart,
    updateCartItem as updateCartItemRequest,
    removeCartItem as removeCartItemRequest,
    checkoutCart
} from '../services/cartService'

function useCart() {
    const [cart, setCart] = useState(null)
    const [selectedItemIds, setSelectedItemIds] = useState([])
    const [loading, setLoading] = useState(true)
    const [updatingItemId, setUpdatingItemId] = useState(null)
    const [removingItemId, setRemovingItemId] = useState(null)
    const [deletingSelected, setDeletingSelected] = useState(false)
    const [checkingOut, setCheckingOut] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('success')

    const showMessage = useCallback((text, type = 'success') => {
        setMessage(text)
        setMessageType(type)
    }, [])

    const loadCart = useCallback(async () => {
        try {
            setLoading(true)
            const data = await fetchCart()
            const nextCart = data.cart

            setCart(nextCart)

            // Keep selections that still exist in the cart.
            const existingIds = new Set(
                (nextCart?.items || [])
                    .map(entry => entry.item?._id)
                    .filter(Boolean)
            )

            setSelectedItemIds(previous =>
                previous.filter(id => existingIds.has(id))
            )
        } catch (error) {
            showMessage(
                error.response?.data?.message ||
                'Failed to load your cart.',
                'error'
            )
        } finally {
            setLoading(false)
        }
    }, [showMessage])

    useEffect(() => {
        loadCart()
    }, [loadCart])

    const cartItems = cart?.items || []

    const selectedItems = useMemo(
        () => cartItems.filter(entry =>
            entry.item?._id &&
            selectedItemIds.includes(entry.item._id)
        ),
        [cartItems, selectedItemIds]
    )

    const selectedQuantity = useMemo(
        () => selectedItems.reduce(
            (total, entry) => total + Number(entry.quantity || 0),
            0
        ),
        [selectedItems]
    )

    const selectedSubtotal = useMemo(
        () => selectedItems.reduce((total, entry) => {
            return total +
                Number(entry.item?.sell_price || 0) *
                Number(entry.quantity || 0)
        }, 0),
        [selectedItems]
    )

    const totalQuantity = useMemo(
        () => cartItems.reduce(
            (total, entry) => total + Number(entry.quantity || 0),
            0
        ),
        [cartItems]
    )

    const subtotal = useMemo(
        () => cartItems.reduce((total, entry) => {
            return total +
                Number(entry.item?.sell_price || 0) *
                Number(entry.quantity || 0)
        }, 0),
        [cartItems]
    )

    const hasUnavailableItems = selectedItems.some(entry => {
        const item = entry.item
        const stock = Number(item?.stock?.quantity ?? 0)

        return (
            !item ||
            item.deleted_at != null ||
            stock < 1 ||
            Number(entry.quantity) > stock
        )
    })

    const allSelected =
        cartItems.length > 0 &&
        cartItems.every(entry =>
            entry.item?._id &&
            selectedItemIds.includes(entry.item._id)
        )

    const toggleItemSelection = itemId => {
        setSelectedItemIds(previous =>
            previous.includes(itemId)
                ? previous.filter(id => id !== itemId)
                : [...previous, itemId]
        )
    }

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedItemIds([])
        } else {
            setSelectedItemIds(
                cartItems
                    .map(entry => entry.item?._id)
                    .filter(Boolean)
            )
        }
    }

    const updateQuantity = async (itemId, quantity) => {
        const nextQuantity = Number(quantity)

        if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
            showMessage('Quantity must be at least 1.', 'error')
            return false
        }

        try {
            setUpdatingItemId(itemId)

            const data = await updateCartItemRequest(itemId, nextQuantity)
            setCart(data.cart)

            showMessage(data.message || 'Cart updated successfully.')
            return true
        } catch (error) {
            showMessage(
                error.response?.data?.message ||
                'Failed to update quantity.',
                'error'
            )
            await loadCart()
            return false
        } finally {
            setUpdatingItemId(null)
        }
    }

    const removeItem = async itemId => {
        if (!itemId) return false

        try {
            setRemovingItemId(itemId)

            const data = await removeCartItemRequest(itemId)
            setCart(data.cart)

            setSelectedItemIds(previous =>
                previous.filter(id => id !== itemId)
            )

            showMessage(data.message || 'Item removed from your cart.')
            return true
        } catch (error) {
            showMessage(
                error.response?.data?.message ||
                'Failed to remove item.',
                'error'
            )
            return false
        } finally {
            setRemovingItemId(null)
        }
    }

    const deleteSelectedItems = async () => {
        if (selectedItems.length === 0 || deletingSelected) return

        const confirmed = window.confirm(
            `Remove ${selectedItems.length} selected product(s) from your cart?`
        )

        if (!confirmed) return

        try {
            setDeletingSelected(true)

            // Delete one at a time so each request finishes before the next.
            for (const entry of selectedItems) {
                await removeCartItemRequest(entry.item._id)
            }

            setSelectedItemIds([])
            await loadCart()
            showMessage('Selected products were removed from your cart.')
        } catch (error) {
            await loadCart()
            showMessage(
                error.response?.data?.message ||
                'Some items could not be removed. Please check your cart.',
                'error'
            )
        } finally {
            setDeletingSelected(false)
        }
    }

    const checkoutSelected = async () => {
        if (
            selectedItems.length === 0 ||
            hasUnavailableItems ||
            checkingOut
        ) {
            return null
        }

        const itemIds = selectedItems.map(entry => entry.item._id)

        try {
            setCheckingOut(true)

            // The backend must support item_ids for selected checkout.
            const data = await checkoutCart(itemIds)

            setSelectedItemIds([])
            await loadCart()

            showMessage(
                data.message || 'Your selected items were ordered successfully.'
            )

            return data
        } catch (error) {
            showMessage(
                error.response?.data?.message ||
                'Checkout failed.',
                'error'
            )
            return null
        } finally {
            setCheckingOut(false)
        }
    }

    return {
        cart,
        cartItems,
        selectedItems,
        selectedItemIds,
        loading,
        message,
        messageType,
        setMessage,
        totalQuantity,
        subtotal,
        selectedQuantity,
        selectedSubtotal,
        allSelected,
        hasUnavailableItems,
        updatingItemId,
        removingItemId,
        deletingSelected,
        checkingOut,
        toggleItemSelection,
        toggleSelectAll,
        updateQuantity,
        removeItem,
        deleteSelectedItems,
        checkoutSelected,
        loadCart
    }
}

export default useCart

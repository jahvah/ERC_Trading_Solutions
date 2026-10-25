
import { Link } from 'react-router-dom'

import CustomerNavbar from '../components/CustomerNavbar'
import CartItem from '../components/cart/CartItem'
import CartSummary from '../components/cart/CartSummary'
import EmptyCart from '../components/cart/EmptyCart'
import useCart from '../hooks/useCart'

function Cart() {
    const {
        cartItems,
        selectedItemIds,
        loading,
        message,
        messageType,
        setMessage,
        totalQuantity,
        selectedQuantity,
        selectedSubtotal,
        selectedItems,
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
        checkoutSelected
    } = useCart()

    const handleCheckout = async () => {
        if (!selectedItems.length) {
            setMessage('Please select at least one product.')
            return
        }

        const confirmed = window.confirm(
            `Check out ${selectedItems.length} selected product(s)?`
        )

        if (confirmed) {
            await checkoutSelected()
        }
    }

    return (
        <div style={styles.page}>
            <style>{`
                .cart-layout {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
                    align-items: start;
                    gap: 28px;
                }

                .cart-summary-column {
                    position: sticky;
                    top: 20px;
                }

                @media (max-width: 900px) {
                    .cart-layout {
                        grid-template-columns: minmax(0, 1fr);
                    }

                    .cart-summary-column {
                        position: static;
                    }
                }

                @media (max-width: 600px) {
                    .cart-container {
                        padding: 20px 12px 40px !important;
                    }

                    .cart-item-card {
                        gap: 10px !important;
                        padding: 12px !important;
                    }

                    .cart-item-image {
                        width: 76px !important;
                        height: 76px !important;
                    }

                    .cart-item-name {
                        font-size: 15px !important;
                    }

                    .cart-item-top-row {
                        flex-wrap: wrap;
                    }

                    .cart-bulk-actions {
                        align-items: stretch !important;
                        flex-direction: column;
                    }
                }
            `}</style>

            <CustomerNavbar />

            <main className="cart-container" style={styles.container}>
                <p style={styles.breadcrumb}>
                    <Link to="/shop" style={styles.link}>Shop</Link>
                    {' / Shopping Cart'}
                </p>

                <header style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Shopping Cart</h1>
                        <p style={styles.subtitle}>
                            Select the products you want to purchase.
                        </p>
                    </div>

                    <span style={styles.count}>
                        {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} in cart
                    </span>
                </header>

                {message && (
                    <div
                        role="status"
                        style={{
                            ...styles.message,
                            ...(messageType === 'error' ? styles.error : {})
                        }}
                    >
                        <span>{message}</span>
                        <button
                            type="button"
                            onClick={() => setMessage('')}
                            style={styles.dismiss}
                        >
                            ×
                        </button>
                    </div>
                )}

                {loading ? (
                    <p style={styles.loading}>Loading your cart...</p>
                ) : cartItems.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <>
                        <div className="cart-bulk-actions" style={styles.bulkActions}>
                            <label style={styles.selectAll}>
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleSelectAll}
                                    style={styles.checkbox}
                                />
                                Select All
                            </label>

                            <span style={styles.selectionCount}>
                                {selectedItemIds.length} selected
                            </span>

                            <button
                                type="button"
                                onClick={deleteSelectedItems}
                                disabled={
                                    selectedItems.length === 0 ||
                                    deletingSelected ||
                                    checkingOut
                                }
                                style={{
                                    ...styles.deleteButton,
                                    ...(selectedItems.length === 0
                                        ? styles.disabled
                                        : {})
                                }}
                            >
                                {deletingSelected
                                    ? 'Deleting...'
                                    : `Delete Selected (${selectedItems.length})`}
                            </button>
                        </div>

                        <div className="cart-layout">
                            <section>
                                {cartItems.map(cartItem => {
                                    const itemId = cartItem.item?._id

                                    return (
                                        <CartItem
                                            key={itemId || cartItem._id}
                                            cartItem={cartItem}
                                            selected={Boolean(
                                                itemId &&
                                                selectedItemIds.includes(itemId)
                                            )}
                                            onToggleSelect={toggleItemSelection}
                                            onUpdateQuantity={updateQuantity}
                                            onRemove={removeItem}
                                            updating={updatingItemId === itemId}
                                            removing={removingItemId === itemId}
                                        />
                                    )
                                })}
                            </section>

                            <div className="cart-summary-column">
                                <CartSummary
                                    selectedQuantity={selectedQuantity}
                                    selectedSubtotal={selectedSubtotal}
                                    selectedCount={selectedItems.length}
                                    onCheckout={handleCheckout}
                                    checkingOut={checkingOut}
                                    disabled={
                                        selectedItems.length === 0 ||
                                        hasUnavailableItems ||
                                        updatingItemId !== null ||
                                        removingItemId !== null ||
                                        deletingSelected
                                    }
                                />

                                {hasUnavailableItems && (
                                    <p style={styles.warning}>
                                        One or more selected products have
                                        insufficient stock. Adjust the quantity
                                        or remove the product before checkout.
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        color: '#0f172a'
    },
    container: {
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '28px 24px 64px'
    },
    breadcrumb: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        fontSize: '13px',
        color: '#64748b',
        marginBottom: '28px'
    },
    link: {
        color: '#0f766e',
        textDecoration: 'none'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
    },
    title: {
        fontSize: 'clamp(28px, 4vw, 36px)',
        margin: '0 0 8px'
    },
    subtitle: {
        margin: 0,
        color: '#64748b',
        lineHeight: 1.6
    },
    count: {
        fontSize: '13px',
        color: '#115e59',
        backgroundColor: '#ccfbf1',
        padding: '8px 12px',
        borderRadius: '999px'
    },
    message: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 16px',
        marginBottom: '20px',
        borderRadius: '8px',
        backgroundColor: '#dcfce7',
        color: '#166534'
    },
    error: {
        backgroundColor: '#fee2e2',
        color: '#991b1b'
    },
    dismiss: {
        border: 'none',
        background: 'transparent',
        color: 'inherit',
        cursor: 'pointer',
        fontSize: '20px'
    },
    bulkActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '20px',
        padding: '14px 16px',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        backgroundColor: '#fff'
    },
    selectAll: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: '600',
        fontSize: '14px',
        cursor: 'pointer'
    },
    checkbox: {
        width: '17px',
        height: '17px',
        accentColor: '#0f766e',
        cursor: 'pointer'
    },
    selectionCount: {
        color: '#64748b',
        fontSize: '13px',
        flex: 1
    },
    deleteButton: {
        border: '1px solid #fecaca',
        borderRadius: '8px',
        backgroundColor: '#fff',
        color: '#dc2626',
        padding: '10px 14px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    disabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    warning: {
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: '#fef3c7',
        color: '#92400e',
        fontSize: '13px',
        lineHeight: 1.6
    },
    loading: {
        padding: '60px 0',
        textAlign: 'center',
        color: '#64748b'
    }
}

export default Cart

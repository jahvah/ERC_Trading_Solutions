
const formatPrice = amount =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(Number(amount) || 0)

function CartItem({
    cartItem,
    selected,
    onToggleSelect,
    onUpdateQuantity,
    onRemove,
    updating,
    removing
}) {
    const item = cartItem.item

    if (!item) {
        return (
            <article style={styles.card} className="cart-item-card">
                <span>Product unavailable</span>
                <button
                    type="button"
                    onClick={() => onRemove(cartItem.item?._id)}
                    disabled={removing}
                >
                    Remove
                </button>
            </article>
        )
    }

    const stock = Number(item.stock?.quantity ?? 0)
    const quantity = Number(cartItem.quantity)
    const price = Number(item.sell_price) || 0

    const image = (item.images || []).find(
        entry => !entry.deleted_at && entry.image_path
    )?.image_path

    const unavailable =
        item.deleted_at != null ||
        stock < 1 ||
        quantity > stock

    return (
        <article
            className="cart-item-card"
            style={{
                ...styles.card,
                ...(selected ? styles.selectedCard : {})
            }}
        >
            <label style={styles.checkboxLabel}>
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleSelect(item._id)}
                    style={styles.checkbox}
                    aria-label={`Select ${item.item_name}`}
                />
            </label>

            <div
                className="cart-item-image"
                style={styles.imageContainer}
            >
                {image ? (
                    <img
                        src={image}
                        alt={item.item_name}
                        style={styles.image}
                    />
                ) : (
                    <div style={styles.placeholder}>No image</div>
                )}
            </div>

            <div style={styles.details}>
                <div className="cart-item-top-row" style={styles.topRow}>
                    <div>
                        <p style={styles.category}>
                            {item.category || 'Product'}
                        </p>

                        <h3
                            className="cart-item-name"
                            style={styles.name}
                        >
                            {item.item_name}
                        </h3>
                    </div>

                    <button
                        type="button"
                        style={styles.removeButton}
                        disabled={removing}
                        onClick={() => onRemove(item._id)}
                    >
                        {removing ? 'Removing...' : 'Remove'}
                    </button>
                </div>

                <p style={styles.price}>
                    {formatPrice(price)} <span style={styles.muted}>/ unit</span>
                </p>

                <p style={styles.stock}>
                    {unavailable
                        ? `Insufficient stock (${stock} available)`
                        : `${stock} available`}
                </p>

                <div style={styles.bottomRow}>
                    <div style={styles.quantityControl}>
                        <button
                            type="button"
                            disabled={updating || quantity <= 1}
                            onClick={() =>
                                onUpdateQuantity(item._id, quantity - 1)
                            }
                            style={styles.quantityButton}
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>

                        <span style={styles.quantity}>{quantity}</span>

                        <button
                            type="button"
                            disabled={
                                updating || unavailable || quantity >= stock
                            }
                            onClick={() =>
                                onUpdateQuantity(item._id, quantity + 1)
                            }
                            style={styles.quantityButton}
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>

                    <strong style={styles.subtotal}>
                        {formatPrice(price * quantity)}
                    </strong>
                </div>

                {updating && (
                    <p style={styles.status}>Updating quantity...</p>
                )}
            </div>
        </article>
    )
}

const styles = {
    card: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        marginBottom: '16px',
        minWidth: 0
    },
    selectedCard: {
        borderColor: '#0f766e',
        backgroundColor: '#f0fdfa'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0
    },
    checkbox: {
        width: '18px',
        height: '18px',
        accentColor: '#0f766e',
        cursor: 'pointer'
    },
    imageContainer: {
        width: '110px',
        height: '110px',
        flexShrink: 0,
        overflow: 'hidden',
        borderRadius: '10px',
        backgroundColor: '#f1f5f9'
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    placeholder: {
        width: '100%',
        height: '100%',
        display: 'grid',
        placeItems: 'center',
        color: '#94a3b8',
        fontSize: '12px'
    },
    details: {
        flex: 1,
        minWidth: 0
    },
    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px'
    },
    category: {
        margin: '0 0 5px',
        color: '#64748b',
        fontSize: '12px',
        textTransform: 'uppercase'
    },
    name: {
        margin: '0 0 8px',
        fontSize: '17px',
        overflowWrap: 'anywhere'
    },
    removeButton: {
        border: 'none',
        background: 'transparent',
        color: '#dc2626',
        cursor: 'pointer',
        fontSize: '13px'
    },
    price: {
        margin: '0 0 5px',
        fontWeight: '700'
    },
    muted: {
        color: '#64748b',
        fontWeight: '400',
        fontSize: '12px'
    },
    stock: {
        margin: '0 0 14px',
        color: '#64748b',
        fontSize: '13px'
    },
    bottomRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
    },
    quantityControl: {
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        overflow: 'hidden'
    },
    quantityButton: {
        width: '34px',
        height: '32px',
        border: 'none',
        backgroundColor: '#f8fafc',
        cursor: 'pointer',
        fontSize: '18px'
    },
    quantity: {
        minWidth: '36px',
        textAlign: 'center'
    },
    subtotal: {
        fontSize: '16px'
    },
    status: {
        fontSize: '12px',
        color: '#64748b'
    }
}

export default CartItem

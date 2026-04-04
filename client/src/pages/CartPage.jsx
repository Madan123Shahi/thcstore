// CartPage.jsx
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';
import { removeFromCart, updateQuantity, selectCartItems, selectCartSubtotal, selectCartShipping, selectCartTax, selectCartTotal } from '../store/slices/cartSlice';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { useAuth } from '../hooks';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const shipping = useSelector(selectCartShipping);
  const tax = useSelector(selectCartTax);
  const total = useSelector(selectCartTotal);
  const { isLoggedIn } = useAuth();

  if (items.length === 0) {
    return (
      <div className="page-container py-20 text-center animate-fade-in">
        <FiShoppingBag className="text-6xl text-gray-200 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
        <p className="text-gray-400 mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary px-8 py-3">Shop Products</Link>
      </div>
    );
  }

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="section-heading text-2xl mb-6">Shopping Cart ({items.reduce((a, i) => a + i.quantity, 0)} items)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product._id} className="card p-4 flex gap-4">
              <img src={getImageUrl(product.images?.[0]?.url)} alt={product.name} className="w-24 h-24 object-cover rounded-xl bg-gray-50 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary-600 font-semibold">{product.brand}</p>
                <Link to={`/products/${product.slug || product._id}`} className="font-semibold text-gray-900 hover:text-primary-700 transition-colors line-clamp-2 text-sm">{product.name}</Link>
                {product.volume && <p className="text-xs text-gray-400 mt-0.5">{product.volume}</p>}
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => dispatch(updateQuantity({ productId: product._id, quantity: quantity - 1 }))} className="px-3 py-2 text-gray-600 hover:bg-gray-50">
                      <FiMinus className="text-xs" />
                    </button>
                    <span className="px-4 py-2 font-semibold text-sm">{quantity}</span>
                    <button onClick={() => dispatch(updateQuantity({ productId: product._id, quantity: quantity + 1 }))} disabled={quantity >= product.stock} className="px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                      <FiPlus className="text-xs" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{formatPrice(product.price * quantity)}</span>
                    <button onClick={() => dispatch(removeFromCart(product._id))} className="text-red-400 hover:text-red-600 transition-colors">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit space-y-4">
          <h2 className="font-display font-bold text-gray-900 text-xl">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'text-primary-600 font-medium' : ''}>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-gray-600"><span>Tax (5%)</span><span>{formatPrice(tax)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-3 border-t border-gray-100">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
          {subtotal < 999 && (
            <p className="text-xs text-primary-600 bg-primary-50 rounded-xl p-2.5 text-center">
              Add {formatPrice(999 - subtotal)} more for free shipping!
            </p>
          )}
          <button onClick={() => navigate(isLoggedIn ? '/checkout' : '/login')} className="btn-primary w-full py-3">
            Proceed to Checkout
          </button>
          <Link to="/products" className="btn-secondary w-full py-2.5 text-sm text-center block">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

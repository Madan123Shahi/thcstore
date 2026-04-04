import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiShoppingBag, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { setCartOpen } from '../../store/slices/uiSlice';
import {
  selectCartItems, selectCartSubtotal, selectCartShipping,
  selectCartTax, selectCartTotal,
  removeFromCart, updateQuantity,
} from '../../store/slices/cartSlice';
import { formatPrice, getImageUrl } from '../../utils/helpers';
import { useAuth } from '../../hooks';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector(s => s.ui.isCartOpen);
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const shipping = useSelector(selectCartShipping);
  const tax = useSelector(selectCartTax);
  const total = useSelector(selectCartTotal);
  const { isLoggedIn } = useAuth();

  const close = () => dispatch(setCartOpen(false));

  const handleCheckout = () => {
    close();
    navigate(isLoggedIn ? '/checkout' : '/login');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" onClick={close} />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FiShoppingBag className="text-primary-600 text-xl" />
            <h2 className="font-display font-bold text-gray-900 text-lg">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((a, i) => a + i.quantity, 0)}
              </span>
            )}
          </div>
          <button onClick={close} className="btn-ghost p-2">
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <FiShoppingBag className="text-3xl text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-sm text-gray-400">Discover our premium hemp &amp; CBD products</p>
              <Link to="/products" onClick={close} className="btn-primary text-sm px-6 py-2.5">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product._id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                  <img
                    src={getImageUrl(product.images?.[0]?.url)}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg shrink-0 bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${product.slug || product._id}`}
                      onClick={close}
                      className="text-sm font-semibold text-gray-800 hover:text-primary-700 transition-colors line-clamp-2 leading-tight"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary-700">{formatPrice(product.price * quantity)}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => dispatch(updateQuantity({ productId: product._id, quantity: quantity - 1 }))}
                          className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:text-primary-700 border border-gray-200 transition-colors"
                        >
                          <FiMinus className="text-xs" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
                        <button
                          onClick={() => dispatch(updateQuantity({ productId: product._id, quantity: quantity + 1 }))}
                          disabled={quantity >= product.stock}
                          className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:text-primary-700 border border-gray-200 transition-colors disabled:opacity-40"
                        >
                          <FiPlus className="text-xs" />
                        </button>
                        <button
                          onClick={() => dispatch(removeFromCart(product._id))}
                          className="w-6 h-6 ml-1 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-5 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-primary-600 font-medium' : ''}>
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (5%)</span><span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>
            {subtotal < 999 && (
              <p className="text-xs text-center text-primary-600 bg-primary-50 rounded-xl p-2">
                Add {formatPrice(999 - subtotal)} more for free shipping!
              </p>
            )}
            <button onClick={handleCheckout} className="btn-primary w-full text-sm py-3">
              Proceed to Checkout
            </button>
            <Link to="/cart" onClick={close} className="btn-secondary w-full text-sm py-2.5 text-center block">
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

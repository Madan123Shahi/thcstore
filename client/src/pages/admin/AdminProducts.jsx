import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { fetchProducts, deleteProduct } from "../../store/slices/productSlice";
import { formatPrice, getImageUrl } from "../../utils/helpers";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageLoader } from "../../components/common";
import toast from "react-hot-toast";

export default function AdminProducts() {
  const dispatch = useDispatch();
  const {
    list: products,
    loading,
    pagination,
  } = useSelector((s) => s.products);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const q = { page, limit: 20 };
    if (search) q.search = search;
    dispatch(fetchProducts(q));
  }, [dispatch, page, search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    setDeleting(id);
    const res = await dispatch(deleteProduct(id));
    setDeleting(null);
    if (!res.error) toast.success("Product deleted");
    else toast.error(res.payload);
  };

  return (
    <AdminLayout title="Products">
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
        <Link
          to="/admin/products/new"
          className="btn-primary text-sm px-4 py-2.5 shrink-0"
        >
          <FiPlus /> Add Product
        </Link>
      </div>

      {loading && products.length === 0 ? (
        <PageLoader />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden sm:table-cell">
                    Brand
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                    Price
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden sm:table-cell">
                    Stock
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* ✅ thumbnail for admin table — tiny, fast */}
                        <img
                          src={getImageUrl(
                            p.images?.[0]?.thumbnail || p.images?.[0]?.url,
                          )}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 line-clamp-1">
                            {p.name}
                          </p>
                          <div className="flex gap-1 mt-0.5">
                            {p.isFeatured && (
                              <span className="badge bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5">
                                Featured
                              </span>
                            )}
                            {p.requiresPrescription && (
                              <span className="badge bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5">
                                Rx
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {p.brand}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {p.category?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-gray-900">
                        {formatPrice(p.price)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span
                        className={`font-medium ${p.stock === 0 ? "text-red-500" : p.stock <= 5 ? "text-orange-500" : "text-gray-700"}`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${p._id}/edit`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <FiEdit2 className="text-sm" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          disabled={deleting === p._id}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing {(page - 1) * 20 + 1}–
                {Math.min(page * 20, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === pagination.pages}
                  className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

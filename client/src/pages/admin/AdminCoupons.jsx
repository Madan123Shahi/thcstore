import { useEffect, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../utils/api";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  code: "",
  discountType: "percentage",
  value: "",
  minOrder: "",
  maxDiscount: "",
  expiry: "",
  usageLimit: "",
  description: "",
  isActive: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get("/coupons");
      setCoupons(data);
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (coupon) => {
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value,
      minOrder: coupon.minOrder || "",
      maxDiscount: coupon.maxDiscount || "",
      expiry: coupon.expiry?.split("T")[0] || "",
      usageLimit: coupon.usageLimit || "",
      description: coupon.description || "",
      isActive: coupon.isActive,
    });
    setEditId(coupon._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountType || !form.expiry) {
      toast.error("Code, type and expiry are required");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const { data } = await api.put(`/coupons/${editId}`, form);
        setCoupons((c) => c.map((x) => (x._id === editId ? data : x)));
        toast.success("Coupon updated");
      } else {
        const { data } = await api.post("/coupons", form);
        setCoupons((c) => [data, ...c]);
        toast.success("Coupon created");
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${id}`);
      setCoupons((c) => c.filter((x) => x._id !== id));
      toast.success("Coupon deleted");
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await api.patch(`/coupons/${id}/toggle`);
      setCoupons((c) => c.map((x) => (x._id === id ? data : x)));
      toast.success(`Coupon ${data.isActive ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to toggle coupon");
    }
  };

  const discountLabel = (c) => {
    if (c.discountType === "percentage")
      return `${c.value}% off${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ""}`;
    if (c.discountType === "flat") return `₹${c.value} off`;
    if (c.discountType === "free_shipping") return "Free shipping";
    return "—";
  };

  return (
    <AdminLayout title="Coupons">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-400">{coupons.length} coupons</p>
        <button
          onClick={openCreate}
          className="btn-primary text-sm px-4 py-2.5 flex items-center gap-1.5"
        >
          <FiPlus /> Create Coupon
        </button>
      </div>

      {/* ── Coupon Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-5">
                {editId ? "Edit Coupon" : "Create Coupon"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Code */}
                  <div className="col-span-2">
                    <label className="label">Coupon Code *</label>
                    <input
                      value={form.code}
                      onChange={(e) =>
                        set("code", e.target.value.toUpperCase())
                      }
                      className="input-field uppercase font-mono"
                      placeholder="SUMMER20"
                      disabled={!!editId}
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="label">Discount Type *</label>
                    <select
                      value={form.discountType}
                      onChange={(e) => set("discountType", e.target.value)}
                      className="input-field"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat (₹)</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>

                  {/* Value */}
                  {form.discountType !== "free_shipping" && (
                    <div>
                      <label className="label">
                        {form.discountType === "percentage"
                          ? "Discount %"
                          : "Discount ₹"}{" "}
                        *
                      </label>
                      <input
                        type="number"
                        value={form.value}
                        onChange={(e) => set("value", e.target.value)}
                        className="input-field"
                        placeholder={
                          form.discountType === "percentage" ? "20" : "100"
                        }
                        min={0}
                        max={
                          form.discountType === "percentage" ? 100 : undefined
                        }
                      />
                    </div>
                  )}

                  {/* Min Order */}
                  <div>
                    <label className="label">Min Order (₹)</label>
                    <input
                      type="number"
                      value={form.minOrder}
                      onChange={(e) => set("minOrder", e.target.value)}
                      className="input-field"
                      placeholder="0"
                      min={0}
                    />
                  </div>

                  {/* Max Discount */}
                  {form.discountType === "percentage" && (
                    <div>
                      <label className="label">Max Discount (₹)</label>
                      <input
                        type="number"
                        value={form.maxDiscount}
                        onChange={(e) => set("maxDiscount", e.target.value)}
                        className="input-field"
                        placeholder="500"
                        min={0}
                      />
                    </div>
                  )}

                  {/* Expiry */}
                  <div>
                    <label className="label">Expiry Date *</label>
                    <input
                      type="date"
                      value={form.expiry}
                      onChange={(e) => set("expiry", e.target.value)}
                      className="input-field"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  {/* Usage Limit */}
                  <div>
                    <label className="label">Usage Limit</label>
                    <input
                      type="number"
                      value={form.usageLimit}
                      onChange={(e) => set("usageLimit", e.target.value)}
                      className="input-field"
                      placeholder="Unlimited"
                      min={1}
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <label className="label">Description</label>
                    <input
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      className="input-field"
                      placeholder="e.g. 20% off on orders above ₹500"
                    />
                  </div>

                  {/* Active toggle */}
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => set("isActive", e.target.checked)}
                      className="w-4 h-4 rounded text-primary-600"
                      id="isActive"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex-1 py-2.5 disabled:opacity-60"
                  >
                    {saving
                      ? "Saving…"
                      : editId
                        ? "Update Coupon"
                        : "Create Coupon"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary flex-1 py-2.5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Coupons Table ── */}
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-12">Loading...</p>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    "Code",
                    "Discount",
                    "Min Order",
                    "Expiry",
                    "Used",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-gray-900">
                        {c.code}
                      </span>
                      {c.description && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {c.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {discountLabel(c)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {c.minOrder > 0 ? `₹${c.minOrder}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      <span
                        className={
                          new Date(c.expiry) < new Date() ? "text-red-500" : ""
                        }
                      >
                        {new Date(c.expiry).toLocaleDateString("en-IN")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {c.usedCount}
                      {c.usageLimit ? `/${c.usageLimit}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(c._id)}>
                        {c.isActive ? (
                          <FiToggleRight className="text-2xl text-primary-600" />
                        ) : (
                          <FiToggleLeft className="text-2xl text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <FiEdit2 className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id, c.code)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No coupons yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

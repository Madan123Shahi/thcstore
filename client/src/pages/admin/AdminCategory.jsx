import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import AdminLayout from "../../components/layout/AdminLayout"; // adjust path to match your project
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearCategoryError,
} from "../../store/slices/categorySlice";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
  isActive: true,
  sortOrder: 0,
};

export default function AdminCategories() {
  const dispatch = useDispatch();
  const { list: categories, loading, error } = useSelector((state) => state.categories);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(category) {
    setEditingId(category._id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
      isActive: category.isActive,
      sortOrder: category.sortOrder || 0,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    dispatch(clearCategoryError());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await dispatch(updateCategory({ id: editingId, data: form }));
    } else {
      await dispatch(createCategory(form));
    }
    closeForm();
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this category?")) return;
    dispatch(deleteCategory(id));
  }

  return (
    <AdminLayout title="Categories">
      {/* Search + Add bar */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="relative w-full max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <FiPlus /> Add Category
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      {/* Inline create/edit form */}
      {showForm && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">
              {editingId ? "Edit Category" : "New Category"}
            </h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
              <FiX />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            <input
              name="slug"
              placeholder="Slug"
              value={form.slug}
              onChange={handleChange}
              required
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            <input
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 md:col-span-2"
            />
            <input
              name="image"
              placeholder="Image URL"
              value={form.image}
              onChange={handleChange}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            <input
              name="sortOrder"
              type="number"
              placeholder="Sort Order"
              value={form.sortOrder}
              onChange={handleChange}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2">
              <input
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={handleChange}
                className="rounded"
              />
              Active
            </label>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="text-gray-600 hover:bg-gray-100 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="text-left px-6 py-4">Name</th>
              <th className="text-left px-6 py-4">Slug</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Sort Order</th>
              <th className="text-right px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  No categories found
                </td>
              </tr>
            ) : (
              filtered.map((cat) => (
                <tr key={cat._id} className="border-t border-gray-100">
                  <td className="px-6 py-4 font-medium text-gray-800">{cat.name}</td>
                  <td className="px-6 py-4 text-gray-500">{cat.slug}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        cat.isActive
                          ? "bg-primary-100 text-primary-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{cat.sortOrder}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditForm(cat)}
                      className="text-gray-400 hover:text-primary-600 p-1.5 inline-flex"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-gray-400 hover:text-red-600 p-1.5 inline-flex"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

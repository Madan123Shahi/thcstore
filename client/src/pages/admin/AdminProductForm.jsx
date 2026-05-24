import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiUpload } from "react-icons/fi";
import {
  fetchProduct,
  createProduct,
  updateProduct,
  clearCurrent,
} from "../../store/slices/productSlice";
import { fetchCategories } from "../../store/slices/categorySlice";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageLoader } from "../../components/common";
import toast from "react-hot-toast";

// ─── Stable ID generator (no dependency needed) ───────────────────────────────
let _id = 0;
const uid = () => `img_${++_id}_${Date.now()}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeImage = () => ({
  id: uid(),
  file: null,
  preview: "",
  alt: "",
  existing: "",
});
const makeSpec = () => ({ id: uid(), key: "", value: "" });
const makeFeat = () => ({ id: uid(), value: "" });

// ─── Field outside component — prevents re-mount on every render ──────────────
const Field = ({ label, children, required }) => (
  <div>
    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const MAX_IMAGES = 10;

const BLANK = {
  name: "",
  brand: "",
  category: "",
  shortDescription: "",
  description: "",
  price: "",
  mrp: "",
  stock: "",
  sku: "",
  volume: "",
  weight: "",
  thcContent: "",
  cbdContent: "",
  requiresPrescription: false,
  isAyushApproved: false,
  labTested: true,
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
  isActive: true,
  images: [makeImage()],
  features: [makeFeat()],
  tags: "",
  specifications: [makeSpec()],
};

export default function AdminProductForm() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isEdit = !!id;
  const bulkInputRef = useRef(null);

  const { current, loading } = useSelector((s) => s.products);
  const { list: categories } = useSelector((s) => s.categories);

  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  // ─── Revoke all object URLs on unmount to prevent memory leaks ────────────
  useEffect(() => {
    return () => {
      form.images.forEach((img) => {
        if (img.preview && !img.existing) URL.revokeObjectURL(img.preview);
      });
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit) dispatch(fetchProduct(id));
    return () => dispatch(clearCurrent());
  }, [id, isEdit, dispatch]);

  useEffect(() => {
    if (isEdit && current) {
      setForm({
        ...BLANK,
        ...current,
        category: current.category?._id || current.category || "",
        tags: Array.isArray(current.tags)
          ? current.tags.join(", ")
          : current.tags || "",
        images: current.images?.length
          ? current.images.map((img) => ({
              id: uid(),
              file: null,
              preview: img.url || "",
              alt: img.alt || "",
              existing: img.url || "",
            }))
          : [makeImage()],
        features: current.features?.length
          ? current.features.map((v) => ({ id: uid(), value: v }))
          : [makeFeat()],
        specifications: current.specifications?.length
          ? current.specifications.map((s) => ({
              id: uid(),
              key: s.key,
              value: s.value,
            }))
          : [makeSpec()],
      });
    }
  }, [current, isEdit]);

  // ─── Scalar setter ────────────────────────────────────────────────────────
  const set = useCallback(
    (key, val) => setForm((f) => ({ ...f, [key]: val })),
    [],
  );

  // ─── Bulk image upload ────────────────────────────────────────────────────
  const handleBulkUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setForm((f) => {
      const kept = f.images.filter((img) => img.preview || img.existing);
      const slots = MAX_IMAGES - kept.length;
      if (slots <= 0) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        return f;
      }
      const newImgs = files.slice(0, slots).map((file) => ({
        id: uid(),
        file,
        preview: URL.createObjectURL(file),
        alt: "",
        existing: "",
      }));
      if (files.length > slots) {
        toast.error(
          `Only ${slots} more image(s) allowed. ${files.length - slots} skipped.`,
        );
      }
      return { ...f, images: [...kept, ...newImgs] };
    });

    // Reset so same files can be re-selected
    e.target.value = "";
  }, []);

  // ─── Single image slot handlers ───────────────────────────────────────────
  const handleImageFile = useCallback((imgId, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm((f) => ({
      ...f,
      images: f.images.map((img) =>
        img.id === imgId ? { ...img, file, preview, existing: "" } : img,
      ),
    }));
  }, []);

  const handleImageAlt = useCallback((imgId, alt) => {
    setForm((f) => ({
      ...f,
      images: f.images.map((img) => (img.id === imgId ? { ...img, alt } : img)),
    }));
  }, []);

  const removeImage = useCallback((imgId) => {
    setForm((f) => {
      const target = f.images.find((img) => img.id === imgId);
      if (target?.preview && !target.existing)
        URL.revokeObjectURL(target.preview);
      const updated = f.images.filter((img) => img.id !== imgId);
      return { ...f, images: updated.length ? updated : [makeImage()] };
    });
  }, []);

  // ─── Feature handlers ─────────────────────────────────────────────────────
  const handleFeatureChange = useCallback((featId, val) => {
    setForm((f) => ({
      ...f,
      features: f.features.map((fi) =>
        fi.id === featId ? { ...fi, value: val } : fi,
      ),
    }));
  }, []);

  const addFeature = useCallback(() => {
    setForm((f) => ({ ...f, features: [...f.features, makeFeat()] }));
  }, []);

  const removeFeature = useCallback((featId) => {
    setForm((f) => ({
      ...f,
      features: f.features.filter((fi) => fi.id !== featId),
    }));
  }, []);

  // ─── Spec handlers ────────────────────────────────────────────────────────
  const handleSpecChange = useCallback((specId, field, val) => {
    setForm((f) => ({
      ...f,
      specifications: f.specifications.map((s) =>
        s.id === specId ? { ...s, [field]: val } : s,
      ),
    }));
  }, []);

  const addSpec = useCallback(() => {
    setForm((f) => ({
      ...f,
      specifications: [...f.specifications, makeSpec()],
    }));
  }, []);

  const removeSpec = useCallback((specId) => {
    setForm((f) => ({
      ...f,
      specifications: f.specifications.filter((s) => s.id !== specId),
    }));
  }, []);

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !form.name ||
      !form.brand ||
      !form.category ||
      !form.price ||
      !form.mrp ||
      !form.description
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (Number(form.price) > Number(form.mrp)) {
      toast.error("Selling price cannot exceed MRP");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category,
        shortDescription: form.shortDescription,
        description: form.description,
        price: Number(form.price),
        mrp: Number(form.mrp),
        stock: Number(form.stock) || 0,
        sku: form.sku.trim(),
        volume: form.volume,
        weight: form.weight,
        thcContent: form.thcContent,
        cbdContent: form.cbdContent,
        requiresPrescription: form.requiresPrescription,
        isAyushApproved: form.isAyushApproved,
        labTested: form.labTested,
        isFeatured: form.isFeatured,
        isBestSeller: form.isBestSeller,
        isNewArrival: form.isNewArrival,
        isActive: form.isActive,

        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],

        features: form.features.map((f) => f.value.trim()).filter(Boolean),

        specifications: form.specifications
          .filter((s) => s.key && s.value)
          .map(({ key, value }) => ({
            key: key.trim(),
            value: value.trim(),
          })),

        existingImages: form.images
          .filter((img) => img.existing && !img.file)
          .map((img) => ({
            url: img.existing,
            alt: img.alt,
          })),

        imageAlts: form.images.map((img) => img.alt),
      };

      // Append JSON data
      formData.append("data", JSON.stringify(payload));

      // Append image files
      form.images.forEach((img, i) => {
        if (img.file) {
          formData.append("images", img.file);
          formData.append(`imageIndex_${i}`, String(i));
        }
      });

      // Dispatch Action
      const resultAction = isEdit
        ? await dispatch(
            updateProduct({
              id,
              data: formData,
            }),
          )
        : await dispatch(createProduct(formData));

      // Handle Success/Error
      if (
        createProduct.fulfilled.match(resultAction) ||
        updateProduct.fulfilled.match(resultAction)
      ) {
        toast.success(`Product ${isEdit ? "updated" : "created"} successfully`);

        navigate("/admin/products");
      } else {
        console.log("❌ resultAction:", resultAction); // ← add this
        const errMsg = resultAction?.payload;
        toast.error(
          typeof errMsg === "string"
            ? errMsg
            : `Failed to ${isEdit ? "update" : "create"} product`,
        );
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && loading && !current)
    return (
      <AdminLayout>
        <PageLoader />
      </AdminLayout>
    );

  return (
    <AdminLayout title={isEdit ? "Edit Product" : "Add Product"}>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* ── Basic Information ───────────────────────────────────────── */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Product Name" required>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="input-field"
                placeholder="Full product name"
              />
            </Field>
            <Field label="Brand" required>
              <input
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                className="input-field"
                placeholder="Brand name"
              />
            </Field>
            <Field label="Category" required>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="input-field"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="SKU">
              <input
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                className="input-field"
                placeholder="Unique SKU"
              />
            </Field>
          </div>
          <Field label="Short Description">
            <input
              value={form.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
              className="input-field"
              placeholder="Brief one-liner"
            />
          </Field>
          <Field label="Full Description" required>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="input-field resize-none"
              rows={5}
              placeholder="Detailed product description"
            />
          </Field>
        </div>

        {/* ── Pricing & Stock ─────────────────────────────────────────── */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Pricing & Stock</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Selling Price (₹)" required>
              <input
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                className="input-field"
                placeholder="0"
                min={0}
              />
            </Field>
            <Field label="MRP (₹)" required>
              <input
                type="number"
                value={form.mrp}
                onChange={(e) => set("mrp", e.target.value)}
                className="input-field"
                placeholder="0"
                min={0}
              />
            </Field>
            <Field label="Stock Qty">
              <input
                type="number"
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
                className="input-field"
                placeholder="0"
                min={0}
              />
            </Field>
            <Field label="Volume">
              <input
                value={form.volume}
                onChange={(e) => set("volume", e.target.value)}
                className="input-field"
                placeholder="e.g. 30ml"
              />
            </Field>
            <Field label="Weight">
              <input
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
                className="input-field"
                placeholder="e.g. 100g"
              />
            </Field>
          </div>
        </div>

        {/* ── Cannabis Info ────────────────────────────────────────────── */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Cannabis Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="CBD Content">
              <input
                value={form.cbdContent}
                onChange={(e) => set("cbdContent", e.target.value)}
                className="input-field"
                placeholder="e.g. 1500mg"
              />
            </Field>
            <Field label="THC Content">
              <input
                value={form.thcContent}
                onChange={(e) => set("thcContent", e.target.value)}
                className="input-field"
                placeholder="e.g. 150mg"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: "requiresPrescription", label: "Prescription Required" },
              { key: "isAyushApproved", label: "AYUSH Approved" },
              { key: "labTested", label: "Lab Tested" },
              { key: "isFeatured", label: "Featured" },
              { key: "isBestSeller", label: "Best Seller" },
              { key: "isNewArrival", label: "New Arrival" },
              { key: "isActive", label: "Active (visible)" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-400"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Images ──────────────────────────────────────────────────── */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Images
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({form.images.filter((i) => i.preview || i.existing).length}/
                {MAX_IMAGES})
              </span>
            </h3>
            {/* ── Single bulk upload button only ── */}
            <label className="flex items-center gap-2 px-3 py-1.5 btn-secondary text-sm cursor-pointer rounded-lg">
              <FiUpload className="text-sm" />
              Upload Images
              <input
                ref={bulkInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleBulkUpload}
              />
            </label>
          </div>

          {/* Image slots — no per-slot file input, thumbnail click swaps via its own hidden input */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {form.images.map((img) => (
                <div key={img.id} className="relative group">
                  {/* Thumbnail — clicking opens a SINGLE-file picker just for this slot */}
                  <label className="relative block w-full aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-primary-400 cursor-pointer overflow-hidden transition-colors">
                    {img.preview ? (
                      <>
                        <img
                          src={img.preview}
                          alt={img.alt || "preview"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
                          <FiUpload className="text-white text-lg" />
                          <span className="text-white text-[10px] font-medium">
                            Replace
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-300 group-hover:text-primary-400 transition-colors">
                        <FiUpload className="text-2xl" />
                        <span className="text-[10px] font-medium">
                          Click to upload
                        </span>
                      </div>
                    )}
                    {/* Single-file input — ONLY for replacing this specific slot */}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        handleImageFile(img.id, e.target.files[0])
                      }
                    />
                  </label>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <FiTrash2 className="text-[10px]" />
                  </button>

                  {/* Alt text below thumbnail */}
                  <input
                    value={img.alt}
                    onChange={(e) => handleImageAlt(img.id, e.target.value)}
                    className="input-field mt-1.5 text-xs py-1.5"
                    placeholder="Alt text"
                  />
                  {img.file && (
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate px-0.5">
                      {img.file.name}
                    </p>
                  )}
                  {img.existing && !img.file && (
                    <p className="text-[10px] text-green-600 mt-0.5 px-0.5">
                      Existing image
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty state — shown when no images yet */}
          {form.images.length === 0 && (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
              <FiUpload className="text-3xl mx-auto mb-2" />
              <p className="text-sm">
                Click "Upload Images" above to add photos
              </p>
            </div>
          )}
        </div>

        {/* ── Key Features ─────────────────────────────────────────────── */}
        <div className="card p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Key Features</h3>
          {form.features.map((f) => (
            <div key={f.id} className="flex gap-3">
              <input
                value={f.value}
                onChange={(e) => handleFeatureChange(f.id, e.target.value)}
                className="input-field flex-1"
                placeholder="e.g. Lab tested for purity"
              />
              {form.features.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFeature(f.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addFeature}
            className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5"
          >
            <FiPlus /> Add Feature
          </button>
        </div>

        {/* ── Specifications ───────────────────────────────────────────── */}
        <div className="card p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Specifications</h3>
          {form.specifications.map((spec) => (
            <div key={spec.id} className="flex gap-3">
              <input
                value={spec.key}
                onChange={(e) =>
                  handleSpecChange(spec.id, "key", e.target.value)
                }
                className="input-field flex-1"
                placeholder="Key (e.g. Flavor)"
              />
              <input
                value={spec.value}
                onChange={(e) =>
                  handleSpecChange(spec.id, "value", e.target.value)
                }
                className="input-field flex-1"
                placeholder="Value (e.g. Mango)"
              />
              {form.specifications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSpec(spec.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSpec}
            className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5"
          >
            <FiPlus /> Add Spec
          </button>
        </div>

        {/* ── Tags ────────────────────────────────────────────────────── */}
        <div className="card p-6">
          <Field label="Tags (comma-separated)">
            <input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              className="input-field"
              placeholder="cbd, oil, sleep, anxiety"
            />
          </Field>
        </div>

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-8 py-3"
          >
            {saving ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="btn-secondary px-6 py-3"
          >
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

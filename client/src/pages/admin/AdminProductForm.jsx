import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { fetchProduct, createProduct, updateProduct, clearCurrent } from '../../store/slices/productSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import AdminLayout from '../../components/layout/AdminLayout';
import { PageLoader } from '../../components/common';
import toast from 'react-hot-toast';

const BLANK = {
  name: '', brand: '', category: '', shortDescription: '', description: '',
  price: '', mrp: '', stock: '', sku: '', volume: '', weight: '',
  thcContent: '', cbdContent: '',
  requiresPrescription: false, isAyushApproved: false, labTested: true,
  isFeatured: false, isBestSeller: false, isNewArrival: false, isActive: true,
  images: [{ url: '', alt: '' }],
  features: [''],
  tags: '',
  specifications: [{ key: '', value: '' }],
};

export default function AdminProductForm() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { current, loading } = useSelector(s => s.products);
  const { list: categories } = useSelector(s => s.categories);

  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  useEffect(() => {
    if (isEdit) dispatch(fetchProduct(id));
    return () => dispatch(clearCurrent());
  }, [id, isEdit, dispatch]);

  useEffect(() => {
    if (isEdit && current) {
      setForm({
        ...BLANK,
        ...current,
        category: current.category?._id || current.category || '',
        tags: Array.isArray(current.tags) ? current.tags.join(', ') : current.tags || '',
        images: current.images?.length ? current.images : [{ url: '', alt: '' }],
        features: current.features?.length ? current.features : [''],
        specifications: current.specifications?.length ? current.specifications : [{ key: '', value: '' }],
      });
    }
  }, [current, isEdit]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.brand || !form.category || !form.price || !form.mrp) {
      toast.error('Please fill all required fields'); return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      mrp: Number(form.mrp),
      stock: Number(form.stock) || 0,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      images: form.images.filter(i => i.url),
      features: form.features.filter(Boolean),
      specifications: form.specifications.filter(s => s.key && s.value),
    };
    const res = isEdit
      ? await dispatch(updateProduct({ id, data: payload }))
      : await dispatch(createProduct(payload));
    setSaving(false);
    if (!res.error) {
      toast.success(`Product ${isEdit ? 'updated' : 'created'}!`);
      navigate('/admin/products');
    } else {
      toast.error(res.payload || 'Failed to save product');
    }
  };

  if (isEdit && loading && !current) return <AdminLayout><PageLoader /></AdminLayout>;

  const Field = ({ label, children, required }) => (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}{required && ' *'}</label>
      {children}
    </div>
  );

  return (
    <AdminLayout title={isEdit ? 'Edit Product' : 'Add Product'}>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

        {/* Basic info */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Product Name" required>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="input-field" placeholder="Full product name" required />
            </Field>
            <Field label="Brand" required>
              <input value={form.brand} onChange={e => set('brand', e.target.value)} className="input-field" placeholder="Brand name" required />
            </Field>
            <Field label="Category" required>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field" required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="SKU">
              <input value={form.sku} onChange={e => set('sku', e.target.value)} className="input-field" placeholder="Unique SKU" />
            </Field>
          </div>
          <Field label="Short Description">
            <input value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} className="input-field" placeholder="Brief one-liner" />
          </Field>
          <Field label="Full Description" required>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input-field resize-none" rows={5} placeholder="Detailed product description" required />
          </Field>
        </div>

        {/* Pricing & Stock */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Pricing & Stock</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Selling Price (₹)" required>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} className="input-field" placeholder="0" min={0} required />
            </Field>
            <Field label="MRP (₹)" required>
              <input type="number" value={form.mrp} onChange={e => set('mrp', e.target.value)} className="input-field" placeholder="0" min={0} required />
            </Field>
            <Field label="Stock Qty">
              <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} className="input-field" placeholder="0" min={0} />
            </Field>
            <Field label="Volume">
              <input value={form.volume} onChange={e => set('volume', e.target.value)} className="input-field" placeholder="e.g. 30ml" />
            </Field>
            <Field label="Weight">
              <input value={form.weight} onChange={e => set('weight', e.target.value)} className="input-field" placeholder="e.g. 100g" />
            </Field>
          </div>
        </div>

        {/* Cannabis info */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Cannabis Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="CBD Content">
              <input value={form.cbdContent} onChange={e => set('cbdContent', e.target.value)} className="input-field" placeholder="e.g. 1500mg" />
            </Field>
            <Field label="THC Content">
              <input value={form.thcContent} onChange={e => set('thcContent', e.target.value)} className="input-field" placeholder="e.g. 150mg" />
            </Field>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: 'requiresPrescription', label: 'Prescription Required' },
              { key: 'isAyushApproved', label: 'AYUSH Approved' },
              { key: 'labTested', label: 'Lab Tested' },
              { key: 'isFeatured', label: 'Featured' },
              { key: 'isBestSeller', label: 'Best Seller' },
              { key: 'isNewArrival', label: 'New Arrival' },
              { key: 'isActive', label: 'Active (visible)' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form[key]} onChange={e => set(key, e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-400" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="card p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Images</h3>
          {form.images.map((img, i) => (
            <div key={i} className="flex gap-3">
              <input value={img.url} onChange={e => set('images', form.images.map((im, j) => j === i ? { ...im, url: e.target.value } : im))}
                className="input-field flex-1" placeholder="Image URL" />
              <input value={img.alt} onChange={e => set('images', form.images.map((im, j) => j === i ? { ...im, alt: e.target.value } : im))}
                className="input-field w-32" placeholder="Alt text" />
              {form.images.length > 1 && (
                <button type="button" onClick={() => set('images', form.images.filter((_, j) => j !== i))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50">
                  <FiTrash2 className="text-sm" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => set('images', [...form.images, { url: '', alt: '' }])}
            className="btn-secondary text-sm py-2 px-4">
            <FiPlus /> Add Image
          </button>
        </div>

        {/* Features */}
        <div className="card p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Key Features</h3>
          {form.features.map((f, i) => (
            <div key={i} className="flex gap-3">
              <input value={f} onChange={e => set('features', form.features.map((fi, j) => j === i ? e.target.value : fi))}
                className="input-field flex-1" placeholder={`Feature ${i + 1}`} />
              {form.features.length > 1 && (
                <button type="button" onClick={() => set('features', form.features.filter((_, j) => j !== i))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50">
                  <FiTrash2 className="text-sm" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => set('features', [...form.features, ''])} className="btn-secondary text-sm py-2 px-4">
            <FiPlus /> Add Feature
          </button>
        </div>

        {/* Specifications */}
        <div className="card p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Specifications</h3>
          {form.specifications.map((spec, i) => (
            <div key={i} className="flex gap-3">
              <input value={spec.key} onChange={e => set('specifications', form.specifications.map((s, j) => j === i ? { ...s, key: e.target.value } : s))}
                className="input-field flex-1" placeholder="Key (e.g. Flavor)" />
              <input value={spec.value} onChange={e => set('specifications', form.specifications.map((s, j) => j === i ? { ...s, value: e.target.value } : s))}
                className="input-field flex-1" placeholder="Value (e.g. Mango)" />
              {form.specifications.length > 1 && (
                <button type="button" onClick={() => set('specifications', form.specifications.filter((_, j) => j !== i))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50">
                  <FiTrash2 className="text-sm" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => set('specifications', [...form.specifications, { key: '', value: '' }])} className="btn-secondary text-sm py-2 px-4">
            <FiPlus /> Add Spec
          </button>
        </div>

        {/* Tags */}
        <div className="card p-6">
          <Field label="Tags (comma-separated)">
            <input value={form.tags} onChange={e => set('tags', e.target.value)} className="input-field" placeholder="cbd, oil, sleep, anxiety" />
          </Field>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary px-8 py-3">
            {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary px-6 py-3">
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

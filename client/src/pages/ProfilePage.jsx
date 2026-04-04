import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiUser, FiMapPin, FiLock, FiPlus, FiCheck } from 'react-icons/fi';
import { updateProfile, addAddress } from '../store/slices/authSlice';
import { INDIAN_STATES } from '../utils/helpers';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'addresses', label: 'Addresses', icon: FiMapPin },
  { id: 'security', label: 'Security', icon: FiLock },
];

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(s => s.auth);
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ name: '', line1: '', line2: '', city: '', state: '', pincode: '', phone: '', isDefault: false });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const res = await dispatch(updateProfile(profileForm));
    if (!res.error) toast.success('Profile updated!');
    else toast.error(res.payload);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const required = ['name', 'line1', 'city', 'state', 'pincode', 'phone'];
    for (const f of required) {
      if (!addressForm[f].trim()) { toast.error(`${f} is required`); return; }
    }
    const res = await dispatch(addAddress(addressForm));
    if (!res.error) {
      toast.success('Address added!');
      setShowAddressForm(false);
      setAddressForm({ name: '', line1: '', line2: '', city: '', state: '', pincode: '', phone: '', isDefault: false });
    } else toast.error(res.payload);
  };

  return (
    <div className="page-container py-8 max-w-3xl mx-auto animate-fade-in">
      <h1 className="section-heading text-2xl mb-6">My Account</h1>

      {/* Tab nav */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 flex-1 justify-center py-2.5 px-4 rounded-xl text-sm font-medium transition-all
              ${tab === id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon className="text-sm" /> <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
              <span className="font-display font-bold text-primary-700 text-2xl">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
              {user?.role === 'admin' && <span className="badge-green mt-1">Admin</span>}
            </div>
          </div>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
              <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                className="input-field" placeholder="Your full name" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input value={user?.email} disabled className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
              <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                className="input-field" placeholder="10-digit mobile number" maxLength={10} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 text-sm">
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Addresses tab */}
      {tab === 'addresses' && (
        <div className="space-y-4">
          {user?.addresses?.map((addr, i) => (
            <div key={i} className="card p-5 flex items-start justify-between gap-4">
              <div>
                {addr.isDefault && <span className="badge-green mb-2">Default</span>}
                <p className="font-semibold text-gray-800">{addr.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{addr.line1}{addr.line2 && `, ${addr.line2}`}</p>
                <p className="text-sm text-gray-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-sm text-gray-500">📞 {addr.phone}</p>
              </div>
              {addr.isDefault && <FiCheck className="text-primary-600 shrink-0 mt-1" />}
            </div>
          ))}

          {showAddressForm ? (
            <form onSubmit={handleAddAddress} className="card p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">New Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'name', label: 'Full Name', ph: 'Name', span: 2 },
                  { name: 'line1', label: 'Address Line 1', ph: 'Flat, Street', span: 2 },
                  { name: 'line2', label: 'Address Line 2 (optional)', ph: 'Area, Colony', span: 2 },
                  { name: 'city', label: 'City', ph: 'City' },
                  { name: 'pincode', label: 'Pincode', ph: '400001' },
                  { name: 'phone', label: 'Phone', ph: '9999999999' },
                ].map(({ name, label, ph, span }) => (
                  <div key={name} className={span === 2 ? 'sm:col-span-2' : ''}>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                    <input name={name} value={addressForm[name]} onChange={e => setAddressForm(f => ({ ...f, [name]: e.target.value }))}
                      className="input-field" placeholder={ph} />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
                  <select value={addressForm.state} onChange={e => setAddressForm(f => ({ ...f, state: e.target.value }))} className="input-field">
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm(f => ({ ...f, isDefault: e.target.checked }))}
                      className="w-4 h-4 rounded text-primary-600" />
                    <span className="text-sm text-gray-700">Set as default address</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="btn-primary text-sm px-5 py-2.5">Save Address</button>
                <button type="button" onClick={() => setShowAddressForm(false)} className="btn-secondary text-sm px-5 py-2.5">Cancel</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowAddressForm(true)} className="btn-secondary w-full py-3 text-sm flex items-center justify-center gap-2">
              <FiPlus /> Add New Address
            </button>
          )}
        </div>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-5">Change Password</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (passForm.newPassword !== passForm.confirmPassword) { toast.error('Passwords do not match'); return; }
            if (passForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
            try {
              const api = (await import('../utils/api')).default;
              await api.put('/auth/password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
              toast.success('Password changed successfully!');
              setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } catch (err) {
              toast.error(err.response?.data?.error || 'Failed to change password');
            }
          }} className="space-y-4">
            {[
              { name: 'currentPassword', label: 'Current Password' },
              { name: 'newPassword', label: 'New Password' },
              { name: 'confirmPassword', label: 'Confirm New Password' },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                <input type="password" value={passForm[name]} onChange={e => setPassForm(f => ({ ...f, [name]: e.target.value }))}
                  className="input-field" placeholder="••••••••" required minLength={6} />
              </div>
            ))}
            <button type="submit" className="btn-primary text-sm px-6 py-2.5">Update Password</button>
          </form>
        </div>
      )}
    </div>
  );
}

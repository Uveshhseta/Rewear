import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  X,
  UploadCloud,
  AlertCircle,
  PackageCheck,
  ArrowLeft,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('women');
  const [gender, setGender] = useState('women');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('M');
  const [condition, setCondition] = useState('like_new');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [referencePrice, setReferencePrice] = useState(2500);
  const [estimatedSwapValue, setEstimatedSwapValue] = useState(1800);
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [exchangePreference, setExchangePreference] = useState('both');
  const [status, setStatus] = useState('available');

  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/api/listings/${id}`);
        if (res.data.success) {
          const l = res.data.listing;
          if (user && l.owner?._id !== user._id && user.role !== 'admin') {
            navigate('/dashboard');
            return;
          }
          setTitle(l.title);
          setDescription(l.description);
          setCategory(l.category);
          setGender(l.gender || 'unisex');
          setBrand(l.brand);
          setSize(l.size);
          setCondition(l.condition);
          setColor(l.color || '');
          setMaterial(l.material || '');
          setReferencePrice(l.referencePrice || 2500);
          setEstimatedSwapValue(l.estimatedSwapValue);
          setCity(l.city);
          setPostalCode(l.postalCode || '');
          setExchangePreference(l.exchangePreference || 'both');
          setStatus(l.status);
          setExistingImages(l.images || []);
        }
      } catch (err) {
        setError('Failed to load listing for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await api.put(`/api/listings/${id}`, {
        title,
        description,
        category,
        gender,
        brand,
        size,
        condition,
        color,
        material,
        referencePrice: Number(referencePrice),
        estimatedSwapValue: Number(estimatedSwapValue),
        city,
        postalCode,
        exchangePreference,
        status,
        imageUrls: existingImages,
      });

      if (res.data.success) {
        navigate(`/listings/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory-light">
        <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-light py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-charcoal/70 hover:text-forest mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>

        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-forest">Edit Clothing Listing</h1>
          <p className="text-xs text-charcoal/70 mt-1">Update specifications or status of your piece</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-forest/10 shadow-float space-y-6">
          
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal uppercase mb-1">Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-2.5"
              >
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="ethnic_wear">Ethnic Wear</option>
                <option value="shoes">Shoes</option>
                <option value="accessories">Accessories</option>
                <option value="kids">Kids</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal uppercase mb-1">Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-2.5"
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="Free Size">Free Size</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal uppercase mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-2.5"
              >
                <option value="new_with_tags">New with tags</option>
                <option value="like_new">Like new</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase mb-1">Swap Value (₹ INR)</label>
              <input
                type="number"
                min="50"
                value={estimatedSwapValue}
                onChange={(e) => setEstimatedSwapValue(e.target.value)}
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-2.5 font-bold text-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal uppercase mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-2.5 font-semibold"
              >
                <option value="available">Available</option>
                <option value="in_swap">In Swap</option>
                <option value="swapped">Swapped (Completed)</option>
                <option value="hidden">Hidden / Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-ivory">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 text-xs font-semibold border border-forest/20 rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-forest text-white text-xs font-semibold rounded-full hover:bg-forest-light"
            >
              {submitting ? 'Saving...' : 'Update Listing'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  X,
  Plus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  PackagePlus,
  Calculator,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
  const [city, setCity] = useState(user?.city || 'Mumbai');
  const [postalCode, setPostalCode] = useState(user?.postalCode || '');
  const [exchangePreference, setExchangePreference] = useState('both');

  // Images
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [manualImageUrls, setManualImageUrls] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Live auto-calculation whenever price, condition, category, or brand changes
  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        const res = await api.post('/api/listings/calculate-value', {
          referencePrice: Number(referencePrice) || 0,
          condition,
          category,
          brand,
        });
        if (res.data.success) {
          setEstimatedSwapValue(res.data.result.estimatedSwapValue);
        }
      } catch (err) {
        // silent fallback
      }
    };

    fetchEstimate();
  }, [referencePrice, condition, category, brand]);

  // Handle local file uploads
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setImageFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle image URL addition
  const handleAddUrl = () => {
    if (imageUrlInput.trim()) {
      setManualImageUrls((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleRemoveUrl = (index) => {
    setManualImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const totalImages = imageFiles.length + manualImageUrls.length;
    if (totalImages === 0) {
      setError('Please upload at least one photo of the garment.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('gender', gender);
      formData.append('brand', brand || 'Artisan Garment');
      formData.append('size', size);
      formData.append('condition', condition);
      formData.append('color', color || 'Various');
      formData.append('material', material || 'Cotton blend');
      formData.append('referencePrice', referencePrice);
      formData.append('estimatedSwapValue', estimatedSwapValue);
      formData.append('city', city);
      formData.append('postalCode', postalCode);
      formData.append('exchangePreference', exchangePreference);

      // Append files
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      // Append URLs if any
      manualImageUrls.forEach((url) => {
        formData.append('imageUrls', url);
      });

      const res = await api.post('/api/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        navigate(`/listings/${res.data.listing._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list garment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-light py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs uppercase font-bold tracking-widest text-earth">
            Circular Wardrobe
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">
            List a Pre-Loved Garment
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70 mt-1">
            Upload clear photos, provide honest condition details, and get an estimated swap value credit.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-forest/10 shadow-float space-y-8">
          
          {/* 1. Photos Upload Deck */}
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
              Garment Photographs *
            </label>
            <p className="text-[11px] text-charcoal/60 mb-3">
              Upload up to 5 clear photos showing front, back, brand label, and fabric texture.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {/* Previews */}
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-ivory border border-forest/15">
                  <img src={src} alt="Uploaded" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-charcoal/80 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {manualImageUrls.map((url, idx) => (
                <div key={`url-${idx}`} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-ivory border border-forest/15">
                  <img src={url} alt="Uploaded via URL" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveUrl(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-charcoal/80 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Upload Trigger Box */}
              <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-forest/20 hover:border-forest/50 bg-ivory-light flex flex-col items-center justify-center cursor-pointer p-4 transition-colors text-center">
                <UploadCloud className="w-7 h-7 text-forest/70 mb-2" />
                <span className="text-xs font-semibold text-charcoal">Add Photos</span>
                <span className="text-[10px] text-charcoal/50 mt-1">JPEG, PNG, WEBP</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick URL fallback */}
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Or paste an image web URL..."
                className="flex-1 text-xs bg-ivory border border-forest/20 rounded-xl px-3 py-2 text-charcoal"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-4 py-2 bg-ivory-dark hover:bg-forest hover:text-white text-xs font-semibold rounded-xl text-charcoal transition-colors"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* 2. Core Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                Listing Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Vintage Oversized Washed Denim Jacket"
                className="w-full text-xs sm:text-sm bg-ivory border border-forest/20 rounded-xl px-4 py-3 text-charcoal focus:outline-none focus:border-forest font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                Description & Story *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe fit, fabric weight, how often it was worn, care instructions, and any unique details..."
                className="w-full text-xs sm:text-sm bg-ivory border border-forest/20 rounded-xl p-4 text-charcoal focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          {/* 3. Garment Specs: Category, Size, Condition, Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3 text-charcoal"
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
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                Size *
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3 text-charcoal"
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
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3 text-charcoal"
              >
                <option value="new_with_tags">New with tags</option>
                <option value="like_new">Like new</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>

          {/* 4. Brand, Color, Material */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                Brand / Designer
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Levi's, Zara, Fabindia"
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3 text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Classic Indigo, Ivory"
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3 text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                Material / Fabric
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. 100% Linen, Silk, Cotton"
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3 text-charcoal"
              />
            </div>
          </div>

          {/* 5. Swap Value Calculator Module */}
          <div className="p-6 rounded-2xl bg-ivory border border-forest/15 space-y-4">
            <div className="flex items-center space-x-2 text-forest">
              <Calculator className="w-5 h-5 text-forest" />
              <h3 className="font-serif text-lg font-bold text-charcoal">
                Automatic Swap Value Calculator
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  Approx. Original Retail Value (₹ INR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={referencePrice}
                  onChange={(e) => setReferencePrice(e.target.value)}
                  className="w-full text-xs bg-white border border-forest/20 rounded-xl p-3 text-charcoal font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1.5">
                  Estimated Swap Credit Value (₹ INR)
                </label>
                <input
                  type="number"
                  min="50"
                  value={estimatedSwapValue}
                  onChange={(e) => setEstimatedSwapValue(e.target.value)}
                  className="w-full text-xs bg-white border border-forest/40 rounded-xl p-3 text-forest font-bold text-base"
                />
              </div>
            </div>

            <p className="text-[11px] text-charcoal/70">
              * The swap credit is calculated using your original retail estimate depreciated by condition ({condition.replace('_', ' ')}) and brand tier.
            </p>
          </div>

          {/* 6. Location & Exchange Preference */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, Delhi, Bengaluru"
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3 text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                PIN / Postal Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="e.g. 400050"
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3 text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                Handover Preference
              </label>
              <select
                value={exchangePreference}
                onChange={(e) => setExchangePreference(e.target.value)}
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3 text-charcoal"
              >
                <option value="both">Both In-Person & Courier</option>
                <option value="in_person">In-Person Only</option>
                <option value="courier">Courier Only</option>
              </select>
            </div>
          </div>

          {/* Submit Deck */}
          <div className="pt-4 border-t border-forest/10 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-full border border-forest/20 text-xs font-semibold text-charcoal hover:bg-ivory"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-full bg-forest text-white text-xs font-semibold hover:bg-forest-light transition-all disabled:opacity-50 shadow-float flex items-center space-x-2"
            >
              <PackagePlus className="w-4 h-4" />
              <span>{submitting ? 'Publishing Listing...' : 'Publish to Marketplace'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};


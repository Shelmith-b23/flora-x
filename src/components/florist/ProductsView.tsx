import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Search,
  Edit2,
  Copy,
  Trash2,
  RefreshCw,
  Tag,
  Box,
  Image as ImageIcon,
  AlertTriangle,
  Lock,
  Grid,
  List,
  Filter,
  X,
  SlidersHorizontal,
  CheckCircle2,
  ArrowUpDown,
  PackageCheck,
  PackageX,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';

interface ProductsViewProps {
  verificationStatus?: string;
  onRefreshParent?: () => void;
}

export default function ProductsView({ verificationStatus = 'approved', onRefreshParent }: ProductsViewProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters, Search & Sorting
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(''); // 'active' | 'draft' | ''
  const [selectedStockStatus, setSelectedStockStatus] = useState(''); // 'in_stock' | 'low_stock' | 'out_of_stock' | ''
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc' | 'name_asc'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('3500');
  const [stock, setStock] = useState('25');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [primaryImage, setPrimaryImage] = useState('https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&auto=format&fit=crop&q=60');
  
  // UI State
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Delete Dialog State
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Quick Stock Adjustment Modal State
  const [adjustingProduct, setAdjustingProduct] = useState<any | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjusting, setAdjusting] = useState(false);

  const isRestricted = verificationStatus === 'suspended' || verificationStatus === 'rejected';

  const loadCatalog = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/v1/florist/products'),
      axios.get('/api/v1/florist/categories')
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
        if (catRes.data?.length > 0 && !categoryId) {
          setCategoryId(catRes.data[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Form Submission
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRestricted) {
      setErrorMessage(`Your account status is "${verificationStatus}". Product creation and updates are unavailable.`);
      return;
    }

    // Validation
    if (!title.trim()) {
      setErrorMessage('Please enter a valid product title.');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage('Please enter a valid positive selling price.');
      return;
    }
    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      setErrorMessage('Please enter a valid non-negative stock quantity.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    const payload = {
      title: title.trim(),
      description: description.trim(),
      categoryId,
      primaryImageUrl: primaryImage.trim() || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&auto=format&fit=crop&q=60',
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      isActive,
      variants: [
        {
          id: editingProduct?.variants?.[0]?.id,
          sku: sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
          title: 'Standard',
          price: numPrice,
          inventoryQty: numStock,
          isDefault: true
        }
      ]
    };

    try {
      if (editingProduct) {
        await axios.put(`/api/v1/florist/products/${editingProduct.id}`, payload);
        setSuccessMessage(`"${title}" has been updated successfully.`);
      } else {
        await axios.post('/api/v1/florist/products', payload);
        setSuccessMessage(`"${title}" added to your floral collection!`);
      }
      setSaving(false);
      setShowAddForm(false);
      setEditingProduct(null);
      resetForm();
      loadCatalog();
      if (onRefreshParent) onRefreshParent();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setSaving(false);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save product. Please try again.';
      setErrorMessage(msg);
    }
  };

  const startEdit = (prod: any) => {
    if (isRestricted) {
      setErrorMessage(`Your account status is "${verificationStatus}". Modifications are restricted.`);
      return;
    }
    setEditingProduct(prod);
    setTitle(prod.title || '');
    setDescription(prod.description || '');
    setPrimaryImage(prod.primaryImageUrl || '');
    setCategoryId(prod.categoryId || (categories[0]?.id || ''));
    setTags(prod.tags ? prod.tags.join(', ') : '');
    setIsActive(prod.isActive !== false);
    const firstVariant = prod.variants?.[0] || {};
    setPrice(firstVariant.price?.toString() || '3500');
    setStock(firstVariant.inventoryQty?.toString() || '25');
    setSku(firstVariant.sku || '');
    setShowAddForm(true);
    setErrorMessage('');
  };

  const handleDuplicate = async (id: string) => {
    if (isRestricted) return;
    try {
      await axios.post(`/api/v1/florist/products/${id}/duplicate`);
      setSuccessMessage('Bouquet listing duplicated successfully.');
      loadCatalog();
      if (onRefreshParent) onRefreshParent();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to duplicate product');
    }
  };

  const confirmDelete = (prod: any) => {
    if (isRestricted) return;
    setDeletingProduct(prod);
  };

  const executeDelete = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/v1/florist/products/${deletingProduct.id}`);
      setDeleting(false);
      setDeletingProduct(null);
      setSuccessMessage('Product removed from catalog.');
      loadCatalog();
      if (onRefreshParent) onRefreshParent();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setDeleting(false);
      setErrorMessage(err.response?.data?.error || 'Failed to delete product');
      setDeletingProduct(null);
    }
  };

  const openAdjustStock = (prod: any) => {
    if (isRestricted) return;
    setAdjustingProduct(prod);
    setAdjustDelta(0);
  };

  const handleStockAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct || adjustDelta === 0) return;
    const variantId = adjustingProduct.variants?.[0]?.id;
    if (!variantId) return;

    setAdjusting(true);
    try {
      await axios.post('/api/v1/florist/inventory/adjust', { variantId, qtyDelta: adjustDelta });
      setAdjusting(false);
      setAdjustingProduct(null);
      setSuccessMessage('Inventory stock updated.');
      loadCatalog();
      if (onRefreshParent) onRefreshParent();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setAdjusting(false);
      alert(err.response?.data?.error || 'Failed to adjust stock');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('3500');
    setStock('25');
    setSku('');
    setTags('');
    setIsActive(true);
    setPrimaryImage('https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&auto=format&fit=crop&q=60');
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedStockStatus('');
    setSortBy('newest');
  };

  const hasActiveFilters = Boolean(search || selectedCategory || selectedStatus || selectedStockStatus || sortBy !== 'newest');

  // Derive Summary Metrics
  const totalProductsCount = products.length;
  const activeProductsCount = products.filter((p) => p.isActive !== false).length;
  const lowStockCount = products.filter((p) => {
    const qty = p.variants?.[0]?.inventoryQty ?? 0;
    return qty > 0 && qty <= 5;
  }).length;
  const outOfStockCount = products.filter((p) => (p.variants?.[0]?.inventoryQty ?? 0) <= 0).length;

  // Filter & Sort Products
  const filteredProducts = products
    .filter((p) => {
      const vSku = p.variants?.[0]?.sku || '';
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        vSku.toLowerCase().includes(search.toLowerCase());

      const matchesCat = !selectedCategory || p.categoryId === selectedCategory;
      const matchesStatus =
        !selectedStatus ||
        (selectedStatus === 'active' && p.isActive !== false) ||
        (selectedStatus === 'draft' && p.isActive === false);

      const qty = p.variants?.[0]?.inventoryQty ?? 0;
      const matchesStock =
        !selectedStockStatus ||
        (selectedStockStatus === 'in_stock' && qty > 5) ||
        (selectedStockStatus === 'low_stock' && qty > 0 && qty <= 5) ||
        (selectedStockStatus === 'out_of_stock' && qty <= 0);

      return matchesSearch && matchesCat && matchesStatus && matchesStock;
    })
    .sort((a, b) => {
      const aPrice = a.variants?.[0]?.price ?? 0;
      const bPrice = b.variants?.[0]?.price ?? 0;
      const aStock = a.variants?.[0]?.inventoryQty ?? 0;
      const bStock = b.variants?.[0]?.inventoryQty ?? 0;

      if (sortBy === 'price_asc') return aPrice - bPrice;
      if (sortBy === 'price_desc') return bPrice - aPrice;
      if (sortBy === 'stock_asc') return aStock - bStock;
      if (sortBy === 'stock_desc') return bStock - aStock;
      if (sortBy === 'name_asc') return a.title.localeCompare(b.title);
      // 'newest' default
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

  // Map category names
  const categoryMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-xs">
        <RefreshCw className="animate-spin text-[#2D5A27] mx-auto mb-3" size={28} />
        <p className="text-sm font-serif font-semibold text-stone-700">Loading Floral Catalog...</p>
        <p className="text-xs text-stone-400 mt-1">Retrieving product listings, inventory quantities, and pricing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-serif font-bold text-stone-800">Products</h2>
            <span className="text-xs bg-[#2D5A27]/10 text-[#2D5A27] font-semibold px-2.5 py-0.5 rounded-full">
              {totalProductsCount} Items
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Manage your floral collections, pricing, availability, and presentation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Grid Layout"
            >
              <Grid size={15} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === 'table' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Table Layout"
            >
              <List size={15} />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {!showAddForm && (
            <button
              onClick={() => {
                if (isRestricted) {
                  setErrorMessage(`Account status is "${verificationStatus}". Creating products is disabled.`);
                  return;
                }
                setEditingProduct(null);
                resetForm();
                setShowAddForm(true);
                setErrorMessage('');
              }}
              disabled={isRestricted}
              className="bg-[#2D5A27] hover:bg-[#23471f] disabled:bg-stone-300 text-white font-medium py-2.5 px-4 rounded-xl text-xs shadow-xs transition-colors flex items-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Account Restriction Banner */}
      {isRestricted && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-3">
          <Lock size={18} className="text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold">Account Restricted ({verificationStatus.toUpperCase()})</p>
            <p className="text-amber-700 mt-0.5">
              Your account is currently restricted. Product and inventory changes are unavailable until your account status is restored.
            </p>
          </div>
        </div>
      )}

      {/* Toast Messages */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-2">
          <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
            <Package size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Total Products</p>
            <p className="text-lg font-serif font-bold text-stone-800">{totalProductsCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#2D5A27]">
            <PackageCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Active</p>
            <p className="text-lg font-serif font-bold text-stone-800">{activeProductsCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Low Stock</p>
            <p className="text-lg font-serif font-bold text-amber-800">{lowStockCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-700">
            <PackageX size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Out of Stock</p>
            <p className="text-lg font-serif font-bold text-rose-800">{outOfStockCount}</p>
          </div>
        </div>
      </div>

      {/* Search, Filters & Sorting Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-4">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search product title, SKU, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] bg-[#FAF9F6]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft / Inactive</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
            >
              <option value="">All Stock Levels</option>
              <option value="in_stock">In Stock (&gt;5)</option>
              <option value="low_stock">Low Stock (1-5)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_asc">Stock: Low to High</option>
              <option value="stock_desc">Stock: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
            <span className="text-stone-500 text-[11px]">
              Showing <strong className="text-stone-800">{filteredProducts.length}</strong> of {totalProductsCount} products
            </span>
            <button
              onClick={clearFilters}
              className="text-[#2D5A27] hover:underline font-semibold text-[11px] flex items-center space-x-1"
            >
              <X size={12} />
              <span>Clear Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Form Card */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border-2 border-[#2D5A27]/40 p-6 shadow-md space-y-5 animate-fade-in">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-serif font-bold text-stone-800">
                {editingProduct ? 'Edit Product Arrangement' : 'Add New Product Arrangement'}
              </h3>
              <p className="text-xs text-stone-500">
                Configure bouquet details, pricing, inventory, and visibility status.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingProduct(null);
              }}
              className="text-stone-400 hover:text-stone-700 text-xs font-semibold p-1"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSaveProduct} className="space-y-6">
            {/* Section 1: Product Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center space-x-1">
                <Tag size={14} className="text-[#2D5A27]" />
                <span>Product Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Royal Naivasha Red Roses Bouquet"
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. FLR-ROS-001"
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Search Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="roses, anniversary, luxury, red"
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Description & Arrangement Notes
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the flowers included, vase options, and care instructions..."
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Pricing & Inventory */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center space-x-1">
                <Box size={14} className="text-[#2D5A27]" />
                <span>Pricing & Inventory</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Price (KES) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">
                      KES
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="50"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-12 pr-3 py-2 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Initial Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Availability Status
                  </label>
                  <select
                    value={isActive ? 'active' : 'draft'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  >
                    <option value="active">Active (Published to Store)</option>
                    <option value="draft">Draft (Hidden from Marketplace)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Product Image */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center space-x-1">
                <ImageIcon size={14} className="text-[#2D5A27]" />
                <span>Product Image</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Primary Image URL
                  </label>
                  <input
                    type="text"
                    value={primaryImage}
                    onChange={(e) => setPrimaryImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Provide a direct high-resolution image URL showcasing your arrangement.
                  </p>
                </div>

                {/* Live Preview */}
                <div className="flex items-center space-x-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-200 shrink-0 relative">
                    <img
                      src={primaryImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-stone-500">
                    <p className="font-semibold text-stone-700">Image Preview</p>
                    <p>Primary Card Cover</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl text-xs hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || isRestricted}
                className="bg-[#2D5A27] hover:bg-[#23471f] disabled:bg-stone-300 text-white font-semibold px-6 py-2 rounded-xl text-xs shadow-xs transition-colors flex items-center space-x-2"
              >
                {saving && <RefreshCw size={14} className="animate-spin" />}
                <span>{saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Publish Product'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const firstVariant = p.variants?.[0] || {};
            const itemPrice = firstVariant.price ?? 0;
            const itemStock = firstVariant.inventoryQty ?? 0;
            const itemSku = firstVariant.sku || 'N/A';
            const catName = categoryMap[p.categoryId] || 'General';

            let stockBadge = (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                In Stock ({itemStock})
              </span>
            );
            if (itemStock <= 0) {
              stockBadge = (
                <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Out of Stock
                </span>
              );
            } else if (itemStock <= 5) {
              stockBadge = (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Low Stock ({itemStock})
                </span>
              );
            }

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs flex flex-col justify-between hover:border-[#2D5A27]/40 transition-all group"
              >
                <div>
                  <div className="h-48 relative overflow-hidden bg-stone-100">
                    <img
                      src={p.primaryImageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&auto=format&fit=crop&q=60';
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                      {p.isActive === false ? (
                        <span className="bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Draft
                        </span>
                      ) : (
                        <span className="bg-[#2D5A27]/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2.5 right-2.5">{stockBadge}</div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-serif font-bold text-stone-800 text-sm line-clamp-1">{p.title}</h4>
                      <span className="text-[#2D5A27] font-bold text-xs whitespace-nowrap bg-emerald-50 px-2.5 py-0.5 rounded-full shrink-0">
                        KES {itemPrice.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {p.description || 'No detailed floral description provided.'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[10px] text-stone-500">
                      <span className="bg-stone-100 px-2 py-0.5 rounded-md font-medium text-stone-600">
                        {catName}
                      </span>
                      <span className="font-mono text-stone-400">SKU: {itemSku}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-stone-100 flex justify-between items-center bg-[#FAF9F6]">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => startEdit(p)}
                      disabled={isRestricted}
                      className="p-1.5 hover:bg-stone-200/60 rounded-lg text-stone-600 transition-colors disabled:opacity-40"
                      title="Edit Product"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(p.id)}
                      disabled={isRestricted}
                      className="p-1.5 hover:bg-stone-200/60 rounded-lg text-stone-600 transition-colors disabled:opacity-40"
                      title="Duplicate Product"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      onClick={() => openAdjustStock(p)}
                      disabled={isRestricted}
                      className="p-1.5 hover:bg-stone-200/60 rounded-lg text-stone-600 transition-colors disabled:opacity-40"
                      title="Adjust Stock"
                    >
                      <Box size={15} />
                    </button>
                  </div>

                  <button
                    onClick={() => confirmDelete(p)}
                    disabled={isRestricted}
                    className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors disabled:opacity-40"
                    title="Delete Product"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl border border-stone-200/80 p-12 text-center text-stone-400 space-y-3">
              <Box size={40} className="mx-auto text-stone-300" />
              <p className="text-sm font-serif font-bold text-stone-700">No Floral Products Found</p>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {hasActiveFilters
                  ? 'No products match your current search and filter criteria. Try clearing filters.'
                  : 'Your floral catalog is ready for its first arrangement. Click "Add Product" to create your first bouquet.'}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium px-4 py-2 rounded-xl text-xs inline-flex items-center space-x-1"
                >
                  <X size={14} />
                  <span>Clear Search Filters</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  disabled={isRestricted}
                  className="bg-[#2D5A27] hover:bg-[#23471f] text-white font-medium px-4 py-2 rounded-xl text-xs inline-flex items-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Add Your First Product</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-50/60">
                <th className="py-3 px-4">Product Arrangement</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredProducts.map((p) => {
                const firstVariant = p.variants?.[0] || {};
                const itemPrice = firstVariant.price ?? 0;
                const itemStock = firstVariant.inventoryQty ?? 0;
                const itemSku = firstVariant.sku || 'N/A';
                const catName = categoryMap[p.categoryId] || 'General';

                return (
                  <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-serif font-bold text-stone-800 flex items-center space-x-3">
                      <img
                        src={p.primaryImageUrl}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&auto=format&fit=crop&q=60';
                        }}
                      />
                      <div>
                        <p className="line-clamp-1">{p.title}</p>
                        <p className="text-[10px] text-stone-400 font-sans font-normal line-clamp-1">
                          {p.description || 'No description'}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-500 text-[11px]">{itemSku}</td>
                    <td className="py-3.5 px-4 text-stone-600">{catName}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#2D5A27]">
                      KES {itemPrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-stone-800">{itemStock}</td>
                    <td className="py-3.5 px-4">
                      {itemStock <= 0 ? (
                        <span className="text-[10px] bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                          Out of Stock
                        </span>
                      ) : itemStock <= 5 ? (
                        <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                          Low Stock
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => startEdit(p)}
                          disabled={isRestricted}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg disabled:opacity-40 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(p.id)}
                          disabled={isRestricted}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg disabled:opacity-40 transition-colors"
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => openAdjustStock(p)}
                          disabled={isRestricted}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg disabled:opacity-40 transition-colors"
                          title="Adjust Stock"
                        >
                          <Box size={14} />
                        </button>
                        <button
                          onClick={() => confirmDelete(p)}
                          disabled={isRestricted}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg disabled:opacity-40 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 text-xs">
                    No products match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-xl">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <h3 className="font-serif font-bold text-stone-800 text-base">Delete Product Listing</h3>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-stone-900">"{deletingProduct.title}"</strong>?
              This bouquet will be removed from your store catalog and will no longer be available for customer purchase.
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={deleting}
                className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl text-xs hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={deleting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors flex items-center space-x-1.5"
              >
                {deleting && <RefreshCw size={12} className="animate-spin" />}
                <span>{deleting ? 'Deleting...' : 'Delete Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Adjust Stock Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-stone-200 shadow-xl">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-stone-800 text-sm">Adjust Stock</h3>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="text-stone-400 hover:text-stone-700 text-xs"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="font-serif font-bold text-stone-800 text-sm">{adjustingProduct.title}</p>
                <p className="text-stone-500 text-[11px]">
                  SKU: {adjustingProduct.variants?.[0]?.sku || 'N/A'}
                </p>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex justify-between items-center">
                <span className="text-stone-600">Current Stock:</span>
                <span className="font-bold text-stone-900 text-sm">
                  {adjustingProduct.variants?.[0]?.inventoryQty ?? 0}
                </span>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Stock Change (+/-)</label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setAdjustDelta((prev) => prev - 5)}
                    className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg font-bold text-stone-700"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustDelta((prev) => prev - 1)}
                    className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg font-bold text-stone-700"
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(parseInt(e.target.value, 10) || 0)}
                    className="w-20 text-center font-bold py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustDelta((prev) => prev + 1)}
                    className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg font-bold text-stone-700"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustDelta((prev) => prev + 5)}
                    className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg font-bold text-stone-700"
                  >
                    +5
                  </button>
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">Resulting Stock:</span>
                <span className="font-bold text-emerald-900 text-sm">
                  {Math.max(0, (adjustingProduct.variants?.[0]?.inventoryQty ?? 0) + adjustDelta)}
                </span>
              </div>
            </div>

            <form onSubmit={handleStockAdjustSubmit} className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustingProduct(null)}
                className="px-3 py-1.5 border border-stone-200 text-stone-600 rounded-xl text-xs hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adjusting || adjustDelta === 0}
                className="bg-[#2D5A27] hover:bg-[#23471f] disabled:bg-stone-300 text-white font-medium px-4 py-1.5 rounded-xl text-xs shadow-xs flex items-center space-x-1"
              >
                {adjusting && <RefreshCw size={12} className="animate-spin" />}
                <span>{adjusting ? 'Saving...' : 'Apply Stock Change'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

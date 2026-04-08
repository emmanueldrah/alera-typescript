import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, AlertTriangle, Check, TrendingDown, DollarSign, Calendar, Inbox, Pill, Zap, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import type { InventoryItem } from '@/data/mockData';

const InventoryPage = () => {
  const { user } = useAuth();
  const { inventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useAppData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'medication' as InventoryItem['category'],
    stock: 0,
    reorderLevel: 10,
    price: 0,
    unit: 'packs',
    expiryDate: '',
    supplier: '',
  });

  const isPharmacy = user?.role === 'pharmacy';

  // Check for expiring items
  const expiringItems = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return inventoryItems.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= thirtyDaysFromNow && expiryDate > today;
    });
  }, [inventoryItems]);

  // Check for expired items
  const expiredItems = useMemo(() => {
    const today = new Date();
    return inventoryItems.filter(item => {
      if (!item.expiryDate) return false;
      return new Date(item.expiryDate) <= today;
    });
  }, [inventoryItems]);

  // Filter inventory
  const filtered = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventoryItems, search, categoryFilter, statusFilter]);

  // Inventory stats
  const stats = useMemo(() => {
    return {
      totalItems: inventoryItems.length,
      inStock: inventoryItems.filter(i => i.status === 'in-stock').length,
      lowStock: inventoryItems.filter(i => i.status === 'low-stock').length,
      outOfStock: inventoryItems.filter(i => i.status === 'out-of-stock').length,
      totalValue: inventoryItems.reduce((sum, i) => sum + i.stock * i.price, 0),
    };
  }, [inventoryItems]);

  const handleUpdateStock = (item: InventoryItem, newStock: number) => {
    const status = newStock === 0 ? 'out-of-stock' : newStock < item.reorderLevel ? 'low-stock' : 'in-stock';
    updateInventoryItem(item.id, () => ({
      ...item,
      stock: newStock,
      lastRestocked: newStock > item.stock ? new Date().toISOString() : item.lastRestocked,
      status,
    }));
  };

  const handleCreateItem = () => {
    if (!newItem.name.trim() || newItem.price <= 0 || newItem.stock < 0 || newItem.reorderLevel < 0) return;
    const status: InventoryItem['status'] =
      newItem.stock === 0 ? 'out-of-stock' : newItem.stock < newItem.reorderLevel ? 'low-stock' : 'in-stock';

    addInventoryItem({
      id: `inv-${crypto.randomUUID()}`,
      name: newItem.name.trim(),
      category: newItem.category,
      stock: newItem.stock,
      reorderLevel: newItem.reorderLevel,
      price: newItem.price,
      unit: newItem.unit.trim() || 'packs',
      expiryDate: newItem.expiryDate || undefined,
      supplier: newItem.supplier.trim() || undefined,
      lastRestocked: new Date().toISOString(),
      status,
    });
    setNewItem({
      name: '',
      category: 'medication',
      stock: 0,
      reorderLevel: 10,
      price: 0,
      unit: 'packs',
      expiryDate: '',
      supplier: '',
    });
    setShowCreate(false);
  };

  const categoryIcons = { medication: <Pill className="w-4 h-4" />, supply: <Package className="w-4 h-4" />, equipment: <Zap className="w-4 h-4" /> };

  const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 } });

  if (!isPharmacy) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Inventory Management</h1>
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-warning" />
          <p className="text-muted-foreground">This feature is only available for pharmacy staff</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Manage pharmacy stock and inventory levels</p>
        </div>
        <button onClick={() => setShowCreate((value) => !value)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
          {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCreate ? 'Close' : 'Add Drug'}
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-display font-semibold text-card-foreground">Add Inventory Item</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Drug / Item Name</label>
              <input value={newItem.name} onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Category</label>
              <select value={newItem.category} onChange={(e) => setNewItem((prev) => ({ ...prev, category: e.target.value as InventoryItem['category'] }))} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="medication">Medication</option>
                <option value="supply">Supply</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Unit</label>
              <input value={newItem.unit} onChange={(e) => setNewItem((prev) => ({ ...prev, unit: e.target.value }))} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Stock</label>
              <input type="number" min="0" value={newItem.stock} onChange={(e) => setNewItem((prev) => ({ ...prev, stock: Number(e.target.value) }))} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Reorder Level</label>
              <input type="number" min="0" value={newItem.reorderLevel} onChange={(e) => setNewItem((prev) => ({ ...prev, reorderLevel: Number(e.target.value) }))} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Price</label>
              <input type="number" min="0" step="0.01" value={newItem.price} onChange={(e) => setNewItem((prev) => ({ ...prev, price: Number(e.target.value) }))} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Expiry Date</label>
              <input type="date" value={newItem.expiryDate} onChange={(e) => setNewItem((prev) => ({ ...prev, expiryDate: e.target.value }))} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Supplier</label>
              <input value={newItem.supplier} onChange={(e) => setNewItem((prev) => ({ ...prev, supplier: e.target.value }))} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreateItem} className="px-5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
              Save Item
            </button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <motion.div {...card(0)} className="bg-card rounded-xl border border-border p-4">
          <div className="text-muted-foreground text-xs font-medium">Total Items</div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.totalItems}</div>
        </motion.div>
        <motion.div {...card(1)} className="bg-success/5 rounded-xl border border-success/30 p-4">
          <div className="text-success text-xs font-medium flex items-center gap-1"><Check className="w-3 h-3" /> In Stock</div>
          <div className="text-2xl font-bold text-success mt-1">{stats.inStock}</div>
        </motion.div>
        <motion.div {...card(2)} className="bg-warning/5 rounded-xl border border-warning/30 p-4">
          <div className="text-warning text-xs font-medium flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Low Stock</div>
          <div className="text-2xl font-bold text-warning mt-1">{stats.lowStock}</div>
        </motion.div>
        <motion.div {...card(3)} className="bg-destructive/5 rounded-xl border border-destructive/30 p-4">
          <div className="text-destructive text-xs font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Out of Stock</div>
          <div className="text-2xl font-bold text-destructive mt-1">{stats.outOfStock}</div>
        </motion.div>
        <motion.div {...card(4)} className="bg-primary/5 rounded-xl border border-primary/30 p-4">
          <div className="text-primary text-xs font-medium flex items-center gap-1"><DollarSign className="w-3 h-3" /> Total Value</div>
          <div className="text-2xl font-bold text-primary mt-1">${stats.totalValue.toFixed(0)}</div>
        </motion.div>
      </div>

      {/* Expiration Warnings */}
      {(expiredItems.length > 0 || expiringItems.length > 0) && (
        <div className="space-y-3">
          {expiredItems.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-50 border border-red-200">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">🔴 Expired Items Detected</h3>
                  <p className="text-sm text-red-800">{expiredItems.length} item(s) have expired and should be removed from inventory immediately:</p>
                  <ul className="mt-2 text-sm text-red-700 space-y-1">
                    {expiredItems.map(item => (
                      <li key={item.id}>• {item.name} (Expired: {new Date(item.expiryDate!).toLocaleDateString()})</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
          {expiringItems.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: expiredItems.length > 0 ? 0.1 : 0 }} className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
              <div className="flex gap-3">
                <Calendar className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">⚠️ Expiring Soon</h3>
                  <p className="text-sm text-yellow-800">{expiringItems.length} item(s) will expire within 30 days:</p>
                  <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                    {expiringItems.map(item => (
                      <li key={item.id}>• {item.name} (Expires: {new Date(item.expiryDate!).toLocaleDateString()})</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search inventory..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Categories</option>
          <option value="medication">Medication</option>
          <option value="supply">Supply</option>
          <option value="equipment">Equipment</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Status</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      {/* Inventory Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">{inventoryItems.length === 0 ? 'No items in inventory' : 'No items match your search'}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Item</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Category</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Stock</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Reorder Level</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Unit Price</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Total Value</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Expiry Date</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition"
                >
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-foreground">{item.name}</div>
                    {item.lastRestocked && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" />
                        Restocked: {new Date(item.lastRestocked).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                      {categoryIcons[item.category as keyof typeof categoryIcons]} {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="text-sm font-semibold text-foreground">{item.stock}</div>
                    <div className="text-xs text-muted-foreground">{item.unit}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="text-sm text-foreground">{item.reorderLevel}</div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="text-sm font-medium text-foreground">${item.price.toFixed(2)}</div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="text-sm font-semibold text-foreground">${(item.stock * item.price).toFixed(2)}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-foreground">
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        item.status === 'in-stock'
                          ? 'bg-success/10 text-success'
                          : item.status === 'low-stock'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {item.status === 'in-stock' ? 'In Stock' : item.status === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right space-y-2">
                    <div className="flex justify-end gap-2">
                      {item.status !== 'in-stock' && (
                        <button
                          onClick={() => handleUpdateStock(item, item.stock + 10)}
                          className="px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition"
                        >
                          +10
                        </button>
                      )}
                      {item.stock > 0 && (
                        <button
                          onClick={() => handleUpdateStock(item, item.stock - 1)}
                          className="px-2 py-1 rounded-lg text-xs font-medium bg-secondary text-muted-foreground hover:bg-secondary/70 transition"
                        >
                          -1
                        </button>
                      )}
                      <button
                        onClick={() => deleteInventoryItem(item.id)}
                        className="px-2 py-1 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition"
                      >
                        <span className="inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</span>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Low Stock Alert */}
      {stats.lowStock > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
          <div>
            <h3 className="font-semibold text-warning">Low Stock Alert</h3>
            <p className="text-sm text-warning/80 mt-1">
              {stats.lowStock} item{stats.lowStock !== 1 ? 's' : ''} have low stock levels. Consider reordering soon.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InventoryPage;

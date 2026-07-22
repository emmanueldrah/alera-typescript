import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, DollarSign, AlertCircle, Check, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import type { ProviderPricing } from '@/data/mockData';

const PricingSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { providerPricing, setProviderPricing, deleteProviderPricing } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<'all' | ProviderPricing['serviceType']>('all');
  
  const doctorId = user?.role === 'doctor' ? user.id : '';
  const doctorName = user?.name || 'Current Provider';
  
  const myPricing = providerPricing.filter((p) => p.providerId === doctorId);
  const filteredPricing = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return myPricing
      .filter((pricing) => serviceTypeFilter === 'all' || pricing.serviceType === serviceTypeFilter)
      .filter((pricing) => (
        !normalizedQuery
        || pricing.serviceDescription.toLowerCase().includes(normalizedQuery)
        || pricing.serviceType.toLowerCase().includes(normalizedQuery)
        || (pricing.notes || '').toLowerCase().includes(normalizedQuery)
      ))
      .sort((left, right) => new Date(right.lastUpdated).getTime() - new Date(left.lastUpdated).getTime());
  }, [myPricing, searchQuery, serviceTypeFilter]);
  
  const [formData, setFormData] = useState({
    serviceType: 'consultation' as 'consultation' | 'procedure' | 'test' | 'imaging' | 'follow-up' | 'other',
    serviceDescription: '',
    priceGHS: 0,
    notes: '',
  });

  const serviceTypes: Array<'consultation' | 'procedure' | 'test' | 'imaging' | 'follow-up' | 'other'> = [
    'consultation',
    'procedure',
    'test',
    'imaging',
    'follow-up',
    'other',
  ];

  const handleAddPrice = () => {
    if (!doctorId) {
      toast({
        title: 'Provider account required',
        description: 'Sign in as a verified provider to manage pricing.',
        variant: 'destructive',
      });
      return;
    }
    if (!formData.serviceDescription || formData.priceGHS <= 0) {
      toast({
        title: 'Incomplete pricing details',
        description: 'Add a service description and a valid amount before saving.',
        variant: 'destructive',
      });
      return;
    }

    const normalizedDescription = formData.serviceDescription.trim().toLowerCase();
    const duplicatePricing = myPricing.find((pricing) => (
      pricing.id !== editingId
      && pricing.serviceType === formData.serviceType
      && pricing.serviceDescription.trim().toLowerCase() === normalizedDescription
    ));

    if (duplicatePricing) {
      toast({
        title: 'Pricing already exists',
        description: 'Update the existing item instead of adding a duplicate service entry.',
        variant: 'destructive',
      });
      return;
    }

    const newPricing: ProviderPricing = {
      id: editingId || `pricing-${Date.now()}`,
      providerId: doctorId,
      providerName: doctorName,
      serviceType: formData.serviceType,
      serviceDescription: formData.serviceDescription,
      priceGHS: formData.priceGHS,
      lastUpdated: new Date().toISOString().split('T')[0],
      currency: 'GHS',
      notes: formData.notes || undefined,
    };

    setProviderPricing(newPricing);
    setSuccessMsg(`Price ${editingId ? 'updated' : 'added'} successfully!`);
    toast({
      title: editingId ? 'Pricing updated' : 'Pricing added',
      description: `${formData.serviceDescription} is now available for patients and admins.`,
    });
    setFormData({ serviceType: 'consultation', serviceDescription: '', priceGHS: 0, notes: '' });
    setShowForm(false);
    setEditingId(null);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEdit = (pricing: ProviderPricing) => {
    setFormData({
      serviceType: pricing.serviceType,
      serviceDescription: pricing.serviceDescription,
      priceGHS: pricing.priceGHS,
      notes: pricing.notes || '',
    });
    setEditingId(pricing.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteProviderPricing(id);
    setPendingDeleteId(null);
    setSuccessMsg('Price deleted successfully!');
    toast({
      title: 'Pricing removed',
      description: 'The service price has been deleted.',
    });
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const totalServices = myPricing.length;
  const avgPrice = myPricing.length > 0 ? Math.round(myPricing.reduce((sum, p) => sum + p.priceGHS, 0) / myPricing.length) : 0;

  const card = (index: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.05 },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pricing Settings</h1>
          <p className="text-muted-foreground mt-1">Set your service prices in Ghana Cedis (GHS)</p>
        </div>
        {!showForm && (
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({ serviceType: 'consultation', serviceDescription: '', priceGHS: 0, notes: '' });
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Price
          </Button>
        )}
      </div>

      {/* Success Message */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex gap-3"
        >
          <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-emerald-800 font-medium">{successMsg}</p>
        </motion.div>
      )}

      <AlertDialog open={Boolean(pendingDeleteId)} onOpenChange={(open) => { if (!open) setPendingDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete pricing entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This service price will be removed immediately and can’t be restored automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => pendingDeleteId ? handleDelete(pendingDeleteId) : undefined}>
              Delete pricing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <motion.div {...card(0)} className="bg-card rounded-xl border border-border p-4">
          <div className="text-muted-foreground text-xs font-medium">Total Services</div>
          <div className="text-2xl font-bold text-foreground mt-1">{totalServices}</div>
        </motion.div>
        <motion.div {...card(1)} className="bg-primary/5 rounded-xl border border-primary/30 p-4">
          <div className="text-primary text-xs font-medium flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Avg Price
          </div>
          <div className="text-2xl font-bold text-primary mt-1">GHS {avgPrice}</div>
        </motion.div>
        <motion.div {...card(2)} className="bg-secondary/30 rounded-xl border border-secondary p-4">
          <div className="text-muted-foreground text-xs font-medium">Currency</div>
          <div className="text-2xl font-bold text-foreground mt-1">GHS</div>
        </motion.div>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-6 space-y-4"
        >
          <h2 className="text-xl font-semibold text-foreground">
            {editingId ? 'Edit Pricing' : 'Add New Pricing'}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Service Type</label>
              <select
                value={formData.serviceType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    serviceType: e.target.value as 'consultation' | 'procedure' | 'test' | 'imaging' | 'follow-up' | 'other',
                  }))
                }
                className="w-full h-11 px-4 rounded-xl border border-input bg-background mt-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Price (GHS)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.priceGHS}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, priceGHS: parseFloat(e.target.value) || 0 }))
                }
                className="w-full h-11 px-4 rounded-xl border border-input bg-background mt-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. 50.00"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Service Description</label>
              <input
                type="text"
                value={formData.serviceDescription}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, serviceDescription: e.target.value }))
                }
                className="w-full h-11 px-4 rounded-xl border border-input bg-background mt-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. General Consultation"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Notes (Optional)</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl border border-input bg-background mt-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. Includes follow-up"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleAddPrice} className="flex-1">
              {editingId ? 'Update Price' : 'Add Price'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({
                  serviceType: 'consultation',
                  serviceDescription: '',
                  priceGHS: 0,
                  notes: '',
                });
              }}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search your pricing by service, type, or notes..."
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={serviceTypeFilter}
          onChange={(event) => setServiceTypeFilter(event.target.value as 'all' | ProviderPricing['serviceType'])}
          className="h-11 rounded-xl border border-input bg-background px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All service types</option>
          {serviceTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Pricing List */}
      {myPricing.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
          <DollarSign className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm">No pricing set yet. Create your first pricing above.</p>
        </div>
      ) : filteredPricing.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
          <Search className="mb-3 h-10 w-10 opacity-50" />
          <p className="text-sm">No pricing entries match your current search or filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPricing.map((pricing, i) => (
            <motion.div
              key={pricing.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-4 flex items-center justify-between hover:border-primary/30 transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{pricing.serviceDescription}</h3>
                    <p className="text-xs text-muted-foreground">
                      {pricing.serviceType.charAt(0).toUpperCase() + pricing.serviceType.slice(1)}
                      {pricing.notes && ` • ${pricing.notes}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">GHS {pricing.priceGHS.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Updated: {new Date(pricing.lastUpdated).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(pricing)}
                    className="text-primary"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingDeleteId(pricing.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">Admin Oversight</h3>
          <p className="text-sm text-blue-700">
            All pricing changes are logged and monitored by administrators. Price changes are effective immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingSettingsPage;

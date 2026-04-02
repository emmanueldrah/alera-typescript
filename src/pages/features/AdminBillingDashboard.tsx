import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BarChart3,
  DollarSign,
  Download,
  Eye,
  Filter,
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/useAppData';
import type { BillingRecord, Invoice, ProviderPricing } from '@/data/mockData';

const AdminBillingDashboard: React.FC = () => {
  const { providerPricing, invoices, billingRecords, getAllBillingRecords } = useAppData();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'providers' | 'billing' | 'audit'>('overview');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const allRecords = getAllBillingRecords();

  // Calculate statistics
  const stats = useMemo(
    () => ({
      totalProviders: new Set(providerPricing.map((p) => p.providerId)).size,
      totalPricingServices: providerPricing.length,
      totalInvoices: invoices.length,
      totalIssued: invoices.reduce((sum, inv) => sum + inv.totalAmountGHS, 0),
      totalCollected: invoices.reduce((sum, inv) => sum + inv.amountPaidGHS, 0),
      totalOutstanding: invoices.reduce((sum, inv) => sum + inv.outstandingAmountGHS, 0),
      overdueBills: invoices.filter((inv) => inv.status === 'overdue').length,
    }),
    [providerPricing, invoices],
  );

  // Get unique providers
  const providers = useMemo(
    () => Array.from(new Set(providerPricing.map((p) => p.providerId))).map((id) => {
      const pricing = providerPricing.filter((p) => p.providerId === id);
      const name = pricing[0]?.providerName || id;
      const totalServices = pricing.length;
      const avgPrice = pricing.reduce((sum, p) => sum + p.priceGHS, 0) / pricing.length;
      return { id, name, totalServices, avgPrice, pricing };
    }),
    [providerPricing],
  );

  // Get billing records for provider
  const providerRecords = useMemo(() => {
    if (!selectedProvider) return allRecords;
    return allRecords.filter((r) => r.affectedProviderId === selectedProvider);
  }, [selectedProvider, allRecords]);

  // Get overdue invoices
  const overdueInvoices = useMemo(
    () => invoices.filter((inv) => inv.status === 'overdue').sort((a, b) =>
      new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    ),
    [invoices],
  );

  const card = (index: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.05 },
  });

  const collectionRate = stats.totalIssued > 0 ? ((stats.totalCollected / stats.totalIssued) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Billing Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor providers, billing, and payment records</p>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div {...card(0)} className="bg-card rounded-xl border border-border p-4">
          <div className="text-muted-foreground text-xs font-medium flex items-center gap-1">
            <Users className="w-3 h-3" />
            Providers
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.totalProviders}</div>
          <p className="text-xs text-muted-foreground mt-2">{stats.totalPricingServices} service prices</p>
        </motion.div>

        <motion.div {...card(1)} className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="text-blue-600 text-xs font-medium flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Total Issued
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1">GHS {stats.totalIssued.toFixed(0)}</div>
          <p className="text-xs text-blue-600 mt-2">{stats.totalInvoices} invoices</p>
        </motion.div>

        <motion.div {...card(2)} className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
          <div className="text-emerald-600 text-xs font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Collected
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">GHS {stats.totalCollected.toFixed(0)}</div>
          <p className="text-xs text-emerald-600 mt-2">{collectionRate}% collection rate</p>
        </motion.div>

        <motion.div {...card(3)} className="bg-orange-50 rounded-xl border border-orange-200 p-4">
          <div className="text-orange-600 text-xs font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Outstanding
          </div>
          <div className="text-2xl font-bold text-orange-700 mt-1">GHS {stats.totalOutstanding.toFixed(0)}</div>
          <p className="text-xs text-orange-600 mt-2">{stats.overdueBills} overdue</p>
        </motion.div>
      </div>

      {/* Critical Alert */}
      {stats.overdueBills > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">{stats.overdueBills} Overdue Bills</h3>
            <p className="text-sm text-red-700 mt-1">
              Total amount at risk: GHS {overdueInvoices.reduce((sum, inv) => sum + inv.outstandingAmountGHS, 0).toFixed(2)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['overview', 'providers', 'billing', 'audit'] as const).map((tab) => (
          <Button
            key={tab}
            variant={selectedTab === tab ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedTab(tab);
              setSelectedProvider(null);
            }}
            className="capitalize whitespace-nowrap"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Financial Summary</h2>
            <div className="grid md:grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-sm text-muted-foreground">Total Invoiced</p>
                <p className="text-3xl font-bold text-foreground mt-1">GHS {stats.totalIssued.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">GHS {stats.totalCollected.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">GHS {stats.totalOutstanding.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Overdue Bills Alert */}
          {overdueInvoices.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Overdue Bills Requiring Action</h2>
              {overdueInvoices.slice(0, 5).map((invoice, i) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-red-50 rounded-xl border border-red-200 p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-red-900">{invoice.id}</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Patient: {invoice.patientName} • Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-700">GHS {invoice.outstandingAmountGHS.toFixed(2)}</div>
                    <p className="text-xs text-red-600 mt-1">Days overdue: {Math.ceil((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Providers Tab */}
      {selectedTab === 'providers' && (
        <div className="space-y-3">
          {providers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No providers with pricing configured</div>
          ) : (
            providers.map((provider, i) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  setSelectedProvider(provider.id);
                  setSelectedTab('billing');
                }}
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{provider.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {provider.totalServices} services • Avg: GHS {provider.avgPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">{provider.totalServices}</div>
                    <p className="text-xs text-muted-foreground">services</p>
                  </div>
                  <Eye className="w-4 h-4 text-muted-foreground ml-2" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Billing Tab */}
      {selectedTab === 'billing' && (
        <div className="space-y-4">
          {selectedProvider && providers.find((p) => p.id === selectedProvider) && (
            <Button variant="outline" onClick={() => setSelectedProvider(null)}>
              ← Back to All Providers
            </Button>
          )}

          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {selectedProvider ? `${providers.find((p) => p.id === selectedProvider)?.name}'s Pricing` : 'All Provider Pricing'}
            </h2>

            {(selectedProvider ? providers.find((p) => p.id === selectedProvider)?.pricing || [] : providerPricing).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pricing data</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">Provider</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">Service</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase px-4 py-3">Type</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground uppercase px-4 py-3">Price (GHS)</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedProvider ? providers.find((p) => p.id === selectedProvider)?.pricing || [] : providerPricing).map((pricing) => (
                      <tr key={pricing.id} className="border-b border-border hover:bg-secondary/30">
                        <td className="px-4 py-3 text-sm text-foreground">{pricing.providerName}</td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{pricing.serviceDescription}</td>
                        <td className="px-4 py-3 text-sm text-center text-muted-foreground capitalize">
                          {pricing.serviceType}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-primary text-right">GHS {pricing.priceGHS.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(pricing.lastUpdated).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Associated Invoices */}
          {selectedProvider && (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Related Invoices</h2>
              {invoices.filter((inv) => {
                // Find if any line item is from this provider
                return true; // Simplified - in real app, check line items
              }).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No invoices</p>
              ) : (
                <div className="space-y-2">
                  {invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex justify-between items-center p-3 rounded-lg bg-secondary/30 border border-border">
                      <div>
                        <p className="font-medium text-foreground">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">{invoice.patientName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">GHS {invoice.totalAmountGHS.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{invoice.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Audit Trail Tab */}
      {selectedTab === 'audit' && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Billing Activity Log</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          {providerRecords.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No billing records</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {providerRecords.slice(0, 20).map((record, i) => (
                <div key={record.id} className="flex gap-3 p-3 rounded-lg bg-secondary/20 border border-border text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground capitalize">
                      {record.action.replace('-', ' ')}
                    </p>
                    <p className="text-muted-foreground truncate">{record.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(record.timestamp).toLocaleString()} • By {record.actionByName}
                    </p>
                  </div>
                  {record.amountGHS && (
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-foreground">GHS {record.amountGHS.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBillingDashboard;

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, AlertCircle, Check, Clock, DollarSign, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/useAppData';
import type { Invoice } from '@/data/mockData';

const BillingPage: React.FC = () => {
  const { invoices, getPatientBalance } = useAppData();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'outstanding' | 'overdue'>('all');

  // Use mock patient ID (in real app, get from auth context)
  const patientId = localStorage.getItem('currentUser')?.split('-')[0] || 'p-001';

  const patientInvoices = invoices.filter((inv) => inv.patientId === patientId);
  const totalBalance = getPatientBalance(patientId);

  const filtered = useMemo(() => {
    let result = patientInvoices;
    if (filterStatus === 'paid') {
      result = result.filter((inv) => inv.status === 'paid');
    } else if (filterStatus === 'outstanding') {
      result = result.filter((inv) => inv.outstandingAmountGHS > 0 && inv.status !== 'overdue');
    } else if (filterStatus === 'overdue') {
      result = result.filter((inv) => inv.status === 'overdue');
    }
    return result.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  }, [patientInvoices, filterStatus]);

  const stats = useMemo(
    () => ({
      totalInvoices: patientInvoices.length,
      paidAmount: patientInvoices.reduce((sum, inv) => sum + inv.amountPaidGHS, 0),
      outstandingAmount: totalBalance,
    }),
    [patientInvoices, totalBalance],
  );

  const statusConfig = {
    paid: { color: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
    'partially-paid': { color: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
    overdue: { color: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
    draft: { color: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-800' },
    issued: { color: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
    cancelled: { color: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-800' },
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <Check className="w-4 h-4" />;
      case 'overdue':
      case 'issued':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const card = (index: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.05 },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground mt-1">View your invoices and payment history</p>
      </div>

      {/* Alert for Outstanding Balance */}
      {stats.outstandingAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex gap-3"
        >
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900">Outstanding Balance</h3>
            <p className="text-sm text-orange-700 mt-1">
              You have an outstanding balance of GHS {stats.outstandingAmount.toFixed(2)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <motion.div {...card(0)} className="bg-card rounded-xl border border-border p-4">
          <div className="text-muted-foreground text-xs font-medium">Total Invoices</div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.totalInvoices}</div>
        </motion.div>
        <motion.div {...card(1)} className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
          <div className="text-emerald-600 text-xs font-medium flex items-center gap-1">
            <Check className="w-3 h-3" />
            Amount Paid
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">GHS {stats.paidAmount.toFixed(2)}</div>
        </motion.div>
        <motion.div {...card(2)} className="bg-orange-50 rounded-xl border border-orange-200 p-4">
          <div className="text-orange-600 text-xs font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Outstanding
          </div>
          <div className="text-2xl font-bold text-orange-700 mt-1">GHS {stats.outstandingAmount.toFixed(2)}</div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'paid', 'outstanding', 'overdue'] as const).map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className="capitalize whitespace-nowrap"
          >
            {status === 'outstanding' ? 'Pending Payment' : status}
          </Button>
        ))}
      </div>

      {/* Invoice List or Detail View */}
      {selectedInvoice ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
            ← Back to Invoices
          </Button>

          {/* Invoice Detail */}
          <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">{selectedInvoice.id}</h2>
                <p className="text-muted-foreground mt-1">
                  Issued: {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                  statusConfig[selectedInvoice.status]?.badge
                }`}
              >
                {getStatusIcon(selectedInvoice.status)}
                {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Charges</h3>
              <div className="divide-y divide-border">
                {selectedInvoice.lineItems.map((item, i) => (
                  <div key={item.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">{item.description}</p>
                      {item.quantity && <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>}
                    </div>
                    <p className="font-semibold text-foreground">GHS {item.amountGHS.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-secondary/30 rounded-xl p-4 space-y-2 border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">GHS {selectedInvoice.totalAmountGHS.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-medium text-emerald-600">GHS {selectedInvoice.amountPaidGHS.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                <span className="text-foreground">Outstanding</span>
                <span className={selectedInvoice.outstandingAmountGHS > 0 ? 'text-orange-600' : 'text-emerald-600'}>
                  GHS {selectedInvoice.outstandingAmountGHS.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Methods */}
            {selectedInvoice.paymentMethods && selectedInvoice.paymentMethods.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Payment History</h3>
                <div className="divide-y divide-border">
                  {selectedInvoice.paymentMethods.map((payment, i) => (
                    <div key={i} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-foreground capitalize">{payment.method.replace('-', ' ')}</p>
                        <p className="text-sm text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                      <p className="font-semibold text-emerald-600">GHS {payment.amountGHS.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button className="flex-1 gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              {selectedInvoice.outstandingAmountGHS > 0 && (
                <Button variant="outline" className="flex-1 gap-2">
                  <CreditCard className="w-4 h-4" />
                  Pay Now
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
              <DollarSign className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm">{patientInvoices.length === 0 ? 'No invoices yet' : 'No invoices with this status'}</p>
            </div>
          ) : (
            filtered.map((invoice, i) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedInvoice(invoice)}
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition cursor-pointer"
              >
                <div className="flex items-start justify-between md:items-center">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{invoice.id}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Issued: {new Date(invoice.invoiceDate).toLocaleDateString()} • Due:{' '}
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 md:items-start md:flex-col md:text-right">
                    <div>
                      <div className="text-lg font-bold text-foreground">GHS {invoice.totalAmountGHS.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.outstandingAmountGHS > 0
                          ? `GHS ${invoice.outstandingAmountGHS.toFixed(2)} outstanding`
                          : 'Paid'}
                      </div>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                        statusConfig[invoice.status]?.badge
                      }`}
                    >
                      {getStatusIcon(invoice.status)}
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </div>
                  </div>

                  <Eye className="w-4 h-4 text-muted-foreground ml-2 hidden md:block" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">Payment Methods Available</h3>
          <p className="text-sm text-blue-700">
            We accept Mobile Money (MTN, Airtel, Vodafone), Bank Transfers, and Cash payments at our facility.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;

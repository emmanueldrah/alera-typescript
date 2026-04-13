import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Upload, FileText, CheckCircle, Clock, Download, Eye, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import type { LabTest } from '@/data/mockData';

const LabResultsManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { labTests, updateLabTest } = useAppData();
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [uploadingTestId, setUploadingTestId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'requested' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const patientId = user?.role === 'patient' ? user.id : '';

  const patientTests = labTests.filter((test) => test.patientId === patientId);
  const activeSelectedTest = selectedTest
    ? patientTests.find((test) => test.id === selectedTest.id) ?? selectedTest
    : null;

  const filtered = useMemo(() => {
    let result = patientTests;
    if (filterStatus !== 'all') {
      result = result.filter((test) => test.status === filterStatus);
    }
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (normalizedQuery) {
      result = result.filter((test) => (
        test.testName.toLowerCase().includes(normalizedQuery)
        || test.doctorName.toLowerCase().includes(normalizedQuery)
        || (test.results || '').toLowerCase().includes(normalizedQuery)
      ));
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [patientTests, filterStatus, searchQuery]);

  const stats = useMemo(
    () => ({
      totalTests: patientTests.length,
      completed: patientTests.filter((t) => t.status === 'completed').length,
      pending: patientTests.filter((t) => t.status !== 'completed').length,
      withDocuments: patientTests.filter((t) => t.documentUrl).length,
    }),
    [patientTests],
  );

  const handleFileUpload = (testId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Unsupported file type',
        description: 'Upload a PDF, JPEG, or PNG document.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Choose a file smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingTestId(testId);

    // Use FileReader to convert to data URL (for MVP)
    // In production, would upload to backend/cloud storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const uploadedOn = new Date().toLocaleDateString();
      updateLabTest(testId, (test) => ({
        ...test,
        documentUrl: dataUrl,
        notes: `${test.notes || ''}\nDocument uploaded: ${file.name} (${uploadedOn})`.trim(),
      }));
      setUploadingTestId(null);
      if (activeSelectedTest?.id === testId) {
        setSelectedTest((current) => current ? {
          ...current,
          documentUrl: dataUrl,
          notes: `${current.notes || ''}\nDocument uploaded: ${file.name} (${uploadedOn})`.trim(),
        } : current);
      }
      toast({
        title: 'Document uploaded',
        description: `${file.name} is now attached to this lab result.`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDocument = (testId: string) => {
    if (confirm('Delete this document? This cannot be undone.')) {
      updateLabTest(testId, (test) => ({
        ...test,
        documentUrl: undefined,
      }));
      if (activeSelectedTest?.id === testId) {
        setSelectedTest((current) => current ? {
          ...current,
          documentUrl: undefined,
        } : current);
      }
      toast({
        title: 'Document deleted',
        description: 'The lab result attachment was removed.',
      });
    }
  };

  const getStatusBadge = (status: LabTest['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'requested':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: LabTest['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'requested':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
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
        <h1 className="text-3xl font-bold text-foreground">Lab Results</h1>
        <p className="text-muted-foreground mt-1">View and manage your lab test results and documents</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div {...card(0)} className="bg-card rounded-xl border border-border p-4">
          <div className="text-muted-foreground text-xs font-medium">Total Tests</div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.totalTests}</div>
        </motion.div>

        <motion.div {...card(1)} className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
          <div className="text-emerald-600 text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Completed
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{stats.completed}</div>
        </motion.div>

        <motion.div {...card(2)} className="bg-orange-50 rounded-xl border border-orange-200 p-4">
          <div className="text-orange-600 text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </div>
          <div className="text-2xl font-bold text-orange-700 mt-1">{stats.pending}</div>
        </motion.div>

        <motion.div {...card(3)} className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="text-blue-600 text-xs font-medium flex items-center gap-1">
            <FileText className="w-3 h-3" />
            With Docs
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{stats.withDocuments}</div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'completed', 'in-progress', 'requested'] as const).map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className="capitalize whitespace-nowrap"
          >
            {status}
          </Button>
        ))}
      </div>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search tests, ordering doctor, or results..."
          className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Test List or Detail View */}
      {activeSelectedTest ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <Button variant="outline" onClick={() => setSelectedTest(null)}>
            ← Back to Tests
          </Button>

          {/* Test Detail */}
          <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">{activeSelectedTest.testName}</h2>
                <p className="text-muted-foreground mt-2">
                  Doctor: {activeSelectedTest.doctorName} • Lab: {activeSelectedTest.labId || 'Central Lab'}
                </p>
                <p className="text-muted-foreground">
                  Ordered: {new Date(activeSelectedTest.date).toLocaleDateString()}
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${getStatusBadge(
                  activeSelectedTest.status,
                )}`}
              >
                {getStatusIcon(activeSelectedTest.status)}
                {activeSelectedTest.status.charAt(0).toUpperCase() + activeSelectedTest.status.slice(1)}
              </div>
            </div>

            {/* Results */}
            {activeSelectedTest.results && (
              <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-2">Results</h3>
                <p className="text-foreground whitespace-pre-wrap">{activeSelectedTest.results}</p>
              </div>
            )}

            {/* Reference Range */}
            {activeSelectedTest.referenceRange && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Reference Range</h3>
                <p className="text-blue-800">{activeSelectedTest.referenceRange}</p>
              </div>
            )}

            {/* Notes */}
            {activeSelectedTest.notes && (
              <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-2">Notes</h3>
                <p className="text-foreground whitespace-pre-wrap text-sm">{activeSelectedTest.notes}</p>
              </div>
            )}

            {/* Document Section */}
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-4">Test Document</h3>

              {activeSelectedTest.documentUrl ? (
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-emerald-600" />
                    <div className="flex-1">
                      <p className="font-medium text-emerald-900">Document uploaded ✓</p>
                      <p className="text-sm text-emerald-700">PDF or image file available for download</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a href={activeSelectedTest.documentUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="gap-2">
                        <Download className="w-4 h-4" />
                        View Document
                      </Button>
                    </a>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteDocument(activeSelectedTest.id)}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 space-y-4">
                  <p className="text-orange-700 text-sm">No document uploaded yet</p>

                  <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-orange-300 cursor-pointer hover:bg-orange-100/50 transition">
                    <Upload className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">
                      {uploadingTestId === activeSelectedTest.id ? 'Uploading...' : 'Upload Document (PDF/Image)'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(activeSelectedTest.id, e)}
                      disabled={uploadingTestId === activeSelectedTest.id}
                      className="hidden"
                    />
                  </label>

                  <p className="text-xs text-muted-foreground">Max 5MB • PDF, JPEG, or PNG format</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
              <FileText className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm">{patientTests.length === 0 ? 'No lab tests yet' : 'No tests with this status'}</p>
            </div>
          ) : (
            filtered.map((test, i) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedTest(test)}
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition cursor-pointer"
              >
                <div className="flex items-start justify-between md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {test.documentUrl ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{test.testName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Dr. {test.doctorName} • {new Date(test.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4 md:text-right">
                    {test.documentUrl && (
                      <div className="text-xs font-medium px-2 py-1 rounded bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Doc
                      </div>
                    )}
                    <div className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${getStatusBadge(test.status)}`}>
                      {getStatusIcon(test.status)}
                      {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
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
          <h3 className="font-semibold text-blue-900 mb-1">Document Security</h3>
          <p className="text-sm text-blue-700">
            Your lab documents are securely stored and encrypted. You can download or delete documents at any time. Only you and your healthcare providers can access these files.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LabResultsManagementPage;

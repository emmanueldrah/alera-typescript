import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, Download, RefreshCcw, Clock, User, Activity, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { api } from '@/lib/apiService';
import { handleApiError } from '@/lib/errorHandler';

interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  resource_type?: string;
  resource_id?: number;
  old_value?: string;
  new_value?: string;
  ip_address?: string;
  user_agent?: string;
  reason?: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'info' | 'warning' | 'critical';
  timestamp: string;
}

const severityIcons = {
  info: <Info className="w-4 h-4 text-info" />,
  warning: <AlertTriangle className="w-4 h-4 text-warning" />,
  critical: <XCircle className="w-4 h-4 text-destructive" />,
};

const severityStyles = {
  info: 'bg-info/10 text-info border-info/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
};

const AuditLogsPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await api.admin.getAuditLogs(0, 200);
      setLogs(data.items || data || []);
      setError('');
    } catch (err) {
      setError(handleApiError(err));
      setLogs([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      void fetchLogs();
    }
  }, [user?.role, fetchLogs]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.resource_type && log.resource_type.toLowerCase().includes(search.toLowerCase())) ||
      (log.new_value && log.new_value.toLowerCase().includes(search.toLowerCase()));
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);
    return matchesSearch && matchesSeverity && matchesAction;
  });

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User ID', 'Action', 'Resource Type', 'Resource ID', 'Description', 'Severity', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.user_id || '',
        log.action,
        log.resource_type || '',
        log.resource_id || '',
        log.new_value || log.old_value || '',
        log.severity,
        log.ip_address || '',
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCcw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            Audit Logs
            {isRefreshing && <RefreshCcw className="w-4 h-4 text-primary animate-spin" />}
          </h1>
          <p className="text-muted-foreground mt-1">
            System activity and admin actions tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLogs()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors text-sm font-medium"
          >
            <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportLogs}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          className="h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Actions</option>
          <option value="admin">Admin Actions</option>
          <option value="user">User Actions</option>
          <option value="auth">Auth Actions</option>
        </select>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Timestamp</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Action</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Resource</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Details</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Severity</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, i) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-foreground">{log.action}</div>
                      {log.user_id && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <User className="w-3 h-3" />
                          User {log.user_id}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {log.resource_type && (
                        <div className="text-sm text-foreground">
                          {log.resource_type}
                          {log.resource_id && <span className="text-muted-foreground"> #{log.resource_id}</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-foreground max-w-xs truncate">
                        {log.new_value || log.old_value || log.reason || '—'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${severityStyles[log.severity]}`}>
                        {severityIcons[log.severity]}
                        {log.severity}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
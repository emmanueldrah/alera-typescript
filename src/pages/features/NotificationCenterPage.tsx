import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Archive, Bell, Check, CheckCircle, Inbox, MessageSquare, Search, Settings, AlertTriangle, FlaskConical, Pill, Calendar } from 'lucide-react';
import { useNotifications } from '@/contexts/useNotifications';
import { Button } from '@/components/ui/button';

const typeIcons: Record<string, React.ReactNode> = {
  appointment: <Calendar className="w-4 h-4" />,
  result: <FlaskConical className="w-4 h-4" />,
  prescription: <Pill className="w-4 h-4" />,
  reminder: <Bell className="w-4 h-4" />,
  emergency: <AlertTriangle className="w-4 h-4" />,
  alert: <AlertTriangle className="w-4 h-4" />,
  system: <Settings className="w-4 h-4" />,
  chat: <MessageSquare className="w-4 h-4" />,
};

const typeColors: Record<string, string> = {
  appointment: 'bg-primary/10 text-primary',
  result: 'bg-success/10 text-success',
  prescription: 'bg-info/10 text-info',
  reminder: 'bg-warning/10 text-warning',
  emergency: 'bg-destructive/10 text-destructive',
  alert: 'bg-destructive/10 text-destructive',
  system: 'bg-muted text-muted-foreground',
  chat: 'bg-accent/10 text-accent',
};

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const NotificationCenterPage = () => {
  const { notifications, unreadCount, markAsRead, markAllRead, archiveNotification } = useNotifications();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');

  const activeNotifications = useMemo(
    () => notifications.filter((notification) => !notification.archived),
    [notifications],
  );
  const archivedNotifications = useMemo(
    () => notifications.filter((notification) => notification.archived),
    [notifications],
  );

  const filtered = useMemo(() => {
    return activeNotifications.filter((notification) => {
      const matchesSearch = notification.title.toLowerCase().includes(search.toLowerCase()) || notification.message.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || notification.type === typeFilter;
      const matchesRead = readFilter === 'all' || (readFilter === 'unread' ? !notification.read : notification.read);
      return matchesSearch && matchesType && matchesRead;
    });
  }, [activeNotifications, readFilter, search, typeFilter]);

  const sorted = useMemo(
    () => [...filtered].sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime()),
    [filtered],
  );

  const stats = useMemo(() => ({
    total: activeNotifications.length,
    unread: unreadCount,
    archived: archivedNotifications.length,
  }), [activeNotifications.length, archivedNotifications.length, unreadCount]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Notification Center</h1>
          <p className="text-muted-foreground mt-1">Manage realtime alerts, reminders, and message updates</p>
        </div>
        {stats.unread > 0 && (
          <Button variant="outline" onClick={markAllRead} className="gap-2">
            <Check className="w-4 h-4" />
            Mark All Read ({stats.unread})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active', value: stats.total, accent: 'text-foreground', bg: 'bg-card border-border' },
          { label: 'Unread', value: stats.unread, accent: 'text-warning', bg: 'bg-warning/5 border-warning/30' },
          { label: 'Archived', value: stats.archived, accent: 'text-muted-foreground', bg: 'bg-muted/5 border-muted/30' },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`rounded-xl border p-4 ${stat.bg}`}>
            <div className="text-xs font-medium text-muted-foreground">{stat.label}</div>
            <div className={`mt-1 text-2xl font-bold ${stat.accent}`}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search notifications..."
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-11 rounded-xl border border-input bg-background px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="all">All Types</option>
          <option value="appointment">Appointments</option>
          <option value="result">Results</option>
          <option value="prescription">Prescriptions</option>
          <option value="reminder">Reminders</option>
          <option value="chat">Messages</option>
          <option value="emergency">Emergency</option>
          <option value="system">System</option>
        </select>
        <select value={readFilter} onChange={(event) => setReadFilter(event.target.value)} className="h-11 rounded-xl border border-input bg-background px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-12 text-muted-foreground">
          <Inbox className="mb-3 h-10 w-10" />
          <p className="text-sm">{activeNotifications.length === 0 ? 'No notifications yet' : 'No notifications match your search'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`rounded-xl border p-4 transition hover:border-primary/30 ${notification.read ? 'border-border bg-card' : 'border-primary/20 bg-primary/5'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeColors[notification.type]}`}>
                  {typeIcons[notification.type]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{notification.title}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    {!notification.read && <div className="mt-2 h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatTimeAgo(notification.timestamp)}</span>
                    <span className={`rounded-lg px-2 py-1 font-medium ${typeColors[notification.type]}`}>
                      {notification.type}
                    </span>
                    {notification.priority && notification.priority !== 'low' && (
                      <span className="rounded-lg bg-warning/10 px-2 py-1 font-medium text-warning">
                        {notification.priority} priority
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  {!notification.read && (
                    <button onClick={() => markAsRead(notification.id)} className="rounded-lg p-2 transition hover:bg-secondary" title="Mark as read">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </button>
                  )}
                  <button onClick={() => archiveNotification(notification.id)} className="rounded-lg p-2 transition hover:bg-secondary" title="Archive">
                    <Archive className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {archivedNotifications.length > 0 && (
        <div className="border-t border-border pt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">Archived ({archivedNotifications.length})</h2>
          <div className="space-y-2">
            {archivedNotifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="rounded-lg border border-border p-3 opacity-60">
                <div className="text-sm font-medium text-foreground">{notification.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{formatTimeAgo(notification.timestamp)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenterPage;

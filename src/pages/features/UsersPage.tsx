import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Heart, FlaskConical, ScanLine, Pill, Ambulance, Building2, ShieldCheck, Ban, CheckCircle, Inbox, Plus, Loader, Mail, Calendar } from 'lucide-react';
import type { UserRole } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DisplayUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  lastLogin?: string;
}

const roleIcons: Record<string, React.ReactNode> = {
  patient: <Users className="w-4 h-4" />,
  doctor: <Heart className="w-4 h-4" />,
  hospital: <Building2 className="w-4 h-4" />,
  laboratory: <FlaskConical className="w-4 h-4" />,
  imaging: <ScanLine className="w-4 h-4" />,
  pharmacy: <Pill className="w-4 h-4" />,
  ambulance: <Ambulance className="w-4 h-4" />,
  admin: <ShieldCheck className="w-4 h-4" />,
};

const roleLabels: Record<string, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  hospital: 'Hospital',
  laboratory: 'Laboratory',
  imaging: 'Imaging Center',
  pharmacy: 'Pharmacy',
  ambulance: 'Ambulance',
  admin: 'Admin',
};

const UsersPage = () => {
  const { user: currentUser, getUsers, addUser } = useAuth();
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'patient' as UserRole });
  const [error, setError] = useState('');

  useEffect(() => {
    const allUsers = getUsers();
    const displayUsers: DisplayUser[] = allUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: 'active' as const,
      joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
      lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : undefined,
    }));
    setUsers(displayUsers);
  }, [getUsers]);

  // Filter and sort users
  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Count users by role
  const usersByRole = useMemo(() => {
    return Object.fromEntries(
      (['patient', 'doctor', 'hospital', 'laboratory', 'imaging', 'pharmacy', 'ambulance', 'admin'] as UserRole[]).map(role => [
        role,
        users.filter(u => u.role === role).length,
      ]),
    );
  }, [users]);

  const toggle = (id: string) =>
    setUsers(
      users.map(u =>
        u.id !== id ? u : { ...u, status: u.status === 'active' ? ('suspended' as const) : ('active' as const) },
      ),
    );

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const newUser = await addUser(formData.name, formData.email, formData.password, formData.role as UserRole);
      setUsers([
        ...users,
        {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: 'active',
          joinDate: new Date().toLocaleDateString(),
        },
      ]);
      setFormData({ name: '', email: '', password: '', role: 'patient' });
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user');
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 } });

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users and roles</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
          <ShieldCheck className="w-10 h-10 mb-3" />
          <p className="text-sm">Only administrators can access user management</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users and roles</p>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account in the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Temporary Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">User Role</label>
                  <Select value={formData.role} onValueChange={role => setFormData({ ...formData, role: role as UserRole })}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="imaging">Imaging Center</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="ambulance">Ambulance</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser} disabled={isLoading} className="gap-2">
                  {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'Adding...' : 'Add User'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {(['patient', 'doctor', 'hospital', 'laboratory', 'imaging', 'pharmacy', 'ambulance', 'admin'] as UserRole[]).map((role, i) => (
          <motion.button
            key={role}
            {...card(i)}
            onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
            className={`p-3 rounded-lg border transition ${
              roleFilter === role
                ? 'bg-primary/10 border-primary'
                : 'bg-card border-border hover:border-primary/30'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="text-primary text-lg">{roleIcons[role]}</div>
              <div className="text-xs font-medium text-foreground">{usersByRole[role]}</div>
              <div className="text-xs text-muted-foreground max-w-[60px] truncate">{roleLabels[role]}</div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Users Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">{users.length === 0 ? 'No users in the system' : 'No users match your search'}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">User</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Joined</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition"
                >
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-foreground">{u.name}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Mail className="w-3 h-3" />
                      {u.email}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                      {roleIcons[u.role]} {roleLabels[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        u.status === 'active'
                          ? 'bg-success/10 text-success'
                          : u.status === 'pending'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {u.joinDate}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {isAdmin && (
                      <button
                        onClick={() => toggle(u.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          u.status === 'active'
                            ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                            : 'bg-success/10 text-success hover:bg-success/20'
                        }`}
                      >
                        {u.status === 'active' ? (
                          <>
                            <Ban className="w-3 h-3" />
                            Suspend
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Activate
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default UsersPage;

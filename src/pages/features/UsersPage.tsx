import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Heart, FlaskConical, ScanLine, Pill, Ambulance, Building2, ShieldCheck, Ban, CheckCircle, Inbox, Plus, Loader, Mail, Calendar, Activity, Trash2 } from 'lucide-react';
import type { UserRole } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/useAuth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { api, type AdminUserRow, type ApiUser } from '@/lib/apiService';
import { handleApiError } from '@/lib/errorHandler';
import { normalizeUserRole } from '@/lib/roleUtils';
import {
  getProfessionalVerificationStatus,
  getVerificationStatusLabel,
  type ProfessionalVerificationStatus,
} from '@/lib/verificationStatus';

interface DisplayUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: ProfessionalVerificationStatus;
  joinDate: string;
  lastLogin?: string;
  phone?: string;
}

const roleIcons: Record<string, React.ReactNode> = {
  patient: <Users className="w-4 h-4" />,
  doctor: <Heart className="w-4 h-4" />,
  hospital: <Building2 className="w-4 h-4" />,
  laboratory: <FlaskConical className="w-4 h-4" />,
  imaging: <ScanLine className="w-4 h-4" />,
  pharmacy: <Pill className="w-4 h-4" />,
  ambulance: <Ambulance className="w-4 h-4" />,
  physiotherapist: <Activity className="w-4 h-4" />,
  admin: <ShieldCheck className="w-4 h-4" />,
  super_admin: <ShieldCheck className="w-4 h-4 text-destructive" />,
};

const roleLabels: Record<string, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  hospital: 'Hospital',
  laboratory: 'Laboratory',
  imaging: 'Imaging Center',
  pharmacy: 'Pharmacy',
  ambulance: 'Ambulance',
  physiotherapist: 'Physiotherapist',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

const statusStyles: Record<ProfessionalVerificationStatus, string> = {
  verified: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  suspended: 'bg-destructive/10 text-destructive',
};

const nonElevatedRoles: UserRole[] = ['patient', 'doctor', 'hospital', 'laboratory', 'imaging', 'pharmacy', 'ambulance', 'physiotherapist'];
const elevatedRoles: UserRole[] = ['admin', 'super_admin'];
const allUserRoles: UserRole[] = [...nonElevatedRoles, ...elevatedRoles];

const backendRoleMap: Record<UserRole, ApiUser['role']> = {
  patient: 'patient',
  doctor: 'provider',
  hospital: 'hospital',
  laboratory: 'laboratory',
  imaging: 'imaging',
  pharmacy: 'pharmacist',
  ambulance: 'ambulance',
  physiotherapist: 'physiotherapist',
  admin: 'admin',
  super_admin: 'super_admin',
};

const isProfessionalRole = (role: UserRole) => role !== 'patient' && !elevatedRoles.includes(role);

const mapRowToDisplay = (u: AdminUserRow): DisplayUser => {
  const uiRole = normalizeUserRole(u.role) ?? 'patient';
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || u.email;
  const status = getProfessionalVerificationStatus(u.is_verified, u.is_active);

  return {
    id: String(u.id),
    name,
    email: u.email,
    role: uiRole,
    status,
    joinDate: u.created_at ? new Date(u.created_at).toLocaleDateString() : '—',
    lastLogin: u.last_login ? new Date(u.last_login).toLocaleDateString() : undefined,
    phone: u.phone ?? undefined,
  };
};

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<DisplayUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient' as UserRole,
    licenseNumber: '',
    licenseState: '',
    specialty: '',
  });
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setListError('');
    setListLoading(true);
    try {
      const rows = await api.admin.listAllUsers(0, 500);
      const list = Array.isArray(rows) ? rows : [];
      setUsers(list.map(mapRowToDisplay));
    } catch (err) {
      setListError(handleApiError(err));
      setUsers([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'super_admin') {
      void fetchUsers();
    }
  }, [currentUser?.role, fetchUsers]);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.phone && u.phone.toLowerCase().includes(search.toLowerCase()));
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const usersByRole = useMemo(() => {
    return Object.fromEntries(
      (['patient', 'doctor', 'hospital', 'laboratory', 'imaging', 'pharmacy', 'ambulance', 'physiotherapist', 'admin', 'super_admin'] as UserRole[]).map(role => [
        role,
        users.filter(u => u.role === role).length,
      ]),
    );
  }, [users]);

  const changeUserRole = async (id: string, newRole: string) => {
    setActionId(id);
    try {
      const backendRole = backendRoleMap[newRole as UserRole] ?? newRole;
      await api.admin.changeUserRole(id, backendRole);
      await fetchUsers();
      toast({ title: 'Role updated', description: 'The user role was updated successfully.' });
    } catch (err) {
      setListError(handleApiError(err));
    } finally {
      setActionId(null);
    }
  };

  const deleteUser = async (id: string) => {
    setActionId(id);
    try {
      await api.admin.deleteUser(id);
      await fetchUsers();
      setPendingDeleteUser(null);
      toast({ title: 'User deleted', description: 'The account has been permanently removed.' });
    } catch (err) {
      setListError(handleApiError(err));
    } finally {
      setActionId(null);
    }
  };

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const [firstName = '', ...lastNameParts] = formData.name.split(' ');
      const lastName = lastNameParts.join(' ') || 'User';
      const username = formData.email.split('@')[0] || formData.name.toLowerCase().replace(/\s+/g, '.');

      if (isProfessionalRole(formData.role) && (!formData.licenseNumber.trim() || !formData.licenseState.trim())) {
        setError('License number and license state are required for professional accounts');
        setIsLoading(false);
        return;
      }

      if (formData.role === 'admin' || formData.role === 'super_admin') {
        await api.admin.createAdmin({
          email: formData.email,
          username,
          password: formData.password,
          first_name: firstName,
          last_name: lastName,
          phone: undefined,
          role: formData.role,
        });
      } else {
        const backendRole = backendRoleMap[formData.role] ?? 'patient';
        await api.admin.createUser({
          email: formData.email,
          username,
          password: formData.password,
          first_name: firstName,
          last_name: lastName,
          phone: undefined,
          role: backendRole,
          license_number: formData.role === 'patient' ? undefined : formData.licenseNumber.trim(),
          license_state: formData.role === 'patient' ? undefined : formData.licenseState.trim(),
          specialty: formData.role === 'patient' ? undefined : formData.specialty.trim() || undefined,
        });
      }

      setFormData({ name: '', email: '', password: '', role: 'patient', licenseNumber: '', licenseState: '', specialty: '' });
      setIsDialogOpen(false);
      await fetchUsers();
      toast({ title: 'User created', description: `${formData.email} has been added successfully.` });
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (userId: string) => {
    setActionId(userId);
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      if (user.status === 'suspended') {
        await api.admin.reactivateUser(userId);
        toast({ title: 'User reactivated', description: `${user.name} can access the platform again.` });
      } else {
        await api.admin.deactivateUser(userId);
        toast({ title: 'User suspended', description: `${user.name} has been suspended.` });
      }
      await fetchUsers();
    } catch (err) {
      setListError(handleApiError(err));
    } finally {
      setActionId(null);
    }
  };

  const isAdminOrSuperAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 } });

  if (!isAdminOrSuperAdmin) {
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
          <p className="text-muted-foreground mt-1">Live users from the database ({users.length} loaded)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => void fetchUsers()} disabled={listLoading}>
            {listLoading ? <Loader className="w-4 h-4 animate-spin" /> : null}
            Refresh
          </Button>
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
                <DialogDescription>Registers a new account via the same API as sign-up</DialogDescription>
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
                      <SelectItem value="physiotherapist">Physiotherapist</SelectItem>
                      {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
                      {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                {isProfessionalRole(formData.role) && (
                  <div className="space-y-4 rounded-xl border border-border bg-secondary/30 p-4">
                    <div className="text-sm font-semibold text-foreground">License details</div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">License Number</label>
                      <input
                        type="text"
                        placeholder="License or registration number"
                        value={formData.licenseNumber}
                        onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">License State</label>
                      <input
                        type="text"
                        placeholder="State or jurisdiction"
                        value={formData.licenseState}
                        onChange={e => setFormData({ ...formData, licenseState: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Specialty</label>
                      <input
                        type="text"
                        placeholder="Optional specialty or department"
                        value={formData.specialty}
                        onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={() => void handleAddUser()} disabled={isLoading} className="gap-2">
                  {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'Adding...' : 'Add User'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {listError && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-xl">{listError}</div>
      )}

      <AlertDialog open={Boolean(pendingDeleteUser)} onOpenChange={(open) => { if (!open) setPendingDeleteUser(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user account?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteUser
                ? `This will permanently remove ${pendingDeleteUser.name} (${pendingDeleteUser.email}). This action cannot be undone.`
                : 'This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => pendingDeleteUser ? void deleteUser(pendingDeleteUser.id) : undefined}>
              Delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
        {(['patient', 'doctor', 'hospital', 'laboratory', 'imaging', 'pharmacy', 'ambulance', 'physiotherapist', 'admin', 'super_admin'] as UserRole[]).map((role, i) => (
          <motion.button
            key={role}
            {...card(i)}
            onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
            className={`p-3 rounded-lg border transition ${
              roleFilter === role ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:border-primary/30'
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

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All verification states</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending verification</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {listLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Loader className="w-10 h-10 mb-3 animate-spin" />
          <p className="text-sm">Loading users from the server…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">{users.length === 0 ? 'No users returned from the API' : 'No users match your search'}</p>
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
                    {u.phone && <div className="text-xs text-muted-foreground mt-0.5">{u.phone}</div>}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                      {roleIcons[u.role]} {roleLabels[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      data-testid={`user-verification-status-${u.id}`}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusStyles[u.status]}`}
                    >
                      {getVerificationStatusLabel(u.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {u.joinDate}
                      </div>
                      {u.lastLogin && <div>Last login: {u.lastLogin}</div>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Role Change */}
                      {((isSuperAdmin && u.id !== String(currentUser?.id)) ||
                        (currentUser?.role === 'admin' && !elevatedRoles.includes(u.role) && u.id !== String(currentUser?.id))) && (
                        <Select
                          value={u.role}
                          onValueChange={(newRole) => void changeUserRole(u.id, newRole)}
                          disabled={actionId === u.id}
                        >
                          <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(isSuperAdmin ? allUserRoles : nonElevatedRoles).map(role => (
                              <SelectItem key={role} value={role}>
                                {roleLabels[role]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {/* Status Toggle */}
                      {(
                        isSuperAdmin ||
                        (currentUser?.role === 'admin' && !elevatedRoles.includes(u.role))
                      ) && (
                        <button
                          onClick={() => void toggleStatus(u.id)}
                          disabled={actionId === u.id || u.id === String(currentUser?.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-40 ${
                            u.status === 'suspended'
                              ? 'bg-success/10 text-success hover:bg-success/20'
                              : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                          }`}
                        >
                          {actionId === u.id ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : u.status === 'suspended' ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Reactivate
                            </>
                          ) : (
                            <>
                              <Ban className="w-3 h-3" />
                              Suspend
                            </>
                          )}
                        </button>
                      )}

                      {/* Delete - Only for super_admin */}
                      {currentUser?.role === 'super_admin' && u.role !== 'super_admin' && (
                        <button
                          onClick={() => setPendingDeleteUser(u)}
                          disabled={actionId === u.id || u.id === String(currentUser?.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition disabled:opacity-40"
                        >
                          {actionId === u.id ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </>
                          )}
                        </button>
                      )}
                    </div>
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

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Ambulance, Wrench, Users, Fuel, AlertCircle, CheckCircle, Inbox, Activity, Clock, AlertTriangle, Zap, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { Button } from '@/components/ui/button';
import type { AmbulanceVehicle } from '@/data/mockData';

const VehiclesPage = () => {
  const { user } = useAuth();
  const { ambulances, addAmbulance, updateAmbulance, deleteAmbulance } = useAppData();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    callSign: '',
    plateNumber: '',
    type: 'Type-B' as AmbulanceVehicle['type'],
    fuel: 100,
    crew: '',
    equipment: '',
    nextMaintenanceDate: '',
  });

  const isAmbulance = user?.role === 'ambulance';

  // Filter ambulances
  const filtered = useMemo(() => {
    return ambulances.filter(v => statusFilter === 'all' || v.status === statusFilter);
  }, [ambulances, statusFilter]);

  // Fleet stats
  const stats = useMemo(() => {
    return {
      totalVehicles: ambulances.length,
      available: ambulances.filter(v => v.status === 'available').length,
      dispatched: ambulances.filter(v => v.status === 'dispatched' || v.status === 'in-transit' || v.status === 'on-scene').length,
      maintenance: ambulances.filter(v => v.status === 'maintenance').length,
      averageFuel: ambulances.length > 0 ? (ambulances.reduce((sum, v) => sum + v.fuel, 0) / ambulances.length).toFixed(0) : 0,
    };
  }, [ambulances]);

  const handleUpdateStatus = (vehicleId: string, newStatus: AmbulanceVehicle['status']) => {
    updateAmbulance(vehicleId, prev => ({ ...prev, status: newStatus }));
  };

  const handleRefuel = (vehicleId: string) => {
    updateAmbulance(vehicleId, prev => ({ ...prev, fuel: 100 }));
  };

  const handleCreateVehicle = () => {
    if (!newVehicle.callSign.trim() || !newVehicle.plateNumber.trim()) return;
    addAmbulance({
      id: `amb-${crypto.randomUUID()}`,
      callSign: newVehicle.callSign.trim(),
      plateNumber: newVehicle.plateNumber.trim(),
      type: newVehicle.type,
      status: 'available',
      fuel: Math.max(0, Math.min(100, newVehicle.fuel)),
      crew: newVehicle.crew
        .split(',')
        .map((member) => member.trim())
        .filter(Boolean)
        .map((member, index) => ({ name: member, role: index === 0 ? 'driver' : 'paramedic' as 'driver' | 'paramedic' | 'emt' })),
      equipment: newVehicle.equipment.split(',').map((item) => item.trim()).filter(Boolean),
      nextMaintenanceDate: newVehicle.nextMaintenanceDate || undefined,
      lastMaintenanceDate: new Date().toISOString(),
    });
    setNewVehicle({
      callSign: '',
      plateNumber: '',
      type: 'Type-B',
      fuel: 100,
      crew: '',
      equipment: '',
      nextMaintenanceDate: '',
    });
    setShowCreate(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-success/10 text-success';
      case 'dispatched':
      case 'in-transit':
      case 'on-scene':
        return 'bg-warning/10 text-warning';
      case 'returning':
        return 'bg-blue-500/10 text-blue-500';
      case 'maintenance':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 } });

  if (!isAmbulance) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Fleet Management</h1>
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-warning" />
          <p className="text-muted-foreground">This feature is only available for ambulance service staff</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Fleet Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage ambulance fleet operations</p>
        </div>
        <button onClick={() => setShowCreate((value) => !value)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
          {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCreate ? 'Close' : 'Add Vehicle'}
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-display font-semibold text-card-foreground">Register Ambulance Vehicle</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Call Sign</label>
              <input value={newVehicle.callSign} onChange={(e) => setNewVehicle((prev) => ({ ...prev, callSign: e.target.value }))} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Plate Number</label>
              <input value={newVehicle.plateNumber} onChange={(e) => setNewVehicle((prev) => ({ ...prev, plateNumber: e.target.value }))} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type</label>
              <select value={newVehicle.type} onChange={(e) => setNewVehicle((prev) => ({ ...prev, type: e.target.value as AmbulanceVehicle['type'] }))} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="Type-A">Type-A</option>
                <option value="Type-B">Type-B</option>
                <option value="Type-C">Type-C</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fuel %</label>
              <input type="number" min="0" max="100" value={newVehicle.fuel} onChange={(e) => setNewVehicle((prev) => ({ ...prev, fuel: Number(e.target.value) }))} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Crew</label>
              <input value={newVehicle.crew} onChange={(e) => setNewVehicle((prev) => ({ ...prev, crew: e.target.value }))} placeholder="Comma-separated crew names" className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Equipment</label>
              <input value={newVehicle.equipment} onChange={(e) => setNewVehicle((prev) => ({ ...prev, equipment: e.target.value }))} placeholder="Comma-separated equipment list" className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Next Maintenance</label>
              <input type="date" value={newVehicle.nextMaintenanceDate} onChange={(e) => setNewVehicle((prev) => ({ ...prev, nextMaintenanceDate: e.target.value }))} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreateVehicle} className="px-5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
              Save Vehicle
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
          <div className="text-muted-foreground text-xs font-medium">Total Vehicles</div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.totalVehicles}</div>
        </motion.div>
        <motion.div {...card(1)} className="bg-success/5 rounded-xl border border-success/30 p-4">
          <div className="text-success text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Available
          </div>
          <div className="text-2xl font-bold text-success mt-1">{stats.available}</div>
        </motion.div>
        <motion.div {...card(2)} className="bg-warning/5 rounded-xl border border-warning/30 p-4">
          <div className="text-warning text-xs font-medium flex items-center gap-1">
            <Activity className="w-3 h-3" /> In Service
          </div>
          <div className="text-2xl font-bold text-warning mt-1">{stats.dispatched}</div>
        </motion.div>
        <motion.div {...card(3)} className="bg-destructive/5 rounded-xl border border-destructive/30 p-4">
          <div className="text-destructive text-xs font-medium flex items-center gap-1">
            <Wrench className="w-3 h-3" /> Maintenance
          </div>
          <div className="text-2xl font-bold text-destructive mt-1">{stats.maintenance}</div>
        </motion.div>
        <motion.div {...card(4)} className="bg-primary/5 rounded-xl border border-primary/30 p-4">
          <div className="text-primary text-xs font-medium flex items-center gap-1">
            <Fuel className="w-3 h-3" /> Avg Fuel
          </div>
          <div className="text-2xl font-bold text-primary mt-1">{stats.averageFuel}%</div>
        </motion.div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'available', 'in-transit', 'on-scene', 'returning', 'maintenance'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/70'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Vehicle List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">No vehicles in this status</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((vehicle, i) => (
            <motion.div
              key={vehicle.id}
              {...card(i)}
              onClick={() => setSelectedVehicle(selectedVehicle === vehicle.id ? null : vehicle.id)}
              className="bg-card rounded-2xl border border-border p-5 cursor-pointer hover:border-primary/30 transition"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(vehicle.status)}`}>
                  <Ambulance className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">{vehicle.callSign}</div>
                  <div className="text-xs text-muted-foreground">{vehicle.plateNumber}</div>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium text-foreground">{vehicle.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Fuel className="w-3 h-3" /> Fuel
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          vehicle.fuel > 50 ? 'bg-success' : vehicle.fuel > 25 ? 'bg-warning' : 'bg-destructive'
                        }`}
                        style={{ width: `${vehicle.fuel}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground">{vehicle.fuel}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1).replace('-', ' ')}
                  </span>
                </div>
              </div>

              {selectedVehicle === vehicle.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-border pt-4 space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Crew
                    </div>
                    <div className="space-y-1">
                      {vehicle.crew.map((member, i) => (
                        <div key={i} className="text-sm text-foreground">
                          {member.name} <span className="text-xs text-muted-foreground">• {member.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {vehicle.equipment.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                        <Wrench className="w-3 h-3" /> Equipment
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {vehicle.equipment.map((equip, i) => (
                          <span key={i} className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs">
                            <Zap className="w-2.5 h-2.5" /> {equip}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {vehicle.nextMaintenanceDate && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Maintenance
                      </div>
                      <div className="text-sm text-foreground">Next: {new Date(vehicle.nextMaintenanceDate).toLocaleDateString()}</div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {vehicle.status === 'available' && (
                      <>
                        <Button
                          onClick={e => {
                            e.stopPropagation();
                            handleUpdateStatus(vehicle.id, 'maintenance');
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1"
                        >
                          <Wrench className="w-3 h-3" /> Maintenance
                        </Button>
                        {vehicle.fuel < 80 && (
                          <Button
                            onClick={e => {
                              e.stopPropagation();
                              handleRefuel(vehicle.id);
                            }}
                            size="sm"
                            className="flex-1 gap-1"
                          >
                            <Fuel className="w-3 h-3" /> Refuel
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      onClick={e => {
                        e.stopPropagation();
                        deleteAmbulance(vehicle.id);
                      }}
                      variant="outline"
                      size="sm"
                      className="gap-1 text-destructive"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </Button>
                    {vehicle.status === 'maintenance' && (
                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          handleUpdateStatus(vehicle.id, 'available');
                        }}
                        size="sm"
                        className="w-full gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Mark Available
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Low Fuel Alert */}
      {ambulances.some(v => v.fuel < 25) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive">Low Fuel Alert</h3>
            <p className="text-sm text-destructive/80 mt-1">
              {ambulances.filter(v => v.fuel < 25).length} vehicle{ambulances.filter(v => v.fuel < 25).length !== 1 ? 's' : ''} have fuel below 25%. Schedule refueling.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VehiclesPage;

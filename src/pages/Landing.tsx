import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Calendar, FlaskConical, ScanLine, Pill, Ambulance, ShieldCheck, Activity, Users, Building2 } from 'lucide-react';

const features = [
  { icon: <Calendar className="w-6 h-6" />, title: 'Smart Appointments', desc: 'Book and manage appointments with real-time availability across providers.' },
  { icon: <FlaskConical className="w-6 h-6" />, title: 'Lab Integration', desc: 'Seamless lab test ordering, processing, and digital result delivery.' },
  { icon: <ScanLine className="w-6 h-6" />, title: 'Imaging Hub', desc: 'Request and receive imaging scans with instant result sharing.' },
  { icon: <Pill className="w-6 h-6" />, title: 'Pharmacy Network', desc: 'Digital prescriptions dispensed directly to your nearest pharmacy.' },
  { icon: <Ambulance className="w-6 h-6" />, title: 'Emergency Dispatch', desc: 'One-tap ambulance requests with real-time vehicle tracking.' },
  { icon: <Activity className="w-6 h-6" />, title: 'Medical Timeline', desc: 'Complete patient history — every visit, test, and prescription in one view.' },
];

const stats = [
  { value: '1,200+', label: 'Active Patients' },
  { value: '150+', label: 'Verified Doctors' },
  { value: '50+', label: 'Partner Facilities' },
  { value: '99.9%', label: 'Uptime' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">ALERA</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition">Sign In</Link>
            <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition flex items-center gap-1.5">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-info rounded-full blur-[150px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
              <Activity className="w-4 h-4" /> Healthcare Reimagined
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-extrabold text-primary-foreground leading-tight mb-6">
              One platform for<br />
              <span className="text-gradient">complete healthcare</span>
            </h1>
            <p className="text-lg text-sidebar-foreground/70 max-w-xl mx-auto mb-10">
              ALERA connects patients, doctors, hospitals, labs, pharmacies, and emergency services into a unified healthcare ecosystem.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/signup" className="px-8 py-3.5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition flex items-center gap-2 shadow-glow">
                Start Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="px-8 py-3.5 rounded-xl border border-sidebar-border text-sidebar-foreground font-medium hover:bg-sidebar-accent transition">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <div className="text-3xl font-display font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold text-foreground mb-3">Everything connected</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">From booking an appointment to receiving test results — every step is integrated.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-glow transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-all">
                  {f.icon}
                </div>
                <h3 className="text-lg font-display font-semibold text-card-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold text-foreground mb-3">Built for everyone</h2>
            <p className="text-muted-foreground">Dedicated dashboards for every healthcare role</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: <Users className="w-5 h-5" />, label: 'Patients' },
              { icon: <Heart className="w-5 h-5" />, label: 'Doctors' },
              { icon: <FlaskConical className="w-5 h-5" />, label: 'Labs' },
              { icon: <ScanLine className="w-5 h-5" />, label: 'Imaging' },
              { icon: <Pill className="w-5 h-5" />, label: 'Pharmacies' },
              { icon: <Ambulance className="w-5 h-5" />, label: 'Ambulance' },
              { icon: <Building2 className="w-5 h-5" />, label: 'Hospitals' },
              { icon: <ShieldCheck className="w-5 h-5" />, label: 'Admin' },
            ].map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                <span className="text-primary">{r.icon}</span>
                <span className="font-medium text-card-foreground text-sm">{r.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">Ready to transform your healthcare experience?</h2>
            <p className="text-muted-foreground mb-8">Join ALERA today and be part of the connected healthcare revolution.</p>
            <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition shadow-glow">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">ALERA</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 ALERA Healthcare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

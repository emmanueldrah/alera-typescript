import React from 'react';
import { ShieldAlert, RefreshCw, Clock } from 'lucide-react';

interface MaintenancePageProps {
  message?: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ 
  message = "ALERA is currently undergoing scheduled maintenance to improve our services. We'll be back online shortly." 
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
            <div className="relative bg-blue-50 p-4 rounded-full">
              <ShieldAlert className="h-12 w-12 text-blue-600" />
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          System Maintenance
        </h1>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          {message}
        </p>
        
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg text-left">
            <Clock className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Estimated Wait</p>
              <p className="text-sm text-slate-700">Usually 15-30 minutes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg text-left">
            <RefreshCw className="h-5 w-5 text-slate-400 animate-spin-slow" />
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Auto Refresh</p>
              <p className="text-sm text-slate-700">Checking status periodically</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          Check Again
        </button>
        
        <div className="mt-8 pt-8 border-t border-slate-100">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} ALERA Healthcare Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;

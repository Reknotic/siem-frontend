import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, YAxis, CartesianGrid } from 'recharts';
import { 
  LoaderCircle, ShieldAlert, Activity, Database, Upload, Play, 
  Cpu, AlertTriangle, Search, Trash2, LayoutDashboard, 
  ListFilter, Globe, CheckCircle2, Terminal, User, Volume2, VolumeX, 
  ArrowDown, CloudUpload, FileText, Settings as SettingsIcon, Power, PowerOff, Info, X 
} from 'lucide-react';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#a855f7', '#00C49F'];

const StatCard = ({ icon, title, value, highlight }) => (
  <div className={`bg-[#0f172a] border border-slate-800 p-3 md:p-5 rounded-xl transition-all hover:border-slate-600 ${highlight ? 'ring-1 ring-red-500/20' : ''}`}>
  <div className="flex items-center gap-3 md:gap-4">
    <div className="p-2 md:p-3 bg-[#020617] rounded-lg border border-slate-800 shrink-0">
      <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
        {icon}
      </div>
    </div>
    <div className="min-w-0">
      <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
        {title}
      </p>
      <p className={`text-xl md:text-2xl font-black leading-none mt-1 ${highlight ? 'text-red-500' : 'text-white'}`}>
        {value}
      </p>
    </div>
  </div>
</div>
);

const Login = ({ onLoginSuccess }) => {
  // Mode Toggles
  const [view, setView] = useState('login'); 
  const [resetStep, setResetStep] = useState(1); 

  // Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Custom Alerts State for Login Page
  const [loginAlerts, setLoginAlerts] = useState([]);
  const addLoginAlert = (message, type = 'info') => {
    const id = Date.now();
    setLoginAlerts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setLoginAlerts(prev => prev.filter(a => a.id !== id)), 5000);
  };

  // Register/Reset Specific States
  const [regData, setRegData] = useState({ question: "What was the name of your first pet?", answer: '' });
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [resetData, setResetData] = useState({ answer: '', newPass: '' });

  const SECURITY_QUESTIONS = [
    "What was the name of your first pet?",
    "What is your mother's maiden name?",
    "What was the name of your elementary school?",
    "In what city were you born?"
  ];

  // --- LOGIC: LOGIN ---
  const handleLogin = async (e) => {
  e.preventDefault();
  if (!username || !password) return addLoginAlert("Credentials Required", "danger");

  // USE THIS: URLSearchParams
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  try {
    const res = await fetch("https://hussain-2003-siem-backend-v2.hf.space/login", { 
      method: 'POST', 
      // Do NOT set any headers. URLSearchParams tells the browser 
      // to set 'application/x-www-form-urlencoded' automatically.
      body: params 
    });

    // Check if the server actually sent JSON
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server did not return JSON");
    }

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('siem_token', data.access_token);
      onLoginSuccess();
    } else {
      addLoginAlert(data.detail || "Access Denied", "danger");
    }
  } catch (err) {
    console.error("DEBUG LOG:", err); // Look at your browser console (F12) for this!
    addLoginAlert("Terminal Connection Failed", "danger");
  }
};

  // --- LOGIC: REGISTER ---
  const handleRegister = async () => {
    if (!username || !password || !regData.answer) return addLoginAlert("All fields required", "danger");

    const res = await fetch("https://hussain-2003-siem-backend-v2.hf.space/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        username, 
        password, 
        security_question: regData.question, 
        security_answer: regData.answer 
      })
    });
    if (res.ok) {
      addLoginAlert("Operator Account Initialized", "success");
      setView('login');
    } else {
      const data = await res.json();
      addLoginAlert(data.detail || "Registration Failed", "danger");
    }
  };

  // --- LOGIC: FORGOT PASSWORD ---
  const fetchQuestion = async () => {
    if (!username) return addLoginAlert("Enter username to verify", "danger");
    const res = await fetch(`https://hussain-2003-siem-backend-v2.hf.space/auth/security-question/${username}`);
    if (res.ok) {
      const data = await res.json();
      setSecurityQuestion(data.question);
      setResetStep(2);
      addLoginAlert("Identity Found: Answer Security Prompt", "info");
    } else {
      addLoginAlert("Operator Not Found in Database", "danger");
    }
  };

  const handleReset = async () => {
    if (!resetData.answer || !resetData.newPass) return addLoginAlert("All fields required", "danger");
    
    const res = await fetch("https://hussain-2003-siem-backend-v2.hf.space/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        security_answer: resetData.answer,
        new_password: resetData.newPass
      })
    });
    if (res.ok) {
      addLoginAlert("Security Protocols Updated. Access Restored.", "success");
      setView('login');
      setResetStep(1);
    } else {
      const data = await res.json();
      addLoginAlert(data.detail || "Verification Failed", "danger");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-2xl transition-all relative overflow-hidden">
        
        {/* Animated Background Pulse */}
        <div className={`absolute top-0 left-0 w-full h-1 opacity-20 ${view === 'login' ? 'bg-red-500 animate-pulse' : 'bg-cyan-500 animate-pulse'}`} />

        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full border transition-colors ${view === 'login' ? 'bg-red-500/10 border-red-500/20' : 'bg-cyan-500/10 border-cyan-500/20'}`}>
            <ShieldAlert className={view === 'login' ? 'text-red-500' : 'text-cyan-500'} size={32} />
          </div>
        </div>

        <h2 className="text-xl font-black text-white text-center uppercase tracking-tighter mb-2">
          {view === 'login' ? 'Terminal Access' : view === 'register' ? 'Register Operator' : 'Account Recovery'}
        </h2>
        <p className="text-slate-500 text-[10px] text-center uppercase tracking-[0.2em] mb-8">System ID: SIEM-OS-PRO</p>

        {/* --- VIEW: LOGIN --- */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Username" className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-red-500/50 transition-all" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-red-500/50 transition-all" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-900/20">Initialize Session</button>
            <div className="flex justify-between mt-4">
               <button type="button" onClick={() => setView('register')} className="text-[9px] text-slate-500 hover:text-white uppercase font-bold transition-colors">New Operator?</button>
               <button type="button" onClick={() => setView('forgot')} className="text-[9px] text-slate-500 hover:text-white uppercase font-bold transition-colors">Forgot Access?</button>
            </div>
          </form>
        )}

        {/* --- VIEW: REGISTER --- */}
        {view === 'register' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <input type="text" placeholder="New Username" className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-cyan-500/50" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Set Password" className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-cyan-500/50" onChange={(e) => setPassword(e.target.value)} />
            
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-bold uppercase ml-1">Security Question</label>
              <select className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-white text-xs outline-none focus:border-cyan-500/50" onChange={(e) => setRegData({...regData, question: e.target.value})}>
                {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            
            <input type="text" placeholder="Your Answer" className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-cyan-500/50" onChange={(e) => setRegData({...regData, answer: e.target.value})} />
            
            <button onClick={handleRegister} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg shadow-cyan-900/20">Create Profile</button>
            <button onClick={() => setView('login')} className="w-full text-[9px] text-slate-500 hover:text-white uppercase font-bold mt-2">Return to Login</button>
          </div>
        )}

        {/* --- VIEW: FORGOT --- */}
        {view === 'forgot' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            {resetStep === 1 ? (
              <>
                <input type="text" placeholder="Enter Username" className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-cyan-500/50" onChange={(e) => setUsername(e.target.value)} />
                <button onClick={fetchQuestion} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all">Verify Identity</button>
              </>
            ) : (
              <>
                <div className="p-4 bg-[#020617]/50 border border-cyan-500/20 rounded-xl text-xs text-cyan-400 font-bold italic border-dashed">Prompt: {securityQuestion}</div>
                <input type="text" placeholder="Secret Answer" className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-cyan-500/50" onChange={(e) => setResetData({...resetData, answer: e.target.value})} />
                <input type="password" placeholder="New Password" className="w-full bg-[#020617] border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-red-500/50" onChange={(e) => setResetData({...resetData, newPass: e.target.value})} />
                <button onClick={handleReset} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all">Reset Password</button>
              </>
            )}
            <button onClick={() => { setView('login'); setResetStep(1); }} className="w-full text-[9px] text-slate-500 hover:text-white uppercase font-bold">Cancel</button>
          </div>
        )}
      </div>

      {/* --- RENDER CUSTOM ALERTS ON LOGIN PAGE --- */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-80">
        {loginAlerts.map(alert => (
          <div key={alert.id} className={`flex items-center justify-between p-4 rounded-xl border animate-in slide-in-from-right-full duration-300 ${alert.type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500'}`}>
            <div className="flex items-center gap-3">
              <ShieldAlert size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{alert.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};



const Dashboard = ({ onLogout }) => {
  // ==========================================
  // 1. STATE & CONFIGURATION
  // ==========================================
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_logs: 0, threats_today: 0, system_status: "Operational", ai_accuracy: "N/A" });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [threatDistribution, setThreatDistribution] = useState([]);
  const [forensicData, setForensicData] = useState({ dashboard_ips: {}, training_ips: {} });
  const [intelDb, setIntelDb] = useState({});
  const [uploading, setUploading] = useState(false);
  const [training, setTraining] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [matrixUrl, setMatrixUrl] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [ticketStatuses, setTicketStatuses] = useState({});

  const [dashFile, setDashFile] = useState(null);
  const [trainFile, setTrainFile] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  
  const [snifferActive, setSnifferActive] = useState(true);

  const terminalEndRef = useRef(null); 
  const incidentEndRef = useRef(null); 
  const streamEndRef = useRef(null);
  const trainingLogEndRef = useRef(null);
  const incidentContainerRef = useRef(null);


  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' });

  const [newIntelIp, setNewIntelIp] = useState("");
  const [newIntelActor, setNewIntelActor] = useState("");

  const [trainingHistory, setTrainingHistory] = useState([]);
  const [trainingStatus, setTrainingStatus] = useState({ status: 'idle', accuracy: 'N/A', matrix_url: null, error: null });

  const [isManualView, setIsManualView] = useState(false);

  const [selectedEngine, setSelectedEngine] = useState(
  localStorage.getItem('activeEngine') || "xgboost"
);

  const cardStyle = "bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl overflow-hidden";
  const cardHeaderStyle = "p-4 border-b border-slate-800 bg-[#1e293b]/30 flex justify-between items-center";

  const [alerts, setAlerts] = useState([]);

  const [selectedFeatures, setSelectedFeatures] = useState([]);

  //const lastNotificationTime = useRef(Date.now());
  const sessionStartTime = useRef(Date.now());

  



  // --- REQUEST BLOCK IP CONFIRM ---

  const requestBlockConfirm = (ip) => {
  const confirmId = Date.now();
  setAlerts(prev => [{
    id: confirmId,
    type: 'danger', 
    isConfirm: true,
    confirmText: "BLOCK IP",
    msg: `CONFIRM SYSTEM BLOCK: Are you sure you want to blacklist ${ip} at the system firewall?`,
    onConfirm: () => {
      handleBlockIP(ip); // Fixed function name here
      setAlerts(current => current.filter(a => a.id !== confirmId));
    }
  }, ...prev]);
};

// --- REQUEST UNBLOCK CONFIRM ---

const requestUnblockConfirm = (ip) => {
  const confirmId = Date.now();
  setAlerts(prev => [{
    id: confirmId,
    type: 'info', // Use cyan/info for restorative actions
    isConfirm: true,
    confirmText: "UNBLOCK IP",
    msg: `RESTORE ACCESS: Are you sure you want to remove the firewall rule for ${ip}?`,
    onConfirm: async () => {
      // THE ACTUAL LOGIC GOES HERE
      try {
        // Updated to use a more robust POST structure or DELETE depending on your backend
        // Also added a timeout to prevent the "hanging" feel
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`https://hussain-2003-siem-backend-v2.hf.space/api/unblock`, { 
          method: 'POST', // Changed to POST as it's often more stable for HF spaces
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ip: ip }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if(res.ok) {
          addAlert(`${ip} has been unblocked from the database. Syncing firewall...`, "success");
          fetchData(); 
        } else {
          const errorData = await res.json().catch(() => ({}));
          addAlert(`Backend Error: ${errorData.message || res.statusText}`, "danger");
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          addAlert("Request timed out - Backend might be sleeping", "danger");
        } else {
          addAlert("Failed to reach security engine. Check your API URL.", "danger");
        }
      }
      // Close the confirmation alert after clicking
      setAlerts(current => current.filter(a => a.id !== confirmId));
    }
  }, ...prev]);
};

// --- REQUEST DELETE LOGS CONFIRM ---
const requestClearDashboardConfirm = () => {
  const confirmId = Date.now();
  setAlerts(prev => [{
    id: confirmId,
    type: 'danger',
    isConfirm: true,
    confirmText: "Wipe Database",
    msg: "DASHBOARD PURGE: Are you sure you want to delete all visible security alerts?",
    onConfirm: async () => {
      try {
        const res = await fetch("https://hussain-2003-siem-backend-v2.hf.space/clear-alerts", { method: 'DELETE' });
        if (res.ok) {
          fetchData(); // Refresh the feed and stats
          addAlert("Dashboard logs purged successfully", "success");
        }
      } catch (err) {
        addAlert("Failed to reach security engine", "danger");
      }
      // Remove the confirmation alert
      setAlerts(current => current.filter(a => a.id !== confirmId));
    }
  }, ...prev]);
};

// --- REQUEST DELETE MODEL CONFIRM ---
const requestPurgeHistoryConfirm = () => {
  const confirmId = Date.now();
  setAlerts(prev => [{
    id: confirmId,
    type: 'danger',
    isConfirm: true,
    confirmText: "Wipe AI Training History",
    msg: "DATABASE PURGE: Are you sure you want to delete all historical training records?",
    onConfirm: async () => {
      try {
        const res = await fetch("https://hussain-2003-siem-backend-v2.hf.space/clear-training-history", { method: 'DELETE' });
        if(res.ok) {
          fetchHistory(); // Refresh the table
          addAlert("Training history purged from database", "success");
        }
      } catch (err) {
        addAlert("Failed to reach security engine", "danger");
      }
      // Remove the confirmation alert
      setAlerts(current => current.filter(a => a.id !== confirmId));
    }
  }, ...prev]);
};

const handleBlockIP = async (ip) => {
    try {
        const res = await fetch(`https://hussain-2003-siem-backend-v2.hf.space/block-ip/${ip}`, { method: 'POST' });
        const data = await res.json();

        if (res.ok) {
            addAlert(`IP ${ip} blocked and blacklisted`, "success");
            await fetchData(); 
        } else {
            addAlert(data.detail || "Failed to block IP. Check Admin privileges.", "danger");
        }
    } catch (e) { 
        addAlert("Connection error to security engine", "danger");
    }
};

const handleUnblock = async (ip) => {
  try {
    const res = await fetch(`https://hussain-2003-siem-backend-v2.hf.space/unblock-ip/${ip}`, { 
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      addAlert(`Firewall rule for ${ip} removed.`, "info");
      fetchData();
    } else {
      // This helps us see if it's a 404, 405, or 500 error
      const errorData = await res.json().catch(() => ({}));
      addAlert(`Backend Error: ${errorData.detail || res.statusText}`, "danger");
    }
  } catch (err) {
    addAlert("Security Engine Unreachable. Check CORS settings.", "danger");
  }
};

  // --- ACtiVE MODEL HANDLING ---

const handleActivateModel = async (engineId) => {
    setSelectedEngine(engineId); 

    try {
        const res = await fetch(`https://hussain-2003-siem-backend-v2.hf.space/models/${engineId}/activate`, {
            method: "POST"
        });
        
        if (res.ok) {
            const data = await res.json();
            
            // 1. Update history first
            await fetchHistory(); 
            
            // 2. Update the stats state with the NEW accuracy from the response
            // This prevents the "flicker" because we are using the 
            // confirmed data from the activation result.
            if (data.accuracy !== undefined) {
                const formattedAcc = `${(data.accuracy * 100).toFixed(2)}%`;
                setStats(prev => ({
                    ...prev,
                    ai_accuracy: formattedAcc
                }));
            }

            // 3. Optional: Trigger a full stats refresh to ensure 
            // the whole dashboard is in sync with the backend
            if (typeof fetchData === 'function') {
                await fetchData(); 
            }

            addAlert(`${engineId.toUpperCase()} activated for live detection`, "success");
        } else {
            const err = await res.json();
            addAlert(err.detail || "Model not trained yet.", "info");
        }
    } catch (e) {
        console.error("Activation Error:", e);
    }
};


const clearHistory = async () => {
  // Optional: Add a confirmation dialog
  if (!window.confirm("Are you sure you want to clear all training history?")) return;

  try {
    const response = await fetch("https://hussain-2003-siem-backend-v2.hf.space/training-history/clear", {
      method: "DELETE",
    });

    if (response.ok) {
      setTrainingHistory([]); // Manually clear local state for instant UI update
      addAlert("Training history cleared successfully", "success");
    } else {
      addAlert("Failed to clear history", "danger");
    }
  } catch (error) {
    console.error("Clear History Error:", error);
    addAlert("Backend unreachable", "danger");
  }
};

// --- addAlert function ---
  const addAlert = (msg, type = 'info') => {
  const id = Date.now();
  // Add the new alert to the array
  setAlerts(prev => [...prev, { id, msg, type }]);
  
  // Automatically remove it after 5 seconds
  setTimeout(() => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, 5000);
};

  const tooltipStyle = {
    contentStyle: { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' },
    itemStyle: { color: '#22d3ee' },
    cursor: { fill: '#1e293b' }
  };

  // ==========================================
  // 2. DATA ORCHESTRATION
  // ==========================================
const fetchData = useCallback(async () => {
  try {
    const t = Date.now();
    
    const [sRes, dRes, fRes, snifRes, intelRes] = await Promise.all([
      fetch(`https://hussain-2003-siem-backend-v2.hf.space/stats?t=${t}`),
      fetch(`https://hussain-2003-siem-backend-v2.hf.space/dashboard-data?t=${t}`),
      fetch(`https://hussain-2003-siem-backend-v2.hf.space/analyze-dataset?t=${t}`),
      fetch(`https://hussain-2003-siem-backend-v2.hf.space/sensor/status?t=${t}`),
      fetch(`https://hussain-2003-siem-backend-v2.hf.space/intel?t=${t}`)
    ]);

    const sData = await sRes.json();
    const dData = await dRes.json();
    const fData = await fRes.json();
    const snifData = await snifRes.json();
    const intelData = await intelRes.json(); 

    setStats(prev => ({ ...sData, ai_accuracy: prev.ai_accuracy }));
    setSnifferActive(snifData.active);
    
    const allAlerts = dData.recent_alerts || [];
    
    setRecentAlerts(prevRecent => {
      allAlerts.forEach(incoming => {
        const incomingTime = new Date(incoming.timestamp).getTime();
        
        // 1. Session Guard (Prevents alerts from logs that happened before you logged in)
        const isLiveEvent = incomingTime > sessionStartTime.current;

        // 2. STRICT EXISTENCE CHECK
        // We check if this specific log (by ID or Timestamp+IP) has EVER been seen by the state
        const alreadySeen = prevRecent.some(existing => 
          existing.id === incoming.id || 
          (existing.timestamp === incoming.timestamp && existing.source_ip === incoming.source_ip)
        );

        // 3. Only add the pop-up alert if it is brand new AND critical
        //if (!alreadySeen && isLiveEvent && incoming.severity === 'Critical') {
          //addAlert(`CRITICAL_THREAT: ${incoming.alert_type} from ${incoming.source_ip}`, "danger");
    //}
  });
  
  return allAlerts; // Updates the table, but the addAlert trigger is now protected
});
    
    const dbStatuses = {};
    allAlerts.forEach(alert => {
      const id = alert.id || `${alert.source_ip}-${alert.timestamp}`;
      if (alert.status) dbStatuses[id] = alert.status;
    });
    setTicketStatuses(prev => ({ ...prev, ...dbStatuses }));

    setIntelDb(intelData || {}); 
    
    const newThreatDist = Object.entries(dData.threat_types || {})
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));

    setThreatDistribution(prev => {
      const isSame = JSON.stringify(prev) === JSON.stringify(newThreatDist);
      return isSame ? prev : newThreatDist;
    });
    
    setForensicData(fData);
    setLoading(false);
  } catch (e) { 
    console.error("Fetch Error:", e); 
  }
}, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSystemToggle = async () => {
    const isStopping = snifferActive;
    const nextState = isStopping ? "stop" : "start";
    setSyncing(true);
    try {
      const res = await fetch(`https://hussain-2003-siem-backend-v2.hf.space/sensor/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextState })
      });
      
      if (res.ok) {
        setSnifferActive(!snifferActive);
      }
    } catch (e) { 
      console.error("System Toggle Failed:", e); 
    } finally { 
      setSyncing(false); 
    }
  };

  const fetchHistory = useCallback(async (isAutoRefresh = false) => {
  try {
    const res = await fetch("https://hussain-2003-siem-backend-v2.hf.space/training-history");
    const data = await res.json();
    setTrainingHistory(data);

    if (data && data.length > 0) {
      const active = data.find(h => h.is_active) || data[0];
      
      // Update stats (Accuracy) ALWAYS so the yellow text stays current
      const formattedAcc = `${(active.accuracy * 100).toFixed(2)}%`;
      setStats(prev => ({ ...prev, ai_accuracy: formattedAcc }));

      // ONLY update the image if we aren't "Locked" into a Recall view
      if (!isManualView) {
        const finalPath = active.confusion_matrix.startsWith('data:') || active.confusion_matrix.startsWith('http')
          ? active.confusion_matrix
          : `https://hussain-2003-siem-backend-v2.hf.space${active.confusion_matrix}`;
          
        setMatrixUrl(finalPath);
        setSelectedFeatures(active.top_features || []);
      }
    }
  } catch (e) { console.error(e); }
}, [isManualView, setMatrixUrl, setStats]);

useEffect(() => {
    fetchHistory(false); // Initial load
    
    const interval = setInterval(() => fetchHistory(true), 30000); // Auto-refresh
    return () => clearInterval(interval);
}, [fetchHistory]);

  // Add this inside your Dashboard function
useEffect(() => {
  const syncWithBackendBrain = async () => {
    try {
      const response = await fetch("https://hussain-2003-siem-backend-v2.hf.space/active-model");
      const data = await response.json();
      
      // If backend says 'rf', this will update your dropdown and badge automatically
      if (data.active_engine) {
        setSelectedEngine(data.active_engine);
      }
    } catch (error) {
      console.error("Could not sync engine state with backend:", error);
    }
  };

  syncWithBackendBrain();
}, []); // Empty array means: Run once on reload

// Update this whenever the engine changes (in your dropdown handler)
const handleEngineChange = (e) => {
  const newEngine = e.target.value;
  setSelectedEngine(newEngine);
  localStorage.setItem('activeEngine', newEngine);
};

  const updateTicketStatus = async (id, newStatus) => {
    setSyncing(true);
    setTicketStatuses(prev => ({ ...prev, [id]: newStatus }));
    try {
      await fetch(`https://hussain-2003-siem-backend-v2.hf.space/update-incident/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) { console.error("DB Update Error:", e); }
    finally { setTimeout(() => setSyncing(false), 500); }
  };

  // --- UPDATED HANDLE UPLOAD ---
  const handleUpload = async (e, mode) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    const endpoint = mode === 'dash' ? 'upload-csv-dash' : 'upload-csv-train';
    
    try {
      const res = await fetch(`https://hussain-2003-siem-backend-v2.hf.space/${endpoint}`, { 
        method: "POST", 
        body: formData 
      });

      if (res.ok) {
        const data = await res.json();
        
        if (mode === 'dash') {
          setDashFile(file.name);
          // Wait for the data refresh to ensure UI updates with new logs
          await fetchData();
        } else {
          setTrainFile(data.filename);
        }
        
        // REPLACE: Success notification
        addAlert(`IMPORT_SUCCESS: ${file.name} synchronized with system.`, "success");
        
      } else {
        const err = await res.json();
        // REPLACE: Error notification
        addAlert(`UPLOAD_FAILURE: ${err.detail || "Access denied or invalid format."}`, "danger");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      // REPLACE: Connection error notification
      addAlert("NETWORK_ERROR: Security engine communication timeout.", "danger");
    } finally { 
      setUploading(false); 
      // Reset input so the same file can be uploaded again if needed
      e.target.value = null; 
    }
  };

  const trainModel = async () => {
  if (!trainFile) {
    // Using your new bottom-right alert system
    addAlert("Deployment Failed: No training CSV source detected.", "danger");
    return;
  }

  setTraining(true);
  // Clear old matrix while training new one
  setMatrixUrl(null);
  setLogs(["[SYSTEM] Initializing Multi-Engine Training Task..."]);
  
  // Notify user that the specific engine is starting
  addAlert(`Engine Startup: ${selectedEngine.toUpperCase()} is now training...`, "info");

  try {
    // Updated URL to include the model_type parameter
    const startRes = await fetch(
      `https://hussain-2003-siem-backend-v2.hf.space/train/?filename=${encodeURIComponent(trainFile)}&model_type=${selectedEngine}`, 
      { method: "POST" }
    );

    if (startRes.ok) {
      const pollTimer = setInterval(async () => {
        const progRes = await fetch("https://hussain-2003-siem-backend-v2.hf.space/training-progress");
        const progData = await progRes.json();
        
        setLogs(progData.logs || []);

        if (progData.status === "complete") {
          // Sync Stats and UI
          const formattedAcc = progData.accuracy;
          setStats(prev => ({ ...prev, ai_accuracy: formattedAcc }));
          
          // Fix: Ensure the URL is prefixed correctly for the matrix image
          const fullPath = progData.matrix_url.startsWith('http') 
            ? progData.matrix_url 
            : `https://hussain-2003-siem-backend-v2.hf.space${progData.matrix_url}`;
          
          setMatrixUrl(`${fullPath}?t=${Date.now()}`);

          // --- NEW LOGIC: AUTOMATICALLY UPDATE FEATURES ---
          // This ensures the bars update immediately without clicking recall
          setSelectedFeatures(progData.top_features || []); 

          setTraining(false);
          clearInterval(pollTimer);
          
          // Final Success Toast
          addAlert(`${selectedEngine.toUpperCase()} Model Optimized: ${formattedAcc} Accuracy`, "success");
          
          setTimeout(fetchHistory, 2000);
        } else if (progData.status === "failed") {
          setTraining(false);
          clearInterval(pollTimer);
          addAlert(`Training Engine Critical Failure: ${progData.error || 'Unknown Error'}`, "danger");
        }
      }, 1000);
    } else {
      setTraining(false);
      addAlert("Server rejected training request. Check backend logs.", "danger");
    }
  } catch (e) { 
    setTraining(false); 
    addAlert("Network Error: Failed to contact AI Orchestrator.", "danger");
  }
};

  const filteredAlerts = useMemo(() => {
    return [...recentAlerts].filter(a => {
      const ticketId = a.id || `${a.source_ip}-${a.timestamp}`;
      const currentStatus = ticketStatuses[ticketId] || "Open";
      const sourceIp = a.source_ip?.toString() || "";
      const alertType = a.alert_type?.toString().toLowerCase() || "";
      const severity = a.severity?.toString() || "Info";

      const matchesSearch = (sourceIp.includes(searchTerm) || alertType.includes(searchTerm.toLowerCase()));
      const matchesSeverity = (severityFilter === "All" || severity === severityFilter);
      const matchesStatus = (statusFilter === "All" || currentStatus === statusFilter);
      
      return matchesSearch && matchesSeverity && matchesStatus;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); 
  }, [recentAlerts, searchTerm, severityFilter, statusFilter, ticketStatuses]);

  const chronoSortedLogs = useMemo(() => {
    return [...recentAlerts].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [recentAlerts]);

  const handleScrollDetection = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const atBottom = scrollHeight - scrollTop <= clientHeight + 50; 
    setIsAutoScrollEnabled(atBottom);
  };

  useEffect(() => {
    if (isAutoScrollEnabled) {
      if (activeTab === 'terminal') {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else if (activeTab === 'stream') {
        streamEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else if (activeTab === 'dashboard') {
        // Scroll the main incident feed
        incidentEndRef.current?.scrollIntoView({ behavior: "smooth" });
        // ADD THIS: Also scroll the packet stream terminal on the dashboard
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else if (activeTab === 'ai') {
        trainingLogEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
    // Added chronoSortedLogs (or whatever variable powers your terminal) 
    // to ensure it triggers when packet data arrives
  }, [recentAlerts, logs, filteredAlerts, isAutoScrollEnabled, activeTab]);

  if (loading) return <div className="h-screen bg-[#020617] flex items-center justify-center text-cyan-500 font-mono tracking-widest animate-pulse">SIEM_BOOT_SEQUENCE...</div>;

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 font-mono">
      
      {/* Sidebar Navigation */}
      <div className="w-72 h-screen sticky top-0 border-r border-slate-800 bg-[#070b14] flex flex-col overflow-hidden">
        
        {/* Header Section (Static) */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-3 text-cyan-400">
              <ShieldAlert className="w-8 h-8" />
              <span className="font-black text-xl italic">SIEM.OS</span>
            </div>
            <User size={16} className="text-slate-600 hover:text-cyan-400 cursor-pointer" />
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-6 space-y-2 custom-scrollbar">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[11px] font-bold transition-all tracking-widest uppercase ${activeTab === 'dashboard' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}`}>
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('stream')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[11px] font-bold transition-all tracking-widest uppercase ${activeTab === 'stream' ? 'bg-cyan-500 text-white' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}`}>
            <ListFilter size={16} /> Incident Feed
          </button>
          <button onClick={() => setActiveTab('ai')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[11px] font-bold transition-all tracking-widest uppercase ${activeTab === 'ai' ? 'bg-cyan-500 text-white' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}`}>
            <Cpu size={16} /> AI Lab
          </button>
          <button onClick={() => setActiveTab('intel')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[11px] font-bold transition-all tracking-widest uppercase ${activeTab === 'intel' ? 'bg-cyan-500 text-white' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}`}>
            <Globe size={16} /> Threat Intel
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[11px] font-bold transition-all tracking-widest uppercase mt-4 ${activeTab === 'settings' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}`}>
            <SettingsIcon size={16} /> System Settings
          </button>
        </div>

        {/* Pinned Footer (Always Visible) */}
        <div className="p-6 mt-auto border-t border-slate-800/50 bg-[#070b14]">
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
            <p className="text-[9px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-2">
              <Activity size={10} className={snifferActive ? "text-emerald-500 animate-pulse" : "text-red-500"} /> 
              Sensor: {snifferActive ? "ONLINE" : "OFFLINE"}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-yellow-400">{stats.ai_accuracy}</span>
              <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-tighter">AI Accuracy</span>
            </div>
          </div>
        </div>
</div>

      <div className="flex-1 p-8 overflow-y-auto">
        {/* TAB: MAIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard icon={<Database className="text-blue-400" />} title="Ingested Logs" value={stats.total_logs} />
              <StatCard icon={<Activity className="text-red-400" />} title="Threats Found" value={stats.threats_today} highlight />
              <StatCard icon={<AlertTriangle className="text-orange-400" />} title="Attack Vectors" value={threatDistribution.length} />
              <div className="bg-[#0f172a] border-2 border-dashed border-slate-800 rounded-xl p-4 flex flex-col justify-center items-center group hover:border-cyan-500/50 transition-colors">
                <input id="dash-up" type="file" className="hidden" onChange={(e) => handleUpload(e, 'dash')} />
                <button onClick={() => document.getElementById('dash-up').click()} className="text-[9px] font-bold text-cyan-500 uppercase flex flex-col items-center">
                   {uploading ? <LoaderCircle className="animate-spin mb-1" /> : <Upload size={18} className="mb-1" />}
                   {dashFile || "Analysis Upload"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className={`${cardStyle} lg:col-span-2`}>
                 <div className={cardHeaderStyle}><h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Forensic IP Analysis</h3></div>
                 <div className="h-72 p-6 bg-[#0f172a]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={Object.entries(forensicData.dashboard_ips).map(([ip, count]) => ({ ip, count }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="ip" type="category" width={110} style={{fontSize: '10px', fill: '#94a3b8'}} stroke="#1e293b" />
                        <Tooltip {...tooltipStyle} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
               </div>

               <div className={cardStyle}>
                <div className={cardHeaderStyle}>
                  <h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Threat Vector Mix</h3>
                </div>
                <div className="h-72 p-4 bg-[#0f172a]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={threatDistribution} 
                        innerRadius={60} 
                        outerRadius={80} 
                        dataKey="value" 
                        nameKey="name" 
                        paddingAngle={5} 
                        // 1. DISABLE ANIMATION: This stops the "turning/spinning" on refresh
                        //isAnimationActive={false} 
                        label={({name}) => name.substring(0, 8)} 
                        labelLine={{stroke: '#334155'}}
                      >
                        {threatDistribution.map((e, i) => (
                          // 2. STABLE KEYS: Use a unique name rather than index if possible
                          <Cell key={`cell-${e.name}-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className={`${cardStyle} relative`}>
              <div className={cardHeaderStyle}>
              <h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="animate-pulse" /> Live Incident Feed
                <span className="ml-3 text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
                  ACTIVE: {selectedEngine.toUpperCase()}
                </span>
              </h3>
              {!isAutoScrollEnabled && (
                <button onClick={() => setIsAutoScrollEnabled(true)} className="flex items-center gap-1 text-[8px] bg-cyan-500 text-white px-2 py-1 rounded animate-bounce">
                  <ArrowDown size={10} /> RESUME LIVE
                </button>
              )}
            </div>

            <div 
  ref={incidentContainerRef} 
  onScroll={handleScrollDetection} 
  className="p-4 bg-[#020617]/30 h-[300px] overflow-y-auto scroll-smooth custom-scrollbar flex flex-col"
>
  {recentAlerts.length === 0 ? (
    <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
      System idling. No threats detected.
    </div>
  ) : (
    /* .slice().reverse() ensures the newest (at index 0) appears at the bottom of the list */
    recentAlerts.slice().reverse().map((a, i) => {
      // Lookup intelligence for this IP
      const alertData = a; // Assuming 'a' is the individual alert from your loop
      const storedIntel = intelDb[alertData.source_ip]; // From your hardcoded INTEL_DB
      const isLocal = alertData.source_ip === '127.0.0.1' || alertData.source_ip === '::1' || alertData.source_ip === 'localhost';

      const intel = {
        // 1. Check Hardcoded DB first (Ashburn/Mountain View)
        // 2. Check the location field directly on the alert (The backend fix we did)
        // 3. Fallback to Local Host or Unknown
        origin: storedIntel?.origin || alertData.location || (isLocal ? "Local Host" : "Unknown Location"),
        
        // Same logic for Status and Actor
        status: storedIntel?.status || alertData.status || "Active",
        actor: storedIntel?.actor || alertData.actor_info?.actor || (isLocal ? "System Core" : "Unknown Entity")
      };
      
      return (
        <div key={i} className="flex items-center justify-between bg-[#1e293b]/10 p-3 rounded mb-2 border border-slate-800/40 hover:border-slate-600 transition-colors shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-1.5 h-1.5 rounded-full ${a.severity === 'Critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-orange-500'}`} />
            
            <div>
              <div className="flex items-center gap-2">
                <p className={`text-[10px] font-bold uppercase ${a.ai_detected ? 'text-purple-400' : 'text-cyan-500'}`}>
                  {a.alert_type}
                </p>

                {a.ai_detected && (
                  <span className="flex items-center gap-1 bg-purple-500/10 text-purple-400 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-purple-500/30 animate-pulse">
                    <Cpu size={10} /> AI SUGGESTED
                  </span>
                )}

                {/* GEO-IP ORIGIN TAG */}
                
                  <span className="flex items-center gap-1 text-[8px] text-slate-500 bg-slate-800/40 px-1.5 py-0.5 rounded border border-slate-700">
                  <Globe size={8} /> 
                  {/* Use the 'intel' object we created earlier because it handles the logic for you */}
                  {intel.origin}
                </span>
              </div>
              
              {/* CLEANED DESCRIPTION: Splits at "Origin:" and takes only the first part */}
              <p className="text-xs text-slate-400">
                {a.description?.split(/origin:/i)[0].trim()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* INTEL STATUS BADGE */}
            {intel.status === 'Blocked' && (
              <span className="text-[8px] font-black bg-red-500/10 text-red-500 px-2 py-1 rounded border border-red-500/20 uppercase tracking-widest">
                Blocked
              </span>
            )}

            {/* BLOCK BUTTON */}
            <button 
              onClick={() => requestBlockConfirm(a.source_ip)}
              className={`p-2 rounded-lg transition-all group border ${
                intel.status === 'Blocked' 
                ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed' 
                : 'bg-red-500/5 hover:bg-red-500/20 text-red-500/40 hover:text-red-500 border-red-500/10 hover:border-red-500/50'
              }`}
              title={intel.status === 'Blocked' ? "IP Already Blocked" : "Block IP in Windows Firewall"}
              disabled={intel.status === 'Blocked'}
            >
              <ShieldAlert size={14} className={intel.status !== 'Blocked' ? "group-hover:scale-110 transition-transform" : ""} />
            </button>

            {/* CLICKABLE IP ADDRESS & TIMESTAMP */}
            <button 
              onClick={() => {
                addAlert(`INTEL_REPORT: ${a.source_ip} | Origin: ${intel.origin || 'Local Network'}  | Actor: ${intel.actor || 'Unknown'} | Status: ${intel.status}`, "info");
              }}
              className="text-right group"
              title="Click for Intelligence Report"
            >
              <p className={`text-xs font-mono mb-0.5 flex items-center justify-end gap-1 transition-colors underline-offset-4 decoration-dotted group-hover:underline ${intel.status === 'Blocked' ? 'text-red-400' : 'text-cyan-600 group-hover:text-cyan-400'}`}>
                {a.source_ip}
                <Info size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-[9px] text-slate-500">
                {new Date(a.timestamp).toLocaleTimeString()}
              </p>
            </button>
          </div>
        </div>
      );
    })
  )}

  {/* Auto-scroll anchor */}
  <div ref={incidentEndRef} className="pb-1" />
</div>
          </div>

            <div className="bg-black border border-slate-800 rounded-lg overflow-hidden shadow-2xl relative">
              <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold tracking-widest uppercase">
                  <Terminal size={10} /> Raw_Packet_Stream // TTY1
                  <div className="flex items-center gap-1.5 ml-4 bg-black/40 px-2 py-0.5 rounded-full border border-slate-800">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-emerald-500/80 text-[8px]">LIVE_INGRESS</span>
                  </div>
                </div>
              </div>
              <div id="terminal" onScroll={handleScrollDetection} className="p-4 h-48 overflow-y-auto font-mono text-[10px] space-y-1 bg-[#020617] scroll-smooth custom-scrollbar">
                {recentAlerts.length === 0 ? (
                  <p className="text-slate-700 animate-pulse">_WAITING_FOR_INGRESS...</p>
                ) : (
                  chronoSortedLogs.map((log, i) => (
                    <div key={i} className="flex gap-4 border-b border-slate-900/50 pb-1 hover:bg-slate-900/30">
                      <span className="text-emerald-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className="text-slate-400 truncate">{JSON.stringify(log)}</span>
                    </div>
                  ))
                )}
                <div ref={terminalEndRef} />
              </div>
            </div>
          </div>
        )}

        {/* TAB: INCIDENT FEED */}
{/* TAB: INCIDENT FEED */}
{activeTab === 'stream' && (
  <div className="space-y-6 animate-in fade-in">
    {/* SEARCH & FILTERS HEADER */}
    <div className="flex flex-wrap justify-between items-center bg-[#0f172a] p-4 rounded-xl border border-slate-800 gap-4">
      <div className="flex items-center gap-4">
        <div className="flex bg-[#020617] items-center px-3 py-2 rounded-md border border-slate-700 w-64 focus-within:border-cyan-500 transition-colors">
          <Search className="w-4 h-4 text-slate-500 mr-2" />
          <input type="text" placeholder="Search by IP or Attack Type..." className="bg-transparent text-xs outline-none w-full text-slate-200" onChange={e => setSearchTerm(e.target.value)} />
        </div>
        
        <div className="flex items-center gap-2">
          <select className="bg-[#020617] text-[10px] font-bold text-slate-400 border border-slate-700 rounded px-2 py-2 uppercase outline-none focus:border-cyan-500" onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="All">All Severities</option>
            <option value="High">High Severity</option>
            <option value="Critical">Critical Only</option>
          </select>

          <select className="bg-[#020617] text-[10px] font-bold text-slate-400 border border-slate-700 rounded px-2 py-2 uppercase outline-none focus:border-cyan-500" onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">Investigating</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div className="h-8 w-px bg-slate-800 mx-2" />
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">Live Database Index</span>
          <span className="text-xs font-bold text-cyan-500">{filteredAlerts.length} of {stats.total_logs} Logs</span>
        </div>
      </div>

      <div className="flex gap-2">
        {syncing && <div className="flex items-center gap-2 px-3 text-cyan-500 animate-pulse border border-cyan-500/20 rounded-lg bg-cyan-500/5"><CloudUpload size={12} /><span className="text-[8px] font-bold uppercase tracking-widest">Saving</span></div>}
        <button onClick={() => window.open("https://hussain-2003-siem-backend-v2.hf.space/generate-report", "_blank")} className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-[10px] font-bold rounded uppercase flex items-center gap-2 border border-indigo-500/30 transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)]"><FileText size={14} /> Report</button>
        <button onClick={async () => { const res = await fetch("https://hussain-2003-siem-backend-v2.hf.space/export-logs"); const data = await res.json(); window.open(`https://hussain-2003-siem-backend-v2.hf.space${data.download_url}`); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold rounded uppercase flex items-center gap-2 border border-slate-700 transition-colors"><Database size={14} /> Export</button>
      </div>
    </div>
      
    <div className={`${cardStyle} h-[calc(100vh-280px)] flex flex-col overflow-hidden`}>
      {/* HEADER: Balanced 12-col grid (2-4-2-2-2) */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#1e293b]/50 border-b border-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest">
        <div className="col-span-2">Severity</div>
        <div className="col-span-4">Threat Details</div>
        <div className="col-span-2">Status Manager</div>
        <div className="col-span-2">Security Action</div>
        <div className="col-span-2 text-right">Origin/Time</div>
      </div>

      <div onScroll={handleScrollDetection} className="overflow-y-auto flex-1 p-4 space-y-1 custom-scrollbar bg-[#020617]/20">
        {filteredAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 italic"><ShieldAlert size={48} className="mb-4 opacity-10" /><p>No matches found.</p></div>
        ) : (
          [...filteredAlerts].reverse().map((a) => {
            const ticketId = a.id || `${a.source_ip}-${a.timestamp}`;
            const currentStatus = ticketStatuses[ticketId] || "Open";
            const isBlocked = intelDb[a.source_ip]?.status === "Blocked";

            return (
              <div key={ticketId} className={`grid grid-cols-12 gap-4 items-center p-3 rounded-lg border border-transparent hover:border-slate-700 hover:bg-[#1e293b]/30 transition-all group ${a.severity === 'Critical' ? 'bg-red-500/5' : ''}`}>
                
                {/* Full Severity Column */}
                <div className="col-span-2">
                   <div className={`w-full text-center py-1 rounded text-[9px] font-black uppercase border ${a.severity === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                    {a.severity}
                  </div>
                </div>

                {/* Threat Details */}
                <div className="col-span-4 overflow-hidden">
                  <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">{a.alert_type}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{a.description}</p>
                </div>

                {/* Status Dropdown */}
                <div className="col-span-2">
                  <select 
                    value={currentStatus} 
                    onChange={(e) => updateTicketStatus(ticketId, e.target.value)} 
                    className={`bg-[#020617] text-[9px] font-bold border rounded px-2 py-1.5 outline-none cursor-pointer w-full ${currentStatus === 'Resolved' ? 'border-emerald-500/30 text-emerald-500' : currentStatus === 'In Progress' ? 'border-blue-500/30 text-blue-400' : 'border-slate-800 text-slate-400'}`}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">Investigating</option>
                    <option value="Resolved">Resolve</option>
                  </select>
                </div>

                {/* Block IP Action */}
                <div className="col-span-2">
                  <button 
                    disabled={isBlocked}
                    onClick={() => requestBlockConfirm(a.source_ip)}
                    className={`w-full py-1.5 rounded text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1 border
                      ${isBlocked 
                        ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'
                      }`}
                  >
                    {isBlocked ? <PowerOff size={10} /> : <ShieldAlert size={10} />}
                    {isBlocked ? 'Blocked' : 'Block IP'}
                  </button>
                </div>

                {/* IP and Timestamp */}
                <div className="col-span-2 text-right">
                  {(() => {
                    // 1. Resolve Intelligence Data from the local state
                    const storedIntel = intelDb[a.source_ip];
                    const isLocal = a.source_ip === '127.0.0.1' || a.source_ip === '::1' || a.source_ip === 'localhost';
                    
                    // Fallback chain: Check intelDb, then log properties, then system defaults
                    const intel = {
                      origin: storedIntel?.origin || a.location || (isLocal ? "Local Host" : "Unknown Location"),
                      status: storedIntel?.status || a.status || "Active",
                      actor: storedIntel?.actor || a.actor_info?.actor || (isLocal ? "System Core" : "Unknown Entity")
                    };

                    return (
                      <button 
                        onClick={() => { 
                          // Triggers the toast/notification report found in your Dashboard.jsx
                          addAlert(`INTEL_REPORT: ${a.source_ip} | Origin: ${intel.origin} | Actor: ${intel.actor} | Status: ${intel.status}`, "info"); 
                        }}
                        className="text-right group w-full outline-none"
                        title="View Intelligence Details"
                      >
                        <p className={`text-xs font-mono font-bold leading-none mb-1 transition-all flex items-center justify-end gap-1 group-hover:underline underline-offset-4 decoration-dotted ${isBlocked ? 'text-red-400' : 'text-cyan-400 group-hover:text-cyan-300'}`}>
                          {a.source_ip}
                          <Info size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                        <p className="text-[8px] text-slate-500 leading-none">
                          {new Date(a.timestamp).toLocaleTimeString()}
                        </p>
                      </button>
                    );
                  })()}
                </div>
              </div>
            );
          })
        )}
        <div ref={streamEndRef} />
      </div>
    </div>
  </div>
)}

        {/* TAB: AI LAB */}
          {activeTab === 'ai' && (
            <div className="space-y-8 animate-in fade-in">
              {/* TOP ROW: TRAINING CONTROLS & TELEMETRY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className={cardStyle}>
                    <div className={cardHeaderStyle}>
                      <h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">ML Training Lab</h3>
                    </div>
                    <div className="p-8 space-y-6 text-center">
                      {/* 1. UPLOAD AREA */}
                      <div className="p-10 border-2 border-dashed border-slate-800 rounded-2xl cursor-pointer bg-[#020617]/50 hover:border-indigo-500/50 transition-colors">
                        <input id="ai-up" type="file" className="hidden" onChange={(e) => {
                          handleUpload(e, 'train');
                          if(e.target.files[0]) addAlert(`Source Loaded: ${e.target.files[0].name}`, "info");
                        }} />
                        <div onClick={() => document.getElementById('ai-up').click()}>
                          {uploading ? <LoaderCircle className="animate-spin mx-auto text-cyan-400 mb-4" size={40} /> : <Upload className="mx-auto text-slate-600 mb-4" size={40} />}
                          <p className="text-xs font-bold text-slate-400">{trainFile || "Drop Training CSV here"}</p>
                        </div>
                      </div>

                      {/* 2. MODEL ENGINE SELECTOR (NEW) */}
                      <div className="space-y-3">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter text-left ml-1">Select Logic Engine</p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'xgboost', label: 'XGBoost', sub: 'Precision' },
                            { id: 'rf', label: 'R-Forest', sub: 'Stability' },
                            { id: 'isolation_forest', label: 'Iso-Forest', sub: 'Anomaly' }
                          ].map((engine) => (
                            <button
                                key={engine.id}
                                onClick={() => handleActivateModel(engine.id)} // Calls the new combined logic
                                className={`p-2 rounded-lg border flex flex-col items-center transition-all ${
                                    selectedEngine === engine.id 
                                    ? 'border-cyan-500 bg-cyan-500/10' 
                                    : 'border-slate-800 bg-black/20 hover:border-slate-700'
                                }`}
                            >
                              <span className={`text-[10px] font-bold ${selectedEngine === engine.id ? 'text-cyan-400' : 'text-slate-400'}`}>
                                {engine.label}
                              </span>
                              <span className="text-[8px] text-slate-600 uppercase font-black">{engine.sub}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. RUN BUTTON */}
                      <button onClick={trainModel} disabled={training || !trainFile} className={`w-full py-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${training ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}>
                        {training ? <><LoaderCircle className="animate-spin" size={16} /> PROCESSING...</> : <><Play size={16}/> RUN {selectedEngine.toUpperCase()} ENGINE</>}
                      </button>
                    </div>
                  </div>

                  {/* TELEMETRY CARD (REMAINS UNCHANGED) */}
                  <div className={`${cardStyle} flex flex-col`}>
                    <div className={cardHeaderStyle}><h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Training Telemetry</h3></div>
                    <div onScroll={handleScrollDetection} className="flex-1 bg-black/50 p-4 font-mono text-[11px] h-72 overflow-y-auto custom-scrollbar">
                        {logs.map((log, i) => (
                          <div key={i} className="mb-1"><span className="text-slate-500 mr-2">[{i}]</span><span className={log.includes('ERROR') ? 'text-red-400' : 'text-emerald-400'}>{log}</span></div>
                        ))}
                        <div ref={trainingLogEndRef} />
                    </div>
                  </div>
                </div>

              {/* MIDDLE ROW: PERFORMANCE MATRIX & FEATURE IMPORTANCE */}
              {(matrixUrl || trainingHistory.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-top-4">
                  {/* Confusion Matrix */}
                  <div className={`${cardStyle} lg:col-span-2`}>
                    <div className={cardHeaderStyle}>
                      <h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">
                        Performance Metrics (Confusion Matrix)
                      </h3>
                    </div>
                    <div className="flex justify-center p-8 bg-[#020617]">
                      {matrixUrl ? (
                        <img 
                          src={
                            matrixUrl.startsWith('data:') || matrixUrl.startsWith('http') 
                              ? matrixUrl 
                              : `https://hussain-2003-siem-backend-v2.hf.space${matrixUrl}`
                          } 
                          alt="Performance Matrix" 
                          className="max-h-80 rounded border border-slate-800 shadow-2xl" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <p className="text-slate-600 text-xs italic">Select a history entry to view matrix</p>
                      )}
                    </div>
                  </div>

                  {/* Feature Importance (The "Why") */}
                  <div className={cardStyle}>
                    <div className={cardHeaderStyle}>
                      <h3 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Top Decision Factors</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {/* 1. CHECK FOR NEW ARRAY-BASED FEATURES (RF / ISO / RECALL) */}
                      {selectedFeatures && selectedFeatures.length > 0 ? (
                        selectedFeatures.map((f, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-400 truncate w-32 uppercase">{f.feature}</span>
                              <span className="text-indigo-400">{(f.importance * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-800/50 h-1 rounded-full overflow-hidden">
                              <div 
                                className="bg-indigo-500 h-full transition-all duration-1000" 
                                style={{ width: `${f.importance * 100}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : /* 2. FALLBACK TO EXISTING XGBOOST LOGIC (LATEST RUN) */
                      trainingHistory[0]?.feature_importance ? (
                        Object.entries(trainingHistory[0].feature_importance)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 6)
                          .map(([feature, weight], idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-400 truncate w-32 uppercase">{feature}</span>
                                <span className="text-indigo-400">{weight}</span>
                              </div>
                              <div className="w-full bg-slate-800/50 h-1 rounded-full overflow-hidden">
                                <div 
                                  className="bg-indigo-500 h-full transition-all duration-1000" 
                                  style={{ width: `${(weight / Math.max(...Object.values(trainingHistory[0].feature_importance))) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))
                      ) : (
                        /* 3. NO DATA STATE */
                        <p className="text-slate-600 text-xs italic text-center py-10">No feature data available</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* BOTTOM ROW: PERMANENT TRAINING ARCHIVE */}
              <div className={cardStyle}>
                <div className={cardHeaderStyle}>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Training History Archive</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#020617] text-[10px] text-slate-500 uppercase border-b border-slate-800">
                        <th className="p-4 font-black">Timestamp</th>
                        <th className="p-4 font-black">Engine</th> {/* New Column */}
                        <th className="p-4 font-black">Dataset Source</th>
                        <th className="p-4 font-black">Accuracy</th>
                        <th className="p-4 font-black text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainingHistory.map((log, i) => (
                        <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                          <td className="p-4 text-[11px] font-mono text-slate-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          
                          {/* New Model Type Badge */}
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                              log.model_type === 'ISOLATION_FOREST' 
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            }`}>
                              {log.model_type || "XGBOOST"}
                            </span>
                          </td>

                          <td className="p-4 text-xs font-bold text-slate-300">{log.csv_trained_on}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              {(log.accuracy * 100).toFixed(2)}%
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => {
                                setIsManualView(true);
                                setMatrixUrl(log.confusion_matrix);
                                setSelectedFeatures(log.top_features || []); // Set the features for the selected model
                              }}
                              className="text-[10px] font-black text-cyan-500 hover:text-white transition-colors">
                              RECALL_MATRIX
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        {/* TAB: THREAT INTEL */}
{activeTab === 'intel' && (
  <div className="space-y-6 animate-in fade-in">
    {/* ADD NEW INTEL FORM */}
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
      <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">Register New Threat Actor</h3>
      <div className="flex flex-col md:flex-row gap-4">
        <input 
          placeholder="Source IP (e.g. 192.168.1.50)" 
          className="flex-1 bg-[#020617] border border-slate-800 rounded-xl p-3 text-white text-xs outline-none focus:border-cyan-500"
          value={newIntelIp}
          onChange={(e) => setNewIntelIp(e.target.value)}
        />
        <input 
          placeholder="Actor Name (e.g. Lazarus Group)" 
          className="flex-1 bg-[#020617] border border-slate-800 rounded-xl p-3 text-white text-xs outline-none focus:border-cyan-500"
          value={newIntelActor}
          onChange={(e) => setNewIntelActor(e.target.value)}
        />
        <button 
          onClick={async () => {
            if(!newIntelIp || !newIntelActor) return;
            await fetch("https://hussain-2003-siem-backend-v2.hf.space/intel", {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ ip: newIntelIp, actor: newIntelActor })
            });
            setNewIntelIp(""); setNewIntelActor("");
            fetchData(); // Refresh list
          }}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
        >
          Add to Watchlist
        </button>
      </div>
    </div>

    {/* INTEL TABLE */}
    <div className={cardStyle}>
      <div className={cardHeaderStyle}>
        <h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Known Actor Watchlist</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#020617] text-[10px] text-slate-500 uppercase border-b border-slate-800">
              <th className="p-4 font-black">Threat Actor</th>
              <th className="p-4 font-black">Source IP</th>
              <th className="p-4 font-black">Status</th>
              <th className="p-4 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(intelDb)
              .filter(([ip, data]) => data.status !== "Blocked") // Keep watchlist clean of blocked entries
              .map(([ip, data], i) => (
              <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                <td className="p-4 text-xs font-bold text-slate-300">{data.actor}</td>
                <td className="p-4 text-xs font-mono text-cyan-500">{ip}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-500/10 text-red-500 border border-red-500/20">MALICIOUS</span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={async () => {
                      await fetch(`https://hussain-2003-siem-backend-v2.hf.space/intel/${ip}`, { method: 'DELETE' });
                      fetchData();
                    }}
                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {Object.entries(intelDb).filter(([ip, data]) => data.status !== "Blocked").length === 0 && (
              <tr>
                <td colSpan="4" className="p-10 text-center text-slate-600 text-xs italic">No active threats registered in database.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* NEW: ACTIVE FIREWALL BANS SECTION */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-red-500/10 mt-6">
        <div className="p-4 bg-red-500/5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
            <PowerOff size={14} /> Active System Bans (Windows Firewall)
          </h3>
          <span className="text-[9px] font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            KERNEL_LEVEL_PROTECTION
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#020617] text-slate-500 uppercase">
              <tr>
                <th className="p-4 border-b border-slate-800 font-black">Target IP</th>
                <th className="p-4 border-b border-slate-800 font-black">Block Details</th>
                <th className="p-4 border-b border-slate-800 text-right font-black">Action</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Normalize intelDb to an array regardless of if backend sends {} or []
                const intelArray = Array.isArray(intelDb) 
                  ? intelDb 
                  : Object.entries(intelDb).map(([ip, data]) => ({ ip, ...data }));

                const blockedItems = intelArray.filter(item => item.status === "Blocked");

                if (blockedItems.length === 0) {
                  return (
                    <tr>
                      <td colSpan="3" className="p-10 text-center text-slate-600 text-xs italic bg-slate-900/10">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <ShieldAlert size={24} className="mb-2" />
                          No active IP bans currently enforced on this system.
                        </div>
                      </td>
                    </tr>
                  );
                }

                return blockedItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-red-500/[0.03] border-b border-slate-800/50 group transition-all">
                    <td className="p-4 font-mono font-bold text-white flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse" />
                      {item.ip}
                    </td>
                    <td className="p-4 text-slate-400">
                      <div className="flex flex-col">
                        <span className="text-red-500 font-black text-[9px] uppercase mb-0.5 tracking-tighter">
                          FIREWALL_DROP_ACTIVE
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {item.reason || "Manual blacklist applied via SIEM engine"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => requestUnblockConfirm(item.ip)}
                        className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 hover:bg-emerald-500 hover:text-white font-black text-[9px] uppercase tracking-tighter transition-all"
                      >
                        REVOKE_BLOCK
                      </button>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
  </div>
)}

        {/* TAB: SETTINGS */}
{activeTab === 'settings' && (
  <div className="max-w-4xl space-y-8 animate-in slide-in-from-bottom-4">
    <header>
      <h2 className="text-2xl font-black italic text-white flex items-center gap-3">
        <SettingsIcon className="text-cyan-500" /> SYSTEM_PREFERENCES
      </h2>
      <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">
        Configure sensors and account security parameters
      </p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* SENSOR CONTROL CARD */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-bold text-white">Sensor Main Switch</h3>
            <p className="text-[10px] text-slate-500 mt-1">Stops engine (Logs are preserved)</p>
          </div>
          <div className={`p-2 rounded-lg ${snifferActive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            {snifferActive ? <Power className="text-emerald-500" size={20} /> : <PowerOff className="text-red-500" size={20} />}
          </div>
        </div>
        <button 
          onClick={handleSystemToggle} 
          className={`w-full py-4 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all border ${snifferActive ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'}`}
        >
          {snifferActive ? "Shutdown Sensor (Keep Logs)" : "Initialize Sensor Capture"}
        </button>
      </div>

      {/* NEW ACCOUNT MANAGEMENT CARD (Replaces Global Notification) */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-bold text-white">Account Security</h3>
            <p className="text-[10px] text-slate-500 mt-1">Manage admin credentials</p>
          </div>
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <User className="text-cyan-500" size={20} />
          </div>
        </div>
        
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="New Username" 
            className="w-full bg-[#020617] border border-slate-800 rounded-xl p-3 text-white text-[10px] focus:border-cyan-500 outline-none transition-all"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="New Password" 
            className="w-full bg-[#020617] border border-slate-800 rounded-xl p-3 text-white text-[10px] focus:border-cyan-500 outline-none transition-all"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button 
            onClick={async () => {
              if (!newUsername && !newPassword) {
                alert("Please enter a new username or password.");
                return;
              }

              try {
                const response = await fetch("https://hussain-2003-siem-backend-v2.hf.space/update-profile", {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    new_username: newUsername || null,
                    new_password: newPassword || null
                  })
                });

                if (response.ok) {
                  alert("Credentials updated successfully. Please log in again.");
                  onLogout(); // This clears the local session and kicks them to login
                } else {
                  const error = await response.json();
                  alert(`Update Failed: ${error.detail}`);
                }
              } catch (err) {
                alert("Network error. Is the backend running?");
              }
            }}
            className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            Update
          </button>
          <button 
            onClick={onLogout}
            className="px-4 py-3 bg-red-900/20 border border-red-500/30 text-red-500 hover:bg-red-900/40 rounded-xl font-black text-[10px] uppercase transition-all"
          >
            <PowerOff size={14} />
          </button>
        </div>
      </div>
    </div>

    {/* DATABASE CONTROL CARD */}
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Database size={14} /> Intelligence Database
      </h3>
      <div className="flex items-center justify-between p-4 bg-[#020617] rounded-xl border border-slate-800">
        <div>
          <p className="text-xs font-bold text-white">Manual Buffer Clear</p>
          <p className="text-[9px] text-slate-500 uppercase">Only click this if you want to empty the dashboard</p>
        </div>
        <button 
            onClick={requestClearDashboardConfirm} 
            className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-500/30 text-[9px] font-bold rounded-lg uppercase transition-all"
          >
            <Trash2 size={14} className="inline mr-2" /> CLEAR_DASHBOARD
          </button>
      </div>
    </div>

            
       <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 mt-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Cpu size={14} /> AI Model History
        </h3>
        <div className="flex items-center justify-between p-4 bg-[#020617] rounded-xl border border-slate-800">
          <div>
            <p className="text-xs font-bold text-white">Purge Training Archive</p>
            <p className="text-[9px] text-slate-500 uppercase">Resets the AI Lab history list</p>
          </div>
          <button 
              onClick={requestPurgeHistoryConfirm} 
              className="px-4 py-2 bg-orange-900/20 hover:bg-orange-900/40 text-orange-500 border border-orange-500/30 text-[9px] font-bold rounded-lg uppercase transition-all"
            >
              <Trash2 size={14} className="inline mr-2" /> PURGE_HISTORY
            </button>
        </div>
      </div>
  </div>
    )}
      </div>
        {/* FLOATING SYSTEM ALERTS (Bottom-Right) */}
        <div className="fixed bottom-6 right-6 z-[100] space-y-3 w-80 pointer-events-none">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`pointer-events-auto animate-in slide-in-from-right-10 border p-4 rounded-xl shadow-2xl flex items-start gap-4 transition-all
                ${alert.type === 'danger' && alert.msg.includes('CRITICAL') 
                  ? 'bg-red-950/60 border-red-500 animate-pulse ring-1 ring-red-500/50' 
                  : 'bg-[#070b14]/90 border-slate-800'
                } backdrop-blur-xl`}
            >
              <div className={`p-2 rounded-lg ${
                alert.type === 'danger' ? 'bg-red-500/20 text-red-500' : 
                alert.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 
                'bg-cyan-500/20 text-cyan-400'
              }`}>
                {alert.type === 'danger' ? <ShieldAlert size={18} /> : <Info size={18} />}
              </div>
              
              <div className="flex-1">
                
                <p className="text-xs font-bold text-slate-200 leading-tight">{alert.msg}</p>

                {/* --- CONFIRMATION BUTTON --- */}
                {alert.isConfirm && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      alert.onConfirm();
                    }}
                    className={`mt-3 w-full py-2 text-white text-[10px] font-black uppercase rounded border transition-all flex items-center justify-center gap-2 shadow-lg
                      ${alert.type === 'danger' 
                        ? 'bg-red-600 hover:bg-red-700 border-red-400/20 shadow-red-900/20' 
                        : 'bg-cyan-600 hover:bg-cyan-700 border-cyan-400/20 shadow-cyan-900/20'}`}
                  >
                    <ShieldAlert size={12} /> 
                    {alert.confirmText || "Confirm Action"}
                  </button>
                )}
              </div>

              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // Prevents the click from bubbling up
                  setAlerts(prev => prev.filter(a => a.id !== alert.id));
                }} 
                className="text-slate-600 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
    </div>
  );
};

// --- AUTHENTICATION WRAPPER ---
const App = () => {
  // Check if a token already exists in storage
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('siem_token'));

  const handleLogout = () => {
    localStorage.removeItem('siem_token');
    setIsAuthenticated(false);
  };

  // If not authenticated, show the Login component
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // If authenticated, show the Dashboard and pass the logout function
  return <Dashboard onLogout={handleLogout} />;
};

export default App; // This is now the main export
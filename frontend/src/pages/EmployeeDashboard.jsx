import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import LeaveListTable from '../components/LeaveListTable';
import ApplyLeaveModal from '../components/ApplyLeaveModal';
import { Plus, Calendar, Clock, CheckCircle2, XCircle, Sparkles, AlertCircle } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const res = await API.get('/leaves/my');
      setLeaves(res.data.leaves || []);
    } catch (err) {
      console.error("Fetch my leaves error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Filter leaves
  const filteredLeaves = leaves.filter(l => {
    if (statusFilter === 'All') return true;
    return l.status === statusFilter;
  });

  // Calculate metrics
  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;

  const casualLeft = user?.leaveBalance?.casual ?? 0;
  const sickLeft = user?.leaveBalance?.sick ?? 0;

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="toast-container">
            <div className="toast success">
              <CheckCircle2 size={18} color="#10b981" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Welcome & Action Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome back, {user?.name}!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Manage your leave requests and view remaining balance.
            </p>
          </div>

          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.35rem', fontSize: '0.95rem' }}
          >
            <Plus size={18} />
            Apply for Leave
          </button>
        </div>

        {/* Leave Balance Stats Cards */}
        <div className="grid-stats">
          <StatCard
            title="Casual Leave Balance"
            value={`${casualLeft} Days`}
            subtitle="Initial total: 10 days"
            icon={Sparkles}
            iconBg="rgba(59, 130, 246, 0.15)"
            iconColor="#60a5fa"
          />

          <StatCard
            title="Sick Leave Balance"
            value={`${sickLeft} Days`}
            subtitle="Initial total: 10 days"
            icon={Sparkles}
            iconBg="rgba(236, 72, 153, 0.15)"
            iconColor="#f472b6"
          />

          <StatCard
            title="Pending Requests"
            value={pendingCount}
            subtitle="Awaiting manager review"
            icon={Clock}
            iconBg="rgba(245, 158, 11, 0.15)"
            iconColor="#fbbf24"
          />

          <StatCard
            title="Approved Leaves"
            value={approvedCount}
            subtitle={`${rejectedCount} rejected requests`}
            icon={CheckCircle2}
            iconBg="rgba(16, 185, 129, 0.15)"
            iconColor="#34d399"
          />
        </div>

        {/* Leave Requests Table Header & Tabs */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Leave Requests</h3>
            
            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-input)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: statusFilter === status ? 'var(--bg-card)' : 'transparent',
                    color: statusFilter === status ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: statusFilter === status ? '0 2px 6px rgba(0,0,0,0.15)' : 'none'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading your leaves...</div>
          ) : (
            <LeaveListTable leaves={filteredLeaves} isManager={false} />
          )}
        </div>
      </main>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={(msg) => {
          showToast(msg);
          fetchMyLeaves();
        }}
      />
    </div>
  );
};

export default EmployeeDashboard;

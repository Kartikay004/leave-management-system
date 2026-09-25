import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import LeaveListTable from '../components/LeaveListTable';
import ManagerApprovalModal from '../components/ManagerApprovalModal';
import EmployeeDirectory from '../components/EmployeeDirectory';
import { Shield, Clock, CheckCircle2, XCircle, Users, FileText, Check } from 'lucide-react';

const ManagerDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'all', 'employees'
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [pendingRes, allRes] = await Promise.all([
        API.get('/leaves/pending'),
        API.get('/leaves/all')
      ]);

      setPendingLeaves(pendingRes.data.leaves || []);
      setAllLeaves(allRes.data.leaves || []);
    } catch (err) {
      console.error("Fetch manager dashboard data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleReviewLeave = (leave) => {
    setSelectedLeave(leave);
    setIsApprovalModalOpen(true);
  };

  // Metrics
  const pendingCount = pendingLeaves.length;
  const approvedCount = allLeaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = allLeaves.filter(l => l.status === 'Rejected').length;

  const filteredAllLeaves = allLeaves.filter(l => {
    if (statusFilter === 'All') return true;
    return l.status === statusFilter;
  });

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

        {/* Dashboard Title Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Shield size={24} color="#a78bfa" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manager Portal</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Review pending leave applications, approve/reject requests, and monitor employee balances.
          </p>
        </div>

        {/* Summary Metric Stats Cards */}
        <div className="grid-stats">
          <StatCard
            title="Pending Queue"
            value={pendingCount}
            subtitle="Requires manager decision"
            icon={Clock}
            iconBg="rgba(245, 158, 11, 0.2)"
            iconColor="#fbbf24"
            onClick={() => setActiveTab('pending')}
          />

          <StatCard
            title="Approved Leaves"
            value={approvedCount}
            subtitle="Successfully processed"
            icon={CheckCircle2}
            iconBg="rgba(16, 185, 129, 0.15)"
            iconColor="#34d399"
            onClick={() => { setActiveTab('all'); setStatusFilter('Approved'); }}
          />

          <StatCard
            title="Rejected Requests"
            value={rejectedCount}
            subtitle="Declined applications"
            icon={XCircle}
            iconBg="rgba(239, 68, 68, 0.15)"
            iconColor="#f87171"
            onClick={() => { setActiveTab('all'); setStatusFilter('Rejected'); }}
          />

          <StatCard
            title="Employee Directory"
            value="View All"
            subtitle="Check leave balances"
            icon={Users}
            iconBg="rgba(139, 92, 246, 0.15)"
            iconColor="#a78bfa"
            onClick={() => setActiveTab('employees')}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approvals ({pendingCount})
          </button>

          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Requests History ({allLeaves.length})
          </button>

          <button
            className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            Employee Directory & Balances
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'pending' && (
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Pending Leave Approvals Queue
            </h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading pending leaves...</div>
            ) : (
              <LeaveListTable
                leaves={pendingLeaves}
                isManager={true}
                onReview={handleReviewLeave}
              />
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>All Employee Leave Records</h3>

              {/* Status Filter Pills */}
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
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading all leave records...</div>
            ) : (
              <LeaveListTable
                leaves={filteredAllLeaves}
                isManager={true}
                onReview={handleReviewLeave}
              />
            )}
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="card">
            <EmployeeDirectory />
          </div>
        )}
      </main>

      {/* Approval / Rejection Modal */}
      <ManagerApprovalModal
        leave={selectedLeave}
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setSelectedLeave(null);
        }}
        onSuccess={(msg) => {
          showToast(msg);
          fetchDashboardData();
        }}
      />
    </div>
  );
};

export default ManagerDashboard;

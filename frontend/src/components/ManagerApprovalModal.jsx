import React, { useState } from 'react';
import API from '../services/api';
import { formatDate } from '../utils/dateUtils';
import { X, CheckCircle2, XCircle, AlertCircle, Calendar, User, MessageSquare } from 'lucide-react';

const ManagerApprovalModal = ({ leave, isOpen, onClose, onSuccess }) => {
  const [managerComment, setManagerComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !leave) return null;

  const employee = leave.employee || {};
  const typeKey = leave.leaveType ? leave.leaveType.toLowerCase() : 'casual';
  const currentBalance = employee.leaveBalance ? employee.leaveBalance[typeKey] ?? 0 : 0;
  const isBalanceSufficient = currentBalance >= leave.totalDays;

  const handleAction = async (newStatus) => {
    setErrorMessage('');
    try {
      setLoading(true);
      const res = await API.put(`/leaves/${leave._id}/status`, {
        status: newStatus,
        managerComment: managerComment.trim()
      });

      onSuccess(res.data.message || `Leave request ${newStatus.toLowerCase()} successfully.`);
      onClose();
    } catch (err) {
      console.error("Manager approval error:", err);
      const msg = err.response?.data?.message || `Failed to update leave status.`;
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Review Leave Request</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {employee.name} ({employee.email})
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon-only" style={{ borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="alert-banner danger">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Request Overview Card */}
        <div style={{ background: 'var(--bg-input)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>LEAVE TYPE</span>
              <span style={{ fontWeight: 700, color: leave.leaveType === 'Casual' ? '#60a5fa' : '#f472b6' }}>
                {leave.leaveType} Leave
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>DURATION</span>
              <span style={{ fontWeight: 700 }}>
                {leave.totalDays} Working Day(s)
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>DATE RANGE</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>EMPLOYEE BALANCE</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isBalanceSufficient ? '#34d399' : '#f87171' }}>
                {currentBalance} day(s) left
              </span>
            </div>
          </div>

          {!isBalanceSufficient && (
            <div className="alert-banner warning" style={{ margin: 0, padding: '0.65rem' }}>
              <AlertCircle size={16} />
              <span>Insufficient balance: Request requires {leave.totalDays} days, employee has only {currentBalance} days.</span>
            </div>
          )}

          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
              EMPLOYEE REASON
            </span>
            <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-primary)' }}>
              "{leave.reason}"
            </p>
          </div>
        </div>

        {/* Manager Comment */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MessageSquare size={15} /> Manager Comment (Optional)
          </label>
          <textarea
            className="form-textarea"
            placeholder="Add note for approval/rejection (e.g. Approved. Please hand over pending tasks)."
            value={managerComment}
            onChange={e => setManagerComment(e.target.value)}
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => handleAction('Rejected')}
            disabled={loading}
          >
            <XCircle size={16} />
            Reject Request
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={() => handleAction('Approved')}
            disabled={loading || !isBalanceSufficient}
            title={!isBalanceSufficient ? 'Cannot approve: Insufficient employee balance' : ''}
          >
            <CheckCircle2 size={16} />
            Approve Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerApprovalModal;

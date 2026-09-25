import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { calculateWorkingDaysFrontend } from '../utils/dateUtils';
import { X, Calendar, AlertCircle, CheckCircle2, Clock, Info } from 'lucide-react';

const ApplyLeaveModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, refreshUser } = useAuth();

  const [leaveType, setLeaveType] = useState('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dateCalculation, setDateCalculation] = useState({ workingDays: 0, weekendDays: 0, calendarDays: 0, isValid: false });

  // Recalculate working days whenever dates change
  useEffect(() => {
    if (startDate && endDate) {
      const calc = calculateWorkingDaysFrontend(startDate, endDate);
      setDateCalculation(calc);
    } else {
      setDateCalculation({ workingDays: 0, weekendDays: 0, calendarDays: 0, isValid: false });
    }
  }, [startDate, endDate]);

  if (!isOpen) return null;

  const typeKey = leaveType.toLowerCase();
  const availableBalance = user?.leaveBalance ? user.leaveBalance[typeKey] ?? 0 : 0;
  const isBalanceInsufficient = dateCalculation.isValid && dateCalculation.workingDays > availableBalance;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!startDate || !endDate || !reason.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (!dateCalculation.isValid) {
      setErrorMessage(dateCalculation.error || 'Invalid date range.');
      return;
    }

    if (dateCalculation.workingDays === 0) {
      setErrorMessage('Selected date range contains only weekends (0 working days).');
      return;
    }

    if (isBalanceInsufficient) {
      setErrorMessage(`Insufficient ${leaveType} leave balance. Available: ${availableBalance} day(s), Requested: ${dateCalculation.workingDays} working day(s).`);
      return;
    }

    try {
      setLoading(true);
      const res = await API.post('/leaves', {
        leaveType,
        startDate,
        endDate,
        reason: reason.trim()
      });

      await refreshUser();
      onSuccess(res.data.message || 'Leave request submitted successfully.');
      onClose();
      // Reset form
      setStartDate('');
      setEndDate('');
      setReason('');
      setLeaveType('Casual');
    } catch (err) {
      console.error("Apply leave error:", err);
      const msg = err.response?.data?.message || 'Failed to submit leave request.';
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
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Apply for Leave</h3>
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

        <form onSubmit={handleSubmit}>
          {/* Leave Type Selector */}
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setLeaveType('Casual')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: leaveType === 'Casual' ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                  background: leaveType === 'Casual' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-input)',
                  color: leaveType === 'Casual' ? '#60a5fa' : 'var(--text-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Casual Leave ({user?.leaveBalance?.casual ?? 0} left)
              </button>
              <button
                type="button"
                onClick={() => setLeaveType('Sick')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: leaveType === 'Sick' ? '2px solid #ec4899' : '1px solid var(--border-color)',
                  background: leaveType === 'Sick' ? 'rgba(236, 72, 153, 0.15)' : 'var(--bg-input)',
                  color: leaveType === 'Sick' ? '#f472b6' : 'var(--text-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Sick Leave ({user?.leaveBalance?.sick ?? 0} left)
              </button>
            </div>
          </div>

          {/* Date Pickers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                min={startDate}
                onChange={e => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Realtime Working Days Breakdown Banner */}
          {dateCalculation.isValid && (
            <div className={`alert-banner ${isBalanceInsufficient || dateCalculation.workingDays === 0 ? 'warning' : 'info'}`}>
              <Info size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700 }}>
                  Leave Duration: {dateCalculation.workingDays} Working Day(s)
                </div>
                <div style={{ fontSize: '0.78rem', marginTop: '0.2rem', opacity: 0.9 }}>
                  {dateCalculation.calendarDays} calendar day(s) selected
                  {dateCalculation.weekendDays > 0 ? ` (${dateCalculation.weekendDays} weekend day(s) excluded)` : ''}
                </div>
                {isBalanceInsufficient && (
                  <div style={{ color: '#ef4444', fontWeight: 600, marginTop: '0.35rem' }}>
                    ⚠️ Exceeds your available {leaveType} leave balance ({availableBalance} days left)
                  </div>
                )}
                {dateCalculation.workingDays === 0 && (
                  <div style={{ color: '#fbbf24', fontWeight: 600, marginTop: '0.35rem' }}>
                    ⚠️ Selected range falls entirely on weekends
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reason Field */}
          <div className="form-group">
            <label className="form-label">Reason for Leave</label>
            <textarea
              className="form-textarea"
              placeholder="Provide detail/reason for your leave request..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || isBalanceInsufficient || (dateCalculation.isValid && dateCalculation.workingDays === 0)}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeaveModal;

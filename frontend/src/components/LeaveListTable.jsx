import React from 'react';
import { formatDate } from '../utils/dateUtils';
import { Clock, CheckCircle2, XCircle, MessageSquare, User, Calendar } from 'lucide-react';

const LeaveListTable = ({ leaves = [], isManager = false, onReview }) => {

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="badge badge-approved">
            <CheckCircle2 size={13} /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="badge badge-rejected">
            <XCircle size={13} /> Rejected
          </span>
        );
      default:
        return (
          <span className="badge badge-pending">
            <Clock size={13} /> Pending
          </span>
        );
    }
  };

  if (!leaves || leaves.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
        <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
        <h4 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
          No Leave Requests Found
        </h4>
        <p style={{ fontSize: '0.85rem' }}>
          {isManager ? 'No pending or matching leave requests in the system.' : 'You have not submitted any leave requests yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {isManager && <th>Employee</th>}
            <th>Leave Type</th>
            <th>Date Range</th>
            <th>Working Days</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Manager Note</th>
            {isManager && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => {
            const employeeName = leave.employee?.name || 'Employee';
            const employeeEmail = leave.employee?.email || '';

            return (
              <tr key={leave._id}>
                {isManager && (
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                        {employeeName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{employeeName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{employeeEmail}</div>
                      </div>
                    </div>
                  </td>
                )}

                <td>
                  <span style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: leave.leaveType === 'Casual' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(236, 72, 153, 0.12)',
                    color: leave.leaveType === 'Casual' ? '#60a5fa' : '#f472b6',
                    border: `1px solid ${leave.leaveType === 'Casual' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(236, 72, 153, 0.3)'}`
                  }}>
                    {leave.leaveType}
                  </span>
                </td>

                <td>
                  <div style={{ fontWeight: 600 }}>
                    {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                  </div>
                </td>

                <td>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}
                  </span>
                </td>

                <td style={{ maxWidth: '240px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={leave.reason}>
                    {leave.reason}
                  </div>
                </td>

                <td>{getStatusBadge(leave.status)}</td>

                <td style={{ maxWidth: '200px' }}>
                  {leave.managerComment ? (
                    <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }} title={leave.managerComment}>
                      <MessageSquare size={13} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {leave.managerComment}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</span>
                  )}
                </td>

                {isManager && (
                  <td>
                    {leave.status === 'Pending' ? (
                      <button
                        onClick={() => onReview(leave)}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      >
                        Review
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Processed</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveListTable;

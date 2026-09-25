import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { formatDate } from '../utils/dateUtils';
import { Users, Mail, Sparkles, RefreshCw } from 'lucide-react';

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await API.get('/leaves/employees');
      setEmployees(res.data.employees || []);
    } catch (err) {
      console.error("Fetch employees error:", err);
      setError('Failed to fetch employee list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading employees directory...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} color="#6366f1" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Employee Directory ({employees.length})</h3>
        </div>
        <button onClick={fetchEmployees} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && <div className="alert-banner danger">{error}</div>}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Email Address</th>
              <th>Casual Leave Balance</th>
              <th>Sick Leave Balance</th>
              <th>Total Remaining</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const casual = emp.leaveBalance?.casual ?? 0;
              const sick = emp.leaveBalance?.sick ?? 0;
              const totalRemaining = casual + sick;

              return (
                <tr key={emp._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700
                      }}>
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{emp.name}</span>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                      <Mail size={14} /> {emp.email}
                    </div>
                  </td>

                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: casual > 3 ? '#60a5fa' : '#f87171',
                      padding: '0.25rem 0.65rem',
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '8px'
                    }}>
                      {casual} days left
                    </span>
                  </td>

                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: sick > 3 ? '#f472b6' : '#f87171',
                      padding: '0.25rem 0.65rem',
                      background: 'rgba(236, 72, 153, 0.1)',
                      borderRadius: '8px'
                    }}>
                      {sick} days left
                    </span>
                  </td>

                  <td>
                    <span style={{ fontWeight: 800, color: totalRemaining > 5 ? '#34d399' : '#fbbf24' }}>
                      {totalRemaining} total days
                    </span>
                  </td>

                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatDate(emp.createdAt)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDirectory;

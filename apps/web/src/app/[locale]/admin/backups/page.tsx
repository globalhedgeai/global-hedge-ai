'use client';

import React, { useState, useEffect } from 'react';

interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  type: 'full' | 'incremental';
  status: 'completed' | 'failed' | 'in_progress';
  downloadUrl?: string;
}

interface BackupStats {
  totalBackups: number;
  totalSize: number;
  lastBackupDate: string | null;
  oldestBackupDate: string | null;
  averageSize: number;
}

export default function BackupManagementPage() {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [backupsRes, statsRes] = await Promise.all([
        fetch('/api/admin/backups?action=list'),
        fetch('/api/admin/backups?action=stats')
      ]);

      const backupsData = await backupsRes.json();
      const statsData = await statsRes.json();

      if (backupsData.ok) {
        setBackups(backupsData.backups);
      }

      if (statsData.ok) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Failed to fetch backup data:', error);
      setMessage({ type: 'error', text: 'Failed to fetch backup data' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, backupId?: string) => {
    try {
      setActionLoading(action);
      setMessage(null);

      const response = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, backupId })
      });

      const data = await response.json();

      if (data.ok) {
        setMessage({ type: 'success', text: data.message || 'Operation completed successfully' });
        await fetchData(); // Refresh data
      } else {
        setMessage({ type: 'error', text: data.error || 'Operation failed' });
      }
    } catch (error) {
      console.error('Backup operation failed:', error);
      setMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading backup data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Backup Management</h1>
              <p className="text-muted-foreground text-lg">Manage database backups and restore operations</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleAction('create_full')}
                disabled={actionLoading === 'create_full'}
                className="btn-primary"
              >
                {actionLoading === 'create_full' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
                Create Full Backup
              </button>
              <button
                onClick={() => handleAction('cleanup')}
                disabled={actionLoading === 'cleanup'}
                className="btn-secondary"
              >
                {actionLoading === 'cleanup' ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                Cleanup Old Backups
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            <div className="card text-center">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Total Backups</h3>
                <p className="text-2xl font-bold text-primary">{stats.totalBackups}</p>
              </div>
            </div>

            <div className="card text-center">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-success to-green-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Total Size</h3>
                <p className="text-2xl font-bold text-success">{formatFileSize(stats.totalSize)}</p>
              </div>
            </div>

            <div className="card text-center">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-warning to-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Last Backup</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.lastBackupDate ? formatDate(stats.lastBackupDate) : 'Never'}
                </p>
              </div>
            </div>

            <div className="card text-center">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-info to-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Average Size</h3>
                <p className="text-2xl font-bold text-info">{formatFileSize(stats.averageSize)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Backup List */}
        <div className="card animate-fade-in">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Backup Files</h2>
              <button
                onClick={fetchData}
                className="btn-secondary"
                disabled={loading}
              >
                <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {backups.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Backups Found</h3>
                <p className="text-muted-foreground mb-4">Create your first backup to get started</p>
                <button
                  onClick={() => handleAction('create_full')}
                  disabled={actionLoading === 'create_full'}
                  className="btn-primary"
                >
                  Create Full Backup
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-sm text-foreground uppercase bg-accent/20">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Filename</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 rounded-r-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((backup) => (
                      <tr key={backup.id} className="border-b border-border hover:bg-accent/10 transition-colors">
                        <td className="px-4 py-4 font-medium text-foreground">{backup.filename}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            backup.type === 'full' ? 'bg-primary/20 text-primary' : 'bg-info/20 text-info'
                          }`}>
                            {backup.type}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{formatFileSize(backup.size)}</td>
                        <td className="px-4 py-4 text-muted-foreground">{formatDate(backup.createdAt)}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            backup.status === 'completed' ? 'bg-success/20 text-success' :
                            backup.status === 'failed' ? 'bg-error/20 text-error' :
                            'bg-warning/20 text-warning'
                          }`}>
                            {backup.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {backup.downloadUrl && (
                              <a
                                href={backup.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                                title="Download"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </a>
                            )}
                            <button
                              onClick={() => handleAction('restore', backup.id)}
                              disabled={actionLoading === `restore-${backup.id}`}
                              className="p-2 text-warning hover:text-warning/80 transition-colors"
                              title="Restore"
                            >
                              {actionLoading === `restore-${backup.id}` ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="mt-8 bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="font-semibold text-warning mb-1">Important Notice</h4>
              <p className="text-sm text-muted-foreground">
                Restoring a backup will replace all current data. Make sure to create a backup before restoring.
                This operation cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

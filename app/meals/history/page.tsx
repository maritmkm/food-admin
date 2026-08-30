'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../utils/api';
import { 
  ArrowLeft, History as HistoryIcon, RefreshCw, PlusCircle, Edit3, Trash2, ShieldCheck, Filter 
} from 'lucide-react';
import PermissionGuard from '../../components/PermissionGuard';
import Pagination from '../../components/Pagination';

export default function MenuHistoryPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalResults = logs.length;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;
  const currentLogs = logs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    fetchLogs();
  }, [selectedAction]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let query = `/meals/logs`;
      if (selectedAction !== 'All') {
        query += `?action=${selectedAction}`;
      }
      const data = await apiRequest(query);
      setLogs(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'ADDED':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <PlusCircle className="h-3 w-3" /> Added
          </span>
        );
      case 'UPDATED':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Edit3 className="h-3 w-3" /> Updated
          </span>
        );
      case 'REMOVED':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/80 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Trash2 className="h-3 w-3" /> Removed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 border border-zinc-200 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            {action}
          </span>
        );
    }
  };

  return (
    <PermissionGuard permission="plans">
      <main className="flex-1 overflow-y-auto p-6 md:p-10 font-sans bg-[#F9FBE7] text-[#111827]">
        {/* Header Bar with Back Arrow */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/meals')}
                className="p-2 rounded-2xl bg-white border border-zinc-200/80 hover:bg-zinc-100 text-zinc-700 shadow-sm transition-colors"
                title="Back to Menu Management"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-[#111827]">Menu Activity History</h1>
                <p className="text-xs text-zinc-500 font-semibold mt-0.5">
                  Audit log of added, updated, and removed menu items
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              className="p-3 rounded-2xl bg-white border border-zinc-200/80 hover:bg-zinc-50 text-zinc-600 shadow-sm transition-colors"
              title="Refresh Activity Log"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-400 uppercase">Filter Action:</span>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-extrabold text-[#111827] focus:outline-none cursor-pointer"
            >
              <option value="All">All Actions</option>
              <option value="ADDED">Added</option>
              <option value="UPDATED">Updated</option>
              <option value="REMOVED">Removed</option>
            </select>
          </div>

          <span className="text-xs font-extrabold text-zinc-500">
            Total Log Entries: <strong className="text-[#111827]">{logs.length}</strong>
          </span>
        </div>

        {/* Audit Trail Table List View */}
        {loading ? (
          <div className="py-20 text-center text-zinc-400 font-bold text-sm bg-white rounded-3xl border border-zinc-200/80">
            Loading menu activity logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 bg-white rounded-3xl border border-zinc-200/80 text-center p-8">
            <HistoryIcon className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-zinc-600">No activity history found matching filter</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-zinc-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-4 px-6 font-bold">Action</th>
                    <th className="py-4 px-4 font-bold">Item Name</th>
                    <th className="py-4 px-6 font-bold">Activity Details</th>
                    <th className="py-4 px-4 font-bold">Performed By</th>
                    <th className="py-4 px-6 font-bold text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs text-[#111827]">
                  {currentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50/60 transition-colors">
                      {/* Action Badge */}
                      <td className="py-4 px-6">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Item Name */}
                      <td className="py-4 px-4 font-extrabold text-sm text-[#111827]">
                        {log.itemName}
                      </td>

                      {/* Details */}
                      <td className="py-4 px-6 text-zinc-600 font-semibold max-w-md">
                        {log.details}
                      </td>

                      {/* Performed By */}
                      <td className="py-4 px-4 font-bold text-zinc-700">
                        {log.performedBy || 'Admin Staff'}
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-6 text-right text-xs font-semibold text-zinc-500 whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={totalResults}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </main>
    </PermissionGuard>
  );
}

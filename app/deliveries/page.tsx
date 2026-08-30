'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../utils/api';
import { 
  RefreshCw, 
  Clock, 
  Plus, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Calendar,
  X, 
  CheckCircle2, 
  AlertTriangle,
  Utensils,
  MessageSquare,
  Send
} from 'lucide-react';
import PermissionGuard from '../components/PermissionGuard';
import Pagination from '../components/Pagination';

export default function AdminDeliveries() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  // Date filtering & dispatch creation state
  const [filterDate, setFilterDate] = useState(getTodayStr());

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dispatchDate, setDispatchDate] = useState(getTodayStr());
  const [dispatchMeals, setDispatchMeals] = useState({
    breakfast: true,
    lunch: true,
    dinner: true,
  });
  const [creating, setCreating] = useState(false);

  // Download Modal State
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadDate, setDownloadDate] = useState(getTodayStr());
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'pdf'>('csv');

  // Dispatch Message Modal States
  const [isDispatchMessageModalOpen, setIsDispatchMessageModalOpen] = useState(false);
  const [isConfirmDispatchModalOpen, setIsConfirmDispatchModalOpen] = useState(false);
  const [messageCategories, setMessageCategories] = useState<{ [key: string]: boolean }>({
    Breakfast: true,
    Lunch: true,
    Dinner: true,
    Snacks: false,
    'Fruit Bowl': false,
  });
  const [sendingDispatchAlert, setSendingDispatchAlert] = useState(false);

  // Notifications
  const [notice, setNotice] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/deliveries');
      data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setDeliveries(data);
      if (data.length > 0 && !data.some((d: any) => d.date === filterDate)) {
        setFilterDate(data[0].date);
      }
    } catch (err: any) {
      console.error('Failed to fetch deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (delId: string, status: string) => {
    setUpdatingId(delId);
    try {
      await apiRequest(`/deliveries/${delId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      await fetchDeliveries();
    } catch (err: any) {
      alert(err.message || 'Failed to update delivery status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateDispatch = async () => {
    const selectedMealCats = [];
    if (dispatchMeals.breakfast) selectedMealCats.push('Breakfast');
    if (dispatchMeals.lunch) selectedMealCats.push('Lunch');
    if (dispatchMeals.dinner) selectedMealCats.push('Dinner');

    if (selectedMealCats.length === 0) {
      alert('Please select at least one meal category for the dispatch list');
      return;
    }

    const tomorrowStr = getTomorrowStr();
    if (!dispatchDate) {
      alert('Please select a target dispatch date');
      return;
    }
    if (dispatchDate > tomorrowStr) {
      alert('Target dispatch date can only be a previous date, today, or tomorrow.');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        date: dispatchDate,
        meals: selectedMealCats,
      };

      const created = await apiRequest('/deliveries/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setFilterDate(dispatchDate);
      setIsCreateModalOpen(false);
      setNotice({
        type: 'success',
        message: `Dispatch checklist created successfully for ${dispatchDate}! Created ${created.count || created.length || 0} delivery records.`,
      });

      await fetchDeliveries();
    } catch (err: any) {
      alert(err.message || 'Failed to generate dispatch checklist');
    } finally {
      setCreating(false);
    }
  };

  // Dispatch Message Modal Helpers
  const getSelectedCategoryNames = () => {
    return Object.keys(messageCategories).filter(cat => messageCategories[cat]);
  };

  const getTargetCustomerCountForCategories = () => {
    const selectedCats = getSelectedCategoryNames().map(c => c.toLowerCase());
    const filteredForDate = deliveries.filter(d => d.date === filterDate);
    const matching = filteredForDate.filter(d => {
      const dMeals = Array.isArray(d.meals) ? d.meals.map((m: string) => m.toLowerCase()) : [];
      return selectedCats.some(c => dMeals.includes(c));
    });
    return matching.length || filteredForDate.length;
  };

  const handleProceedToConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    const selected = getSelectedCategoryNames();
    if (selected.length === 0) {
      alert('Please select at least one meal category checkbox');
      return;
    }
    setIsDispatchMessageModalOpen(false);
    setIsConfirmDispatchModalOpen(true);
  };

  const handleSendDispatchAlertsConfirmed = async () => {
    const selected = getSelectedCategoryNames();
    setSendingDispatchAlert(true);
    try {
      const res = await apiRequest('/messaging/send-dispatch-alert', {
        method: 'POST',
        body: JSON.stringify({
          date: filterDate,
          mealCategories: selected,
        }),
      });

      setNotice({
        type: 'success',
        message: res.message || `Dispatch messages sent successfully to target customers for ${selected.join(', ')}!`
      });
      setIsConfirmDispatchModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to send dispatch alert messages');
    } finally {
      setSendingDispatchAlert(false);
    }
  };

  // Export Helpers
  const escapeXml = (str: string) => {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const exportToCSVForDate = (items: any[], dateStr: string) => {
    const headers = ['Recipient Name', 'Phone', 'Email', 'Delivery Address', 'Time Slot', 'Meals Included', 'Status', 'Notes'];
    const rows = items.map(d => [
      `"${(d.recipientName || '').replace(/"/g, '""')}"`,
      `"${(d.recipientPhone || '').replace(/"/g, '""')}"`,
      `"${(d.recipientEmail || '').replace(/"/g, '""')}"`,
      `"${(d.deliveryAddress || '').replace(/"/g, '""')}"`,
      `"${(d.deliveryTimeSlot || '').replace(/"/g, '""')}"`,
      `"${(Array.isArray(d.meals) ? d.meals.join(', ') : d.meals || '').replace(/"/g, '""')}"`,
      `"${(d.status || '').replace(/"/g, '""')}"`,
      `"${(d.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `daily_dispatch_checklist_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToXLSXForDate = (items: any[], dateStr: string) => {
    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Dispatch List">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Recipient Name</Data></Cell>
    <Cell><Data ss:Type="String">Phone</Data></Cell>
    <Cell><Data ss:Type="String">Email</Data></Cell>
    <Cell><Data ss:Type="String">Delivery Address</Data></Cell>
    <Cell><Data ss:Type="String">Time Slot</Data></Cell>
    <Cell><Data ss:Type="String">Meals Included</Data></Cell>
    <Cell><Data ss:Type="String">Status</Data></Cell>
    <Cell><Data ss:Type="String">Notes</Data></Cell>
   </Row>`;

    items.forEach(d => {
      xml += `
   <Row>
    <Cell><Data ss:Type="String">${escapeXml(d.recipientName || '')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(d.recipientPhone || '')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(d.recipientEmail || '')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(d.deliveryAddress || '')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(d.deliveryTimeSlot || '')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(Array.isArray(d.meals) ? d.meals.join(', ') : d.meals || '')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(d.status || '')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(d.notes || '')}</Data></Cell>
   </Row>`;
    });

    xml += `
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `daily_dispatch_checklist_${dateStr}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDFForDate = (items: any[], dateStr: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = items.map((d, idx) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>${escapeXml(d.recipientName || '')}</strong><br/><small>${escapeXml(d.recipientPhone || '')}</small></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${escapeXml(d.deliveryAddress || '')}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${escapeXml(d.deliveryTimeSlot || '')}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${escapeXml(Array.isArray(d.meals) ? d.meals.join(', ') : d.meals || '')}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-transform: capitalize;">${escapeXml((d.status || '').replace('_', ' '))}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">[ &nbsp; ]</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Dispatch Checklist - ${dateStr}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #111827; }
            h1 { margin-bottom: 5px; font-size: 20px; }
            p { margin: 0 0 15px 0; color: #6b7280; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
            th { background: #f3f4f6; padding: 10px; border: 1px solid #ddd; text-align: left; text-transform: uppercase; font-size: 10px; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>serveflow.in — Daily Dispatch Checklist</h1>
          <p>Dispatch Date: <strong>${dateStr}</strong> | Total Orders: <strong>${items.length}</strong> | Printed on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Recipient / Contact</th>
                <th>Delivery Address</th>
                <th>Time Slot</th>
                <th>Meals</th>
                <th>Status</th>
                <th>Check</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadSubmit = () => {
    const targetItems = deliveries.filter(d => d.date === downloadDate);

    if (targetItems.length === 0) {
      alert(`No dispatch records found for date: ${downloadDate}`);
      return;
    }

    if (exportFormat === 'csv') {
      exportToCSVForDate(targetItems, downloadDate);
    } else if (exportFormat === 'xlsx') {
      exportToXLSXForDate(targetItems, downloadDate);
    } else if (exportFormat === 'pdf') {
      exportToPDFForDate(targetItems, downloadDate);
    }

    setIsDownloadModalOpen(false);
  };

  const filtered = deliveries.filter(d => d.date === filterDate);
  const totalResults = filtered.length;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;
  const currentDeliveries = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading && deliveries.length === 0) {
    return (
      <div className="flex min-h-screen bg-[#F9FBE7] text-[#111827] font-sans items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-10 w-10 animate-spin text-[#BBD915]" />
          <p className="text-zinc-600 font-semibold">Loading Daily Dispatch Checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="deliveries">
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto font-sans bg-[#F9FBE7]">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-zinc-200/80">
          <div>
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">Daily Dispatch Checklist</span>
            <span className="text-[10px] text-zinc-400 font-semibold block">Create, manage, and download food courier dispatch lists.</span>
          </div>
        
          <div className="flex flex-wrap items-center gap-3 text-[#111827]">
            {/* Create Dispatch List Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#111827] text-white hover:bg-zinc-800 font-black text-xs px-4 py-2.5 shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 text-[#BBD915]" />
              Create Dispatch List
            </button>

            {/* Dispatch Message Button */}
            <button
              onClick={() => setIsDispatchMessageModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 shadow-md transition-all active:scale-[0.98]"
            >
              <MessageSquare className="h-4 w-4 text-white" />
              Dispatch Message
            </button>

            {/* Download List Button */}
            <button
              onClick={() => {
                setDownloadDate(filterDate || getTodayStr());
                setIsDownloadModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2.5 shadow-sm transition-all active:scale-[0.98]"
            >
              <Download className="h-3.5 w-3.5" />
              Download List
            </button>

            {/* Date Filter */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 shadow-xs">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <span className="text-xs text-zinc-500 font-bold uppercase">Date:</span>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-[#111827] focus:outline-none cursor-pointer"
              />
            </div>

            <button 
              onClick={fetchDeliveries}
              className="flex items-center gap-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-[#111827] font-bold text-xs p-2.5 shadow-sm transition-all"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        {notice && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold ${
            notice.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}>
            <span>{notice.message}</span>
            <button onClick={() => setNotice(null)} className="p-1 text-zinc-400 hover:text-zinc-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Dispatch Deliveries List Container */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#111827]">
              Dispatch Orders ({filterDate})
            </h2>
            <span className="text-xs font-bold text-zinc-400">Total: {totalResults} orders</span>
          </div>

          <div className="overflow-x-auto border border-zinc-200/80 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-zinc-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Recipient / Contact</th>
                  <th className="py-3.5 px-4">Delivery Address</th>
                  <th className="py-3.5 px-4">Time Slot</th>
                  <th className="py-3.5 px-4">Meals</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs text-[#111827]">
                {currentDeliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-sm text-[#111827]">
                      <div>
                        <span>{del.recipientName}</span>
                        <span className="block text-[11px] font-semibold text-zinc-400 mt-0.5">{del.recipientPhone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-zinc-700 max-w-xs truncate">
                      {del.deliveryAddress}
                    </td>
                    <td className="py-4 px-4 font-semibold text-zinc-600">
                      {del.deliveryTimeSlot}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-emerald-800">
                      {Array.isArray(del.meals) ? del.meals.join(', ') : del.meals}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        del.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        del.status === 'out_for_delivery' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {del.status ? del.status.replace('_', ' ') : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {del.status !== 'delivered' && (
                          <button
                            onClick={() => handleUpdateStatus(del.id, 'delivered')}
                            disabled={updatingId === del.id}
                            className="rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 text-[11px] font-bold text-emerald-800 transition-colors"
                          >
                            Mark Delivered
                          </button>
                        )}
                        {del.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(del.id, 'out_for_delivery')}
                            disabled={updatingId === del.id}
                            className="rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 text-[11px] font-bold text-blue-800 transition-colors"
                          >
                            Mark Out for Delivery
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-500 font-bold bg-white">
                      <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                        <div className="p-4 rounded-3xl bg-zinc-50 border border-zinc-200 text-zinc-400">
                          <Utensils className="h-8 w-8" />
                        </div>
                        <h4 className="text-sm font-black text-[#111827] mt-1">No Deliveries Found</h4>
                        <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                          Click &quot;Create Dispatch List&quot; above to generate daily courier delivery orders.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={totalResults}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        {/* Modal 1: Create Dispatch List Popup */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in-50">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-zinc-200 space-y-5 text-[#111827]">
              
              <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
                <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
                  <Plus className="h-5 w-5 text-[#BBD915]" />
                  Generate Daily Dispatch Checklist
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">
                      Select Target Dispatch Date *
                    </label>
                    <span className="text-[10px] font-bold text-zinc-400">
                      Previous Days, Today &amp; Tomorrow
                    </span>
                  </div>
                  <input
                    type="date"
                    max={getTomorrowStr()}
                    value={dispatchDate}
                    onChange={(e) => setDispatchDate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-bold text-[#111827] focus:bg-white focus:border-zinc-400 focus:outline-none cursor-pointer"
                  />

                  {/* Quick Select Buttons */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setDispatchDate(getYesterdayStr())}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                        dispatchDate === getYesterdayStr()
                          ? 'bg-[#111827] text-[#BBD915] border-[#111827]'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                      }`}
                    >
                      Yesterday
                    </button>
                    <button
                      type="button"
                      onClick={() => setDispatchDate(getTodayStr())}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                        dispatchDate === getTodayStr()
                          ? 'bg-[#111827] text-[#BBD915] border-[#111827]'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setDispatchDate(getTomorrowStr())}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                        dispatchDate === getTomorrowStr()
                          ? 'bg-[#111827] text-[#BBD915] border-[#111827]'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                      }`}
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                    Select Included Meal Times *
                  </label>
                  <div className="space-y-2 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dispatchMeals.breakfast}
                        onChange={(e) => setDispatchMeals({ ...dispatchMeals, breakfast: e.target.checked })}
                        className="h-4 w-4 rounded border-zinc-300 text-[#111827] focus:ring-zinc-400"
                      />
                      <span className="text-xs font-bold text-[#111827]">Breakfast</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dispatchMeals.lunch}
                        onChange={(e) => setDispatchMeals({ ...dispatchMeals, lunch: e.target.checked })}
                        className="h-4 w-4 rounded border-zinc-300 text-[#111827] focus:ring-zinc-400"
                      />
                      <span className="text-xs font-bold text-[#111827]">Lunch</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dispatchMeals.dinner}
                        onChange={(e) => setDispatchMeals({ ...dispatchMeals, dinner: e.target.checked })}
                        className="h-4 w-4 rounded border-zinc-300 text-[#111827] focus:ring-zinc-400"
                      />
                      <span className="text-xs font-bold text-[#111827]">Dinner</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateDispatch}
                  disabled={creating}
                  className="flex-1 rounded-xl bg-[#111827] text-white font-black text-xs py-2.5 shadow-md hover:bg-zinc-800 transition-all active:scale-[0.98]"
                >
                  {creating ? 'Generating...' : 'Generate Checklist'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Modal 2: Download Checklist Popup */}
        {isDownloadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in-50">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-zinc-200 space-y-5 text-[#111827]">
              
              <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
                <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
                  <Download className="h-5 w-5 text-orange-500" />
                  Download Daily Dispatch Checklist
                </h3>
                <button
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                    Select Target Date *
                  </label>
                  <input
                    type="date"
                    max={getTomorrowStr()}
                    value={downloadDate}
                    onChange={(e) => setDownloadDate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-bold text-[#111827] focus:bg-white focus:border-zinc-400 focus:outline-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                    Select File Format Option *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setExportFormat('csv')}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-black cursor-pointer ${
                        exportFormat === 'csv'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      <FileText className="h-5 w-5 text-emerald-600" />
                      <span>CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExportFormat('xlsx')}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-black cursor-pointer ${
                        exportFormat === 'xlsx'
                          ? 'border-green-600 bg-green-50 text-green-900 shadow-sm ring-2 ring-green-500/20'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      <span>XLSX</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExportFormat('pdf')}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-black cursor-pointer ${
                        exportFormat === 'pdf'
                          ? 'border-red-600 bg-red-50 text-red-900 shadow-sm ring-2 ring-red-500/20'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      <Printer className="h-5 w-5 text-red-600" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="flex-1 rounded-xl border border-zinc-200 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSubmit}
                  className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-3 shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Modal 3: Select Meal Category Checkbox Popup */}
        {isDispatchMessageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/30 backdrop-blur-sm overflow-y-auto">
            <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200/80 p-6 md:p-8 animate-in fade-in-50 duration-200 text-[#111827]">
              
              <button 
                onClick={() => setIsDispatchMessageModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-xl font-extrabold mb-6 border-b border-zinc-100 pb-4 flex items-center gap-2">
                <MessageSquare className="h-5.5 w-5.5 text-emerald-600" />
                Dispatch Message Notifications
              </h3>

              <p className="text-xs text-zinc-500 font-semibold mb-6 -mt-3">
                Select target meal category checkboxes to send dispatch alert messages for {filterDate}.
              </p>

              <form onSubmit={handleProceedToConfirmModal} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-3">
                    Select Target Meal Categories *
                  </label>
                  <div className="space-y-3 bg-zinc-50/80 p-4 rounded-2xl border border-zinc-200/80">
                    {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Fruit Bowl'].map((cat) => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-white transition-colors">
                        <input
                          type="checkbox"
                          checked={!!messageCategories[cat]}
                          onChange={(e) => setMessageCategories({ ...messageCategories, [cat]: e.target.checked })}
                          className="h-4 w-4 rounded-md border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="text-xs font-extrabold text-[#111827]">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsDispatchMessageModalOpen(false)}
                    className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-6 py-2.5 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 text-xs font-black shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 4: Confirmation Popup */}
        {isConfirmDispatchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/30 backdrop-blur-sm overflow-y-auto">
            <div className="relative bg-white rounded-3xl w-full max-w-md overflow-y-auto shadow-2xl border border-zinc-200/80 p-6 md:p-8 animate-in fade-in-50 duration-200 text-[#111827]">
              
              <button 
                onClick={() => setIsConfirmDispatchModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-xl font-extrabold mb-4 border-b border-zinc-100 pb-4 flex items-center gap-2 text-[#111827]">
                <CheckCircle2 className="h-5.5 w-5.5 text-emerald-600" />
                Confirm Message Dispatch
              </h3>

              <p className="text-sm text-zinc-600 font-bold leading-relaxed mb-6">
                Are you sure you want to send dispatch alert messages to target customers for the selected meal categories ({getSelectedCategoryNames().join(', ')})?
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsConfirmDispatchModalOpen(false)}
                  className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-6 py-2.5 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendDispatchAlertsConfirmed}
                  disabled={sendingDispatchAlert}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 text-xs font-black shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
                >
                  {sendingDispatchAlert ? 'Sending Messages...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </PermissionGuard>
  );
}

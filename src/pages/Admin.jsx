import React, { useState } from 'react';
import { CalendarClock, Send, Zap } from 'lucide-react';

export default function Admin() {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    scheduleTime: '',
    targetToken: ''
  });
  const [loadingType, setLoadingType] = useState(null); // 'azure' | 'firebase' | null
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleScheduleAzure = async () => {
    setLoadingType('azure');
    setStatus(null);

    try {
      // Mock API call to Azure
      await new Promise(res => setTimeout(res, 1000));
      setStatus({ type: 'success', message: 'Đã lên lịch thành công sang Azure!' });
      setFormData({ title: '', body: '', scheduleTime: '', targetToken: '' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Có lỗi xảy ra khi gọi API Azure.' });
    } finally {
      setLoadingType(null);
    }
  };

  const handleSendImmediately = async () => {
    setLoadingType('firebase');
    setStatus(null);

    try {
      // Gọi lên Vercel Serverless Function để kích hoạt Firebase Admin gửi Push
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: formData.targetToken,
          title: formData.title,
          body: formData.body
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send');
      }

      setStatus({ type: 'success', message: 'Đã bắn thông báo thành công qua Firebase!' });
    } catch (error) {
      setStatus({ type: 'error', message: `Lỗi: ${error.message}` });
    } finally {
      setLoadingType(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Do nothing on default submit to prevent accidental triggers. The buttons have their own onClick handlers.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-10">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="p-3 bg-indigo-100 rounded-2xl">
              <CalendarClock className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Admin Lên Lịch</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề thông báo</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="VD: Cập nhật hệ thống" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
              <textarea name="body" required value={formData.body} onChange={handleChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="VD: Hệ thống sẽ bảo trì vào lúc..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian gửi (Chỉ dùng cho Azure)</label>
              <input type="datetime-local" name="scheduleTime" value={formData.scheduleTime} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Device Token (FCM)</label>
              <input type="text" name="targetToken" required value={formData.targetToken} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono text-sm" placeholder="Dán token lấy từ trang chủ vào đây" />
            </div>

            {status && (
              <div className={`p-4 rounded-xl text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {status.message}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={handleScheduleAzure}
                disabled={!!loadingType || !formData.title || !formData.body || !formData.targetToken}
                className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 ease-in-out transform hover:translate-y-[-2px] hover:shadow-lg disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none"
              >
                {loadingType === 'azure' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="text-sm">Lên Lịch Azure</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleSendImmediately}
                disabled={!!loadingType || !formData.title || !formData.body || !formData.targetToken}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl transition duration-200 ease-in-out transform hover:translate-y-[-2px] hover:shadow-lg disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none"
              >
                {loadingType === 'firebase' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">Gửi Ngay (Firebase)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { CalendarClock, Send } from 'lucide-react';

export default function Admin() {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    scheduleTime: '',
    targetToken: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // MOCK API CALL TO AZURE
    // Here we simulate calling the Azure backend API
    try {
      console.log('Sending payload to Azure API:', formData);
      
      // TẠM THỜI: Thay url này bằng URL API thật của Azure sau
      const azureApiUrl = 'https://mock-azure-api.com/api/schedule-notification'; 
      
      // Uncomment code dưới đây khi bạn có API thật
      /*
      const response = await fetch(azureApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('API failed');
      */
      
      // Giả lập delay mạng
      await new Promise(res => setTimeout(res, 1000));

      setStatus({
        type: 'success',
        message: 'Đã lên lịch thành công! (Mock API)'
      });
      
      // Reset form
      setFormData({ title: '', body: '', scheduleTime: '', targetToken: '' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Có lỗi xảy ra khi gọi API.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-10">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="p-3 bg-indigo-100 rounded-2xl">
              <CalendarClock className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Admin Lên Lịch
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề thông báo</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="VD: Cập nhật hệ thống"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
              <textarea
                name="body"
                required
                value={formData.body}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="VD: Hệ thống sẽ bảo trì vào lúc..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian gửi</label>
              <input
                type="datetime-local"
                name="scheduleTime"
                required
                value={formData.scheduleTime}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Device Token (FCM)</label>
              <input
                type="text"
                name="targetToken"
                required
                value={formData.targetToken}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono text-sm"
                placeholder="Dán token lấy từ trang chủ vào đây"
              />
            </div>

            {status && (
              <div className={`p-4 rounded-xl text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition duration-200 ease-in-out transform hover:translate-y-[-2px] hover:shadow-lg disabled:opacity-70 disabled:transform-none"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Lên Lịch Gửi Sang Azure</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

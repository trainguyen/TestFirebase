import React, { useState, useEffect } from 'react';
import { requestForToken, onMessageListener } from '../firebase';
import { Bell, Copy, CheckCircle2 } from 'lucide-react';

export default function Client() {
  const [token, setToken] = useState('');
  const [notification, setNotification] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Listen for foreground notifications
    onMessageListener()
      .then((payload) => {
        setNotification({
          title: payload?.notification?.title,
          body: payload?.notification?.body,
        });
        // Clear notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      })
      .catch((err) => console.log('failed: ', err));
  }, []);

  const handleGetToken = async () => {
    const fetchedToken = await requestForToken();
    if (fetchedToken) {
      setToken(fetchedToken);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
            <Bell className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nhận Thông Báo</h1>
          <p className="text-gray-500 mb-8">
            Cấp quyền để nhận thông báo và lấy FCM Token của thiết bị này.
          </p>

          {!token ? (
            <button
              onClick={handleGetToken}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 ease-in-out transform hover:scale-[1.02] active:scale-95 shadow-md"
            >
              Cấp Quyền & Lấy Token
            </button>
          ) : (
            <div className="text-left bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
                FCM Token của bạn
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 block truncate text-sm text-gray-800 bg-gray-200 p-2 rounded">
                  {token}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-lg transition-colors"
                  title="Copy Token"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {notification && (
          <div className="bg-indigo-600 p-4 animate-fade-in-up">
            <h4 className="font-bold text-white text-sm">{notification.title}</h4>
            <p className="text-indigo-100 text-sm mt-1">{notification.body}</p>
          </div>
        )}
      </div>
    </div>
  );
}

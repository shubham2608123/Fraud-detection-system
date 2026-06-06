import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useApp } from '../context/AppContext';
import socket from '../utils/socket';

export default function Layout({ children }) {
  const { fetchLatestData } = useApp();

  useEffect(() => {
    fetchLatestData();
    socket.connect();
    socket.on('new-upload', () => {
      fetchLatestData();
    });
    return () => {
      socket.disconnect();
      socket.off('new-upload');
    };
  }, [fetchLatestData]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import FloatingParticles from './FloatingParticles';
import AuroraBackground from './AuroraBackground';
import { useState } from 'react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* Aurora gradient background */}
      <AuroraBackground />
      {/* Floating particles */}
      <FloatingParticles count={25} />
      {/* Subtle background mesh */}
      <div className="fixed inset-0 bg-mesh-gradient pointer-events-none z-0" />
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none z-0" />
      {/* Hex grid pattern overlay */}
      <div className="fixed inset-0 hex-grid pointer-events-none z-0 opacity-50" />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="relative flex flex-col flex-1 overflow-hidden z-10">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Coins,
  ImageIcon,
  Users,
  BarChart2,
  DollarSign,
  Package,
  TrendingUp,
  Shield,
  HelpCircle,
  LogOut,
  Menu
} from "lucide-react";

const AdminSidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Coins, label: "Fees", href: "/admin/updatefees" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: ImageIcon, label: "NFTs", href: "/admin/nfts" },
    { icon: BarChart2, label: "Analytics", href: "/admin/analytics" },
    { icon: Shield, label: "Security", href: "/admin/security" },
    { icon: HelpCircle, label: "Support", href: "/admin/support" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800/50
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo and Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-pink-400" />
            </div>
            <span className="text-lg font-bold text-slate-200 font-mono">Admin Panel</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-200"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-pink-500/20 text-pink-400' 
                    : 'text-slate-400 hover:bg-zinc-800/50 hover:text-slate-200'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800/50">
          <button className="flex items-center space-x-3 w-full px-3 py-2 text-slate-400 hover:bg-zinc-800/50 hover:text-red-400 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar; 
import { 
  Home, 
  Settings, 
  Command, 
  Database, 
  BarChart2, 
  Search,
  BookOpen,
  HelpCircle,
  LogOut,
  User,
  Church,
  Bot,
  Cog,
  Book,
  CircleHelp
} from "lucide-react";
import { useLocation, useNavigate } from "wouter";
import { cn } from "@/lib/utils";

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
};

function NavItem({ href, icon, active, children, onClick }: NavItemProps) {
  const [, navigate] = useNavigate();

  return (
    <div
      className={cn(
        "flex items-center p-2 hover:bg-discord-bg/30 rounded text-discord-lightgray hover:text-white cursor-pointer mb-1 text-sm",
        active && "bg-discord-bg/50 text-white"
      )}
      onClick={() => {
        navigate(href);
        if (onClick) {
          onClick();
        }
      }}
    >
      <span className="mr-2">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <>
      {/* Hidden on mobile, visible on md and up - Server icons */}
      <div className="hidden md:flex flex-col w-16 bg-discord-darkest p-3 items-center space-y-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-discord-blurple hover:rounded-2xl transition-all duration-200 cursor-pointer">
          <Church className="text-white" size={20} />
        </div>
        <div className="w-10 h-0.5 bg-discord-darkbg rounded-full"></div>

        <div onClick={() => window.location.href="/dashboard"} className="flex items-center justify-center w-12 h-12 rounded-3xl bg-discord-darkbg hover:rounded-2xl hover:bg-discord-green transition-all duration-200 cursor-pointer">
          <Bot className={cn("text-discord-lightgray hover:text-white", location === "/dashboard" && "text-white")} size={20} />
        </div>

        <div onClick={() => window.location.href="/config"} className="flex items-center justify-center w-12 h-12 rounded-3xl bg-discord-darkbg hover:rounded-2xl hover:bg-discord-blue transition-all duration-200 cursor-pointer">
          <Cog className={cn("text-discord-lightgray hover:text-white", location === "/config" && "text-white")} size={20} />
        </div>

        <div onClick={() => window.location.href="/knowledge"} className="flex items-center justify-center w-12 h-12 rounded-3xl bg-discord-darkbg hover:rounded-2xl hover:bg-discord-blurple transition-all duration-200 cursor-pointer">
          <Book className={cn("text-discord-lightgray hover:text-white", location === "/knowledge" && "text-white")} size={20} />
        </div>

        <div onClick={() => window.location.href="/help"} className="flex items-center justify-center w-12 h-12 rounded-3xl bg-discord-darkbg hover:rounded-2xl hover:bg-discord-red transition-all duration-200 cursor-pointer">
          <CircleHelp className={cn("text-discord-lightgray hover:text-white", location === "/help" && "text-white")} size={20} />
        </div>
      </div>

      {/* Hidden on mobile, visible on lg and up - Channel sidebar */}
      <div className="hidden lg:flex flex-col w-60 bg-discord-darkbg">
        <div className="p-4 shadow-sm border-b border-black/10">
          <h1 className="text-white font-bold text-xl">Ahmadiyya Bot</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="mt-2">
            <div className="text-discord-lightgray uppercase text-xs font-semibold px-2 mt-4 mb-2">Bot Management</div>

            <NavItem 
              href="/dashboard" 
              icon={<Home size={16} />} 
              active={location === "/dashboard"}
            >
              Dashboard
            </NavItem>

            <NavItem 
              href="/config" 
              icon={<Settings size={16} />} 
              active={location === "/config"}
            >
              Configuration
            </NavItem>

            <NavItem 
              href="/commands" 
              icon={<Command size={16} />} 
              active={location === "/commands"}
            >
              Commands
            </NavItem>

            <NavItem 
              href="/knowledge" 
              icon={<Database size={16} />} 
              active={location === "/knowledge"}
            >
              Knowledge Base
            </NavItem>
          </div>

          <div className="mt-4">
            <div className="text-discord-lightgray uppercase text-xs font-semibold px-2 mt-4 mb-2">Analytics</div>

            <NavItem 
              href="/stats" 
              icon={<BarChart2 size={16} />} 
              active={location === "/stats"}
            >
              Usage Statistics
            </NavItem>

            <NavItem 
              href="/queries" 
              icon={<Search size={16} />} 
              active={location === "/queries"}
            >
              Top Queries
            </NavItem>
          </div>

          <div className="mt-4">
            <div className="text-discord-lightgray uppercase text-xs font-semibold px-2 mt-4 mb-2">Help & Support</div>

            <NavItem 
              href="/docs" 
              icon={<BookOpen size={16} />} 
              active={location === "/docs"}
            >
              Documentation
            </NavItem>

            <NavItem 
              href="/help" 
              icon={<HelpCircle size={16} />} 
              active={location === "/help"}
            >
              Get Help
            </NavItem>
          </div>
        </div>

        <div className="p-3 bg-discord-darkest/50 flex items-center">
          <div className="w-8 h-8 rounded-full bg-discord-green flex items-center justify-center text-white">
            <User size={16} />
          </div>
          <div className="ml-2">
            <div className="text-sm font-semibold">AdminUser</div>
            <div className="text-xs text-discord-lightgray">#1234</div>
          </div>
          <div className="ml-auto text-discord-lightgray">
            <LogOut size={16} className="cursor-pointer hover:text-white" />
          </div>
        </div>
      </div>
    </>
  );
}
import { Link, useLocation } from "react-router-dom"; // 1. Import useLocation
import Icon from "../components/Icon";

const NAV_ITEMS = [
  // 2. Removed 'active' property from here, it will be calculated dynamically
  { icon: 'dashboard', label: 'Overview', link: '/admindashboard' },
  { icon: 'inventory_2', label: 'Assets', link: '/allassets' },
  { icon: 'pending_actions', label: 'Requests', link: '/requests' }, // Changed link to be unique
  { icon: 'bar_chart', label: 'Reports', link: '/reports' },         // Changed link to be unique
  { icon: 'add', label: 'Add Asset', link: '/create-asset' },
  { icon: 'group', label: 'All Users', link: '/users' },
];

const AdminNav = () => {
  const location = useLocation(); // 3. Get the current route location

  return (
    <header className="h-14 border-b border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-6">
        <Link to="/admindashboard" className="flex items-center gap-2">
          <div className="size-7 bg-primary rounded flex items-center justify-center text-white">
            <Icon name="inventory_2" className="!text-lg" />
          </div>
          <h2 className="text-base font-extrabold tracking-tight">
            AssetTrack <span className="text-primary">Pro</span>
          </h2>
        </Link>
        <nav className="flex items-center gap-4 border-l border-border-dark ml-2 pl-6">
          {NAV_ITEMS.map((item) => {
            // 4. Calculate if this specific item is active
            const isActive = location.pathname === item.link;

            return (
              <Link
                key={item.label}
                to={item.link}
                className={`flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary/10 text-primary' // Active Styles
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800' // Inactive Styles
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        
        <div className="flex items-center gap-3 pl-4 border-l border-border-dark">
          <Icon
            name="notifications"
            className="text-slate-500 !text-xl cursor-pointer hover:text-primary"
          />
          <div className="size-8 rounded border border-slate-300 dark:border-border-dark flex items-center justify-center overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-io-DIliWoodhYEXKofAYzTNAkZeCsTwH3xUhKCsy9ppSS_5ZofChWixF6rQ_LlJlbHosgNso5QeZPzh1JTOe-2_h_5qyAavsN1T_Xca9cpUo7FYNUGQG3zVV02D23u132fEVATpLiCy6NTyUVgZxkdphWbzXhowql2iVhHaY6IJTgNvJ1hoP7MzTxMKLtEhD7oGcekcjpTV5jckMSvruCSOya40RjIcZTuFdcqcjTWfuKbt6vA9Z5jh-lrx59GqfbepkO2vsHdc"
              alt="Profile"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNav;
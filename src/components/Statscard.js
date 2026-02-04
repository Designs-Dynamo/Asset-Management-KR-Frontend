import Icon from "./Icon";

const StatsCard = ({ title, icon, value, change, isPositive, trendIcon, iconColor }) => (
  <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark hover:border-primary/50 transition-colors group">
    <div className="flex justify-between items-start">
      <p className="text-slate-500 dark:text-[#a2b2b4] text-sm font-semibold uppercase tracking-wider">{title}</p>
      <Icon name={icon} className={`${iconColor || 'text-primary'} group-hover:scale-110 transition-transform`} />
    </div>
    <div className="flex items-baseline gap-2">
      <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold">{value}</p>
      <p className={`${isPositive ? 'text-[#0bda54]' : 'text-[#fa5c38]'} text-sm font-bold flex items-center`}>
        <Icon name={trendIcon} className="text-[16px] mr-1" /> {change}
      </p>
    </div>
  </div>
);

export default StatsCard;
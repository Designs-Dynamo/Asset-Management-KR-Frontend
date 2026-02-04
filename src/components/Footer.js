const Footer = () => (
  <footer className=" border-t border-slate-200 dark:border-border-dark py-3 flex justify-between items-center px-2 shrink-0 mt-10">
    <div className="flex items-center gap-6">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-primary"></span> System Stable
      </p>
      <p className="text-[10px] text-slate-500 uppercase tracking-tight font-mono">
        v4.2.0-STABLE / NODE_SG_01
      </p>
    </div>
    <div className="flex gap-6">
      {["Support Ticket", "Security Policy", "System Log Out"].map((item) => (
        <a
          key={item}
          className="text-[10px] font-bold text-slate-500 hover:text-primary uppercase tracking-widest"
          href="/policy"
        >
          {item}
        </a>
      ))}
    </div>
  </footer>
);

export default Footer;
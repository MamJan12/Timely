import { ChevronDown, UserCircle } from "lucide-react";
import ActionMenu from "../ui/ActionMenu";

const Header = () => {
  return (
    <div className="flex items-center justify-between border-b border-[var(--primary-400)] px-8 py-6">
      <h6 className="text-[var(--primary-400)]">Admin Portal</h6>
      <div className="flex items-center gap-3">
        <UserCircle className="w-12 h-12 text-[var(--gray-400)]" />
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <p className="text-[var(--gray-800)]">Username</p>
            <small className="text-[var(--primary-400)] -mt-0.5">Admin</small>
          </div>
          <ActionMenu
            trigger={<div className="border border-black rounded-sm"><ChevronDown /></div>}
            actions={[
              { label: "Settings", onClick: () => console.log("Settings clicked") },
              { label: "Logout",   onClick: () => console.log("Logout clicked") },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
import { Keyboard } from "lucide-react";

const Header = () => {
  return (
    <div className="w-full max-w-3xl flex items-center gap-2 mb-10">
      <Keyboard size={22} className="text-accent" />
      <span className="text-lg font-semibold tracking-tight">
        kana<span className="text-accent">type</span>
      </span>
    </div>
  );
}

export default Header;
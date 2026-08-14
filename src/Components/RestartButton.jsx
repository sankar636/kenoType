import { RotateCcw } from "lucide-react";

const RestartButton = ({ onRestart }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRestart();
      }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg mt-6 bg-bgSub text-sub transition-transform hover:scale-105 hover:text-text"
    >
      <RotateCcw size={14} />
      <span className="text-sm">restart</span>
    </button>
  );
}

export default RestartButton;


const  LiveTimer = ({ timeLeft }) => {
  const mm = Math.floor(timeLeft / 60);
  const ss = String(timeLeft % 60).padStart(2, "0");
  return (
    <div className="w-full mb-8 font-mono text-3xl text-accent">
      {mm}:{ss}
    </div>
  );
}

export default LiveTimer;

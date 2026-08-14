const HiddenInput = ({ inputRef, value, onChange, disabled }) => {
  return (
    <input
      ref={inputRef}
      value={value}
      onChange={onChange}
      autoFocus
      disabled={disabled}
      className="opacity-0 absolute w-0 h-0"
      autoCapitalize="off"
      autoCorrect="off"
      autoComplete="off"
      spellCheck={false}
    />
  );
}

export default HiddenInput;

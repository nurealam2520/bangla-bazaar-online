interface HoneypotFieldProps {
  value: string;
  onChange: (v: string) => void;
}

/** Hidden honeypot field — bots auto-fill it, humans don't see it */
const HoneypotField = ({ value, onChange }: HoneypotFieldProps) => (
  <div
    aria-hidden="true"
    style={{
      position: "absolute",
      left: "-9999px",
      top: "-9999px",
      width: 0,
      height: 0,
      overflow: "hidden",
      opacity: 0,
      pointerEvents: "none",
      tabIndex: -1,
    } as any}
  >
    <label htmlFor="website_url_confirm">Leave empty</label>
    <input
      id="website_url_confirm"
      name="website_url_confirm"
      type="text"
      autoComplete="off"
      tabIndex={-1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default HoneypotField;

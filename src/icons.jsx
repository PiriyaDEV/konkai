const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconPin(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  );
}

export function IconUsers(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 19c.7-3.4 3.2-5.2 6.2-5.2s5.5 1.8 6.2 5.2" />
      <circle cx="17" cy="8.6" r="2.4" />
      <path d="M15.5 13.9c2.5.2 4.3 1.9 4.9 4.7" />
    </svg>
  );
}

export function IconShuffle(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 6h4.2l9.6 12H21" />
      <path d="M14.4 6H21M3 18h4.2l2.9-3.6" />
      <path d="M18 3.3 21 6l-3 2.7M18 20.7 21 18l-3-2.7" />
    </svg>
  );
}

export function IconShuttle(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="17.2" r="2.4" />
      <path d="M12 14.8 9.6 7.2 7.4 4.3M12 14.8V6.1l-.5-3.3M12 14.8l2.4-7.6 2.2-2.9" />
    </svg>
  );
}

export function IconReceipt(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 2.5h12v19l-2.5-1.6L13 21.5l-1.9-1.6L9 21.5l-2.5-1.6L6 21.5Z" />
      <path d="M8.3 8h7.4M8.3 11.6h7.4M8.3 15.2h4.4" />
    </svg>
  );
}

export function IconClose(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

"use client";

import React from "react";

const IconBase = ({ children, className = "", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {children}
  </svg>
);

export const Home = (props) => (
  <IconBase {...props}>
    <path d="M3 9l9-7 9 7" />
    <path d="M9 22V12h6v10" />
    <path d="M21 22H3" />
  </IconBase>
);

export const PlusCircle = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8" />
    <path d="M8 12h8" />
  </IconBase>
);

export const BarChart3 = (props) => (
  <IconBase {...props}>
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </IconBase>
);

export const Search = (props) => (
  <IconBase {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </IconBase>
);

export const ChevronDown = (props) => (
  <IconBase {...props}>
    <polyline points="6 9 12 15 18 9" />
  </IconBase>
);

export const LogOut = (props) => (
  <IconBase {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </IconBase>
);


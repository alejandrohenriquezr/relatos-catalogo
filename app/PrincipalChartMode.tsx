"use client";
import { createContext, useContext } from "react";

// Both the analysis page and its home embed execute the same chart component
// and data-loading hooks. Only surrounding editorial content is omitted.
export const PrincipalChartMode = createContext(false);
export const usePrincipalChartMode = () => useContext(PrincipalChartMode);

"use client";

import { useState, useEffect } from 'react';

const SIDEBAR_STORAGE_KEY = 'sidebarOpened';

export default function useToggleSidebar(initialState = false) {
  const [isOpen, setIsOpen] = useState(() => {
    const storedState = sessionStorage.getItem(SIDEBAR_STORAGE_KEY);
    return storedState ? JSON.parse(storedState) : initialState;
  });

  useEffect(() => {
    sessionStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(isOpen));
  }, [isOpen]);

  const setOpen = (state: boolean) => setIsOpen(state);

  const toggle = () => setIsOpen((prev: boolean) => !prev);

  return {
    isOpen,
    toggle,
    setOpen
  };
}

import React, { createContext, useContext, useRef, useState } from 'react';

const FABContext = createContext({ visible: true, setVisible: () => {} });

export function FABProvider({ children }) {
  const [visible, setVisible] = useState(true);
  return (
    <FABContext.Provider value={{ visible, setVisible }}>
      {children}
    </FABContext.Provider>
  );
}

export function useFABVisibility() {
  return useContext(FABContext);
}

// Attach to a ScrollView's onScroll — hides FAB on scroll down, shows on scroll up / top
export function useFABScroll() {
  const { setVisible } = useContext(FABContext);
  const lastY = useRef(0);
  return (e) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y <= 80) {
      setVisible(true);
    } else if (y > lastY.current + 10) {
      setVisible(false);
    } else if (y < lastY.current - 10) {
      setVisible(true);
    }
    lastY.current = y;
  };
}

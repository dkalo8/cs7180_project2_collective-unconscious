import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext({
  fontSize: 'medium',
  setFontSize: () => {},
});

const FONT_SIZES = {
  small: '14px',
  medium: '16px',
  large: '20px',
};

export function SettingsProvider({ children }) {
  const [fontSize, setFontSizeState] = useState(
    () => localStorage.getItem('fontSize') || 'medium'
  );

  useEffect(() => {
    // Apply the font size class to the html element
    const html = document.documentElement;
    html.classList.remove('text-sm', 'text-md', 'text-lg');
    
    if (fontSize === 'small') html.classList.add('text-sm');
    else if (fontSize === 'large') html.classList.add('text-lg');
    else html.classList.add('text-md');

    // Also set a CSS variable for more granular control if needed
    html.style.setProperty('--base-font-size', FONT_SIZES[fontSize]);
    
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  const setFontSize = (size) => {
    setFontSizeState(size);
  };

  return (
    <SettingsContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

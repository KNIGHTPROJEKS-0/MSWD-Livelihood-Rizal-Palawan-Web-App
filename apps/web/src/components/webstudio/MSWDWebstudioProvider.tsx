import React, { createContext, useContext, useState } from 'react';
import { WebstudioConfig, MSWDComponent } from './types';

interface MSWDWebstudioContextType {
  config: WebstudioConfig | null;
  updateComponent: (id: string, props: Record<string, any>) => void;
  addComponent: (component: MSWDComponent) => void;
  removeComponent: (id: string) => void;
}

const MSWDWebstudioContext = createContext<MSWDWebstudioContextType | null>(null);

export const MSWDWebstudioProvider: React.FC<{ 
  children: React.ReactNode;
  initialConfig?: WebstudioConfig;
}> = ({ children, initialConfig }) => {
  const [config, setConfig] = useState<WebstudioConfig | null>(initialConfig || null);

  const updateComponent = (id: string, props: Record<string, any>) => {
    if (!config) return;
    
    setConfig(prev => ({
      ...prev!,
      components: prev!.components.map(comp => 
        comp.id === id ? { ...comp, props: { ...comp.props, ...props } } : comp
      )
    }));
  };

  const addComponent = (component: MSWDComponent) => {
    if (!config) return;
    
    setConfig(prev => ({
      ...prev!,
      components: [...prev!.components, component]
    }));
  };

  const removeComponent = (id: string) => {
    if (!config) return;
    
    setConfig(prev => ({
      ...prev!,
      components: prev!.components.filter(comp => comp.id !== id)
    }));
  };

  return (
    <MSWDWebstudioContext.Provider value={{
      config,
      updateComponent,
      addComponent,
      removeComponent
    }}>
      {children}
    </MSWDWebstudioContext.Provider>
  );
};

export const useMSWDWebstudio = () => {
  const context = useContext(MSWDWebstudioContext);
  if (!context) {
    throw new Error('useMSWDWebstudio must be used within MSWDWebstudioProvider');
  }
  return context;
};
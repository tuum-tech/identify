import { createContext, PropsWithChildren, useState } from 'react';

const VcContext = createContext({
  vcId: '',
  setVcId: (vcId: string) => {
    console.log('Not initialized', vcId);
  },
  vc: {},
  setVc: (vc: any) => {
    console.log('Not initialized', vc);
  },
});

const VcContextProvider = ({ children }: PropsWithChildren<any>) => {
  const [vcId, setVcId] = useState('');
  const [vc, setVc] = useState({});

  return (
    <VcContext.Provider value={{ vcId, setVcId, vc, setVc }}>
      {children}
    </VcContext.Provider>
  );
};

export { VcContext, VcContextProvider };

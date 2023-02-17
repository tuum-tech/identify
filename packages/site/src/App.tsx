import { GoogleOAuthProvider } from '@react-oauth/google';
import { FunctionComponent, ReactNode, useContext } from 'react';
import styled from 'styled-components';
import { Footer, Header } from './components';

import 'bootstrap/dist/css/bootstrap.min.css';
import { GlobalStyle } from './config/theme';
import { ToggleThemeContext } from './Root';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  max-width: 100vw;
`;

export type AppProps = {
  children: ReactNode;
};

export const App: FunctionComponent<AppProps> = ({ children }) => {
  const toggleTheme = useContext(ToggleThemeContext);

  return (
    <>
      <GlobalStyle />
      <Wrapper>
        <Header handleToggleClick={toggleTheme} />
        <GoogleOAuthProvider
          clientId={`${process.env.GATSBY_GOOGLE_DRIVE_CLIENT_ID}`}
        >
          {children}
        </GoogleOAuthProvider>
        <Footer />
      </Wrapper>
    </>
  );
};

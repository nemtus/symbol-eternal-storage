import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import loadable from '@loadable/component';
import { AuthUserProvider } from './contexts/auth';
import AppHeaderWidget from './components/widgets/app-header';

const HomePageComponent = loadable(() => import('./components/pages/home'));
const AuthSignInPageComponent = loadable(() => import('./components/pages/auth/sign-in'));
const UserUpdatePageComponent = loadable(() => import('./components/pages/users/[userId]/update'));
const UserPageComponent = loadable(() => import('./components/pages/users/[userId]'));
const FileCreatePageComponent = loadable(() => import('./components/pages/users/[userId]/files/create'));
const FileUpdatePageComponent = loadable(() => import('./components/pages/users/[userId]/files/[fileId]/update'));
const FilePageComponent = loadable(() => import('./components/pages/users/[userId]/files/[fileId]'));
const FilesPageComponent = loadable(() => import('./components/pages/users/[userId]/files'));
const NotFoundWidgetComponent = loadable(() => import('./components/widgets/not-found'));

function App() {
  return (
    <AuthUserProvider>
      <BrowserRouter>
        <AppHeaderWidget></AppHeaderWidget>
        <Routes>
          <Route path="/" element={<HomePageComponent />}></Route>
          <Route path="/auth/sign-in" element={<AuthSignInPageComponent />}></Route>
          <Route path="/users/:userId/update" element={<UserUpdatePageComponent />}></Route>
          <Route path="/users/:userId" element={<UserPageComponent />}></Route>
          <Route path="/users/:userId/files/create" element={<FileCreatePageComponent />}></Route>
          <Route path="/users/:userId/files/:fileId/update" element={<FileUpdatePageComponent />}></Route>
          <Route path="/users/:userId/files/:fileId" element={<FilePageComponent />}></Route>
          <Route path="/users/:userId/files" element={<FilesPageComponent />}></Route>
          <Route path="/*" element={<NotFoundWidgetComponent />}></Route>
        </Routes>
      </BrowserRouter>
    </AuthUserProvider>
  );
}

export default App;

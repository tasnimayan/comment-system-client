import { Suspense } from 'react';
import { Provider } from 'react-redux';
import AuthModal from './components/auth/AuthModal';
import { CommentsContainer } from './components/comments';
import { CommentsLoading } from './components/comments/CommentsLoading';
import Header from './components/layout/Header';
import { Toaster } from "./components/ui/sonner";
import { store } from './redux/store';

function App() {
  return (
    <Provider store={store}>
      <div className="min-h-screen flex flex-col gradient-radial">
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <Suspense fallback={<CommentsLoading />}>
            <CommentsContainer pageId="1" />
          </Suspense>
        </main>
        {/* Auth modal */}
        <AuthModal />
        <Toaster />
      </div>
    </Provider>
  );
}

export default App;

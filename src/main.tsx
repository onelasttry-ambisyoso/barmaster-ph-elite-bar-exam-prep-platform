import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import PracticePage from '@/pages/PracticePage'
import { SubjectPage } from '@/pages/SubjectPage'
import { ProgressPage } from '@/pages/ProgressPage'
import { CodalEditorPage } from '@/pages/CodalEditorPage'
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/practice",
    element: <PracticePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/subjects",
    element: <SubjectPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/progress",
    element: <ProgressPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/codals-editor",
    element: <CodalEditorPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
        <Toaster position="top-center" />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)
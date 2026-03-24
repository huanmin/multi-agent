import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './presentation/pages/Dashboard';
import { Welcome } from './presentation/pages/Welcome';
import { ExpertManager } from './presentation/pages/ExpertManager';
import { Chat } from './presentation/pages/Chat';
import { CodeReview } from './presentation/pages/CodeReview';
import { Layout } from './presentation/components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 欢迎引导页 */}
        <Route path="/welcome" element={<Welcome onComplete={() => window.location.href = '/dashboard'} />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        {/* 专家管理 */}
        <Route
          path="/experts"
          element={
            <Layout>
              <ExpertManager />
            </Layout>
          }
        />

        {/* 聊天 */}
        <Route
          path="/chat/:id"
          element={
            <Layout>
              <Chat />
            </Layout>
          }
        />

        {/* 代码审查 */}
        <Route
          path="/code-review"
          element={
            <Layout>
              <CodeReview />
            </Layout>
          }
        />

        {/* 默认重定向 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

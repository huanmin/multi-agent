import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Dashboard } from './presentation/pages/Dashboard';
import { Welcome } from './presentation/pages/Welcome';
import { ExpertManager } from './presentation/pages/ExpertManager';
import { Chat } from './presentation/pages/Chat';
import { CodeReview } from './presentation/pages/CodeReview';
import { ConflictResolution } from './presentation/pages/ConflictResolution';
import { Settings } from './presentation/pages/Settings';
import { Layout } from './presentation/components/Layout';

// 包装组件以使用 useNavigate
function WelcomeWithNavigation() {
  const navigate = useNavigate();
  return <Welcome onComplete={() => navigate('/dashboard')} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 欢迎引导页 */}
        <Route path="/welcome" element={<WelcomeWithNavigation />} />

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

        {/* 对话列表 */}
        <Route
          path="/conversations"
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

        {/* 冲突解决 */}
        <Route
          path="/conflicts"
          element={<ConflictResolution />}
        />
        <Route
          path="/conflict/:conflictId"
          element={<ConflictResolution />}
        />

        {/* 设置 */}
        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
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

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';

// Public Layout & Pages
import { PublicLayout } from './components/public/PublicLayout';
import { HomePage } from './pages/public/HomePage';
import { WorkPage } from './pages/public/WorkPage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { AboutPage } from './pages/public/AboutPage';
import { ExperiencePage } from './pages/public/ExperiencePage';
import { SkillsServicesPage } from './pages/public/SkillsServicesPage';
import { EducationPage } from './pages/public/EducationPage';
import { ResumePage } from './pages/public/ResumePage';
import { ContactPage } from './pages/public/ContactPage';
import { CustomPageRoute } from './pages/public/CustomPageRoute';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Admin Layout & Views
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { OverviewView } from './pages/admin/OverviewView';
import { ProjectsView } from './pages/admin/ProjectsView';
import { ProjectEditorView } from './pages/admin/ProjectEditorView';
import { CategoriesView } from './pages/admin/CategoriesView';
import { MediaLibraryView } from './pages/admin/MediaLibraryView';
import { ProfileBioView } from './pages/admin/ProfileBioView';
import { AboutPageView } from './pages/admin/AboutPageView';
import { ExperienceView } from './pages/admin/ExperienceView';
import { EducationView } from './pages/admin/EducationView';
import { SkillsServicesView } from './pages/admin/SkillsServicesView';
import { TestimonialsView } from './pages/admin/TestimonialsView';
import { ResumeView } from './pages/admin/ResumeView';
import { ContactMessagesView } from './pages/admin/ContactMessagesView';
import { NavigationMenuView } from './pages/admin/NavigationMenuView';
import { CustomPagesView } from './pages/admin/CustomPagesView';
import { AppearanceView } from './pages/admin/AppearanceView';
import { SEOSettingsView } from './pages/admin/SEOSettingsView';
import { AccountSecurityView } from './pages/admin/AccountSecurityView';

// Protected Route Guard
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdminAuthenticated, isLoading } = usePortfolio();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070809] text-xs font-mono-meta text-zinc-400">
        Verifying administrative session...
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Scroll to top helper on navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default function App() {
  return (
    <PortfolioProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/projects/:slug" element={<ProjectDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/services" element={<SkillsServicesPage />} />
            <Route path="/skills" element={<SkillsServicesPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/pages/:slug" element={<CustomPageRoute />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Console */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<OverviewView />} />
            <Route path="projects" element={<ProjectsView />} />
            <Route path="projects/new" element={<ProjectEditorView />} />
            <Route path="projects/:id/edit" element={<ProjectEditorView />} />
            <Route path="categories" element={<CategoriesView />} />
            <Route path="media" element={<MediaLibraryView />} />
            <Route path="profile" element={<ProfileBioView />} />
            <Route path="about" element={<AboutPageView />} />
            <Route path="experience" element={<ExperienceView />} />
            <Route path="education" element={<EducationView />} />
            <Route path="skills" element={<SkillsServicesView />} />
            <Route path="services" element={<SkillsServicesView />} />
            <Route path="testimonials" element={<TestimonialsView />} />
            <Route path="resume" element={<ResumeView />} />
            <Route path="contact" element={<ContactMessagesView />} />
            <Route path="navigation" element={<NavigationMenuView />} />
            <Route path="pages" element={<CustomPagesView />} />
            <Route path="appearance" element={<AppearanceView />} />
            <Route path="seo" element={<SEOSettingsView />} />
            <Route path="security" element={<AccountSecurityView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PortfolioProvider>
  );
}

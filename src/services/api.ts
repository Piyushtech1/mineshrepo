import {
  Project,
  ProjectCategory,
  MediaAsset,
  Profile,
  AboutPageData,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ServiceItem,
  TestimonialItem,
  ContactMessage,
  ResumeData,
  CustomPage,
  SiteSettings,
  NavigationItem,
  SocialLink,
  AdminUser,
} from '../server/db/schema';

const API_BASE = '/api';

export interface ProjectDetailResponse {
  project: Project;
  prevProject: { id: string; title: string; slug: string; coverImage: string } | null;
  nextProject: { id: string; title: string; slug: string; coverImage: string } | null;
  related: Array<{ id: string; title: string; slug: string; categoryName: string; coverImage: string; year: string }>;
}

export interface OverviewStatsResponse {
  stats: {
    totalProjects: number;
    publishedProjects: number;
    draftProjects: number;
    totalMedia: number;
    mediaStorageBytes: number;
    totalMessages: number;
    unreadMessages: number;
    servicesCount: number;
    skillsCount: number;
    customPagesCount: number;
  };
  recentProjects: Project[];
  recentMessages: ContactMessage[];
}

export interface SettingsResponse {
  settings: SiteSettings;
  navigation: NavigationItem[];
  socialLinks: SocialLink[];
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Public
  getSettings: () => request<SettingsResponse>('/settings'),
  getProjects: (params: { category?: string; search?: string; tag?: string; featured?: boolean } = {}) => {
    const q = new URLSearchParams();
    if (params.category) q.set('category', params.category);
    if (params.search) q.set('search', params.search);
    if (params.tag) q.set('tag', params.tag);
    if (params.featured) q.set('featured', 'true');
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<{ projects: Project[]; total: number }>(`/projects${queryStr}`);
  },
  getProjectBySlug: (slug: string) => request<ProjectDetailResponse>(`/projects/${slug}`),
  getCategories: () => request<{ categories: Array<ProjectCategory & { projectCount: number }> }>('/categories'),
  getProfile: () => request<{ profile: Profile }>('/profile'),
  getAbout: () => request<{ about: AboutPageData }>('/about'),
  getExperience: () => request<{ experience: ExperienceItem[] }>('/experience'),
  getEducation: () => request<{ education: EducationItem[] }>('/education'),
  getSkills: () => request<{ skills: SkillItem[] }>('/skills'),
  getServices: () => request<{ services: ServiceItem[] }>('/services'),
  getTestimonials: () => request<{ testimonials: TestimonialItem[] }>('/testimonials'),
  getResume: () => request<{ resume: ResumeData }>('/resume'),
  getPage: (slug: string) => request<{ page: CustomPage }>(`/pages/${slug}`),
  submitContact: (data: { name: string; email: string; subject: string; message: string }) =>
    request<{ success: boolean; message: string; id: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; admin: AdminUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  getCurrentAdmin: () => request<{ admin: AdminUser }>('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAdminProfile: (data: { name: string; email: string }) =>
    request<{ success: boolean; admin: AdminUser }>('/auth/update-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin Dashboard
  getAdminOverview: () => request<OverviewStatsResponse>('/admin/overview'),

  // Admin Projects
  getAdminProjects: () =>
    request<{
      projects: Project[];
      total: number;
      publishedCount: number;
      draftCount: number;
      featuredCount: number;
    }>('/admin/projects'),
  createProject: (data: Partial<Project>) =>
    request<{ success: boolean; project: Project }>('/admin/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProject: (id: string, data: Partial<Project>) =>
    request<{ success: boolean; project: Project }>(`/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/projects/${id}`, {
      method: 'DELETE',
    }),
  duplicateProject: (id: string) =>
    request<{ success: boolean; project: Project }>(`/admin/projects/${id}/duplicate`, {
      method: 'POST',
    }),
  reorderProjects: (orderedIds: string[]) =>
    request<{ success: boolean }>(`/admin/projects/reorder`, {
      method: 'POST',
      body: JSON.stringify({ orderedIds }),
    }),

  // Admin Categories
  createCategory: (data: { name: string; description?: string }) =>
    request<{ success: boolean; category: ProjectCategory }>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (id: string, data: Partial<ProjectCategory>) =>
    request<{ success: boolean; category: ProjectCategory }>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/categories/${id}`, {
      method: 'DELETE',
    }),

  // Admin Media Library
  getMedia: (params: { type?: string; search?: string; sort?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.type) q.set('type', params.type);
    if (params.search) q.set('search', params.search);
    if (params.sort) q.set('sort', params.sort);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<{ media: MediaAsset[]; total: number }>(`/media${queryStr}`);
  },
  uploadMedia: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    const res = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data as { success: boolean; assets: MediaAsset[] };
  },
  checkMediaUsage: (id: string) =>
    request<{ asset: MediaAsset; usage: { isUsed: boolean; usedIn: { projects: string[]; profile: boolean; resume: boolean; customPages: string[] } } }>(
      `/media/${id}/usage`
    ),
  updateMedia: (id: string, data: { alt?: string; caption?: string; originalName?: string }) =>
    request<{ success: boolean; asset: MediaAsset }>(`/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMedia: (id: string, force = false) =>
    request<{ success: boolean; message?: string }>(`/media/${id}${force ? '?force=true' : ''}`, {
      method: 'DELETE',
    }),

  // Admin Content
  updateProfile: (data: Partial<Profile>) =>
    request<{ success: boolean; profile: Profile }>('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateAbout: (data: Partial<AboutPageData>) =>
    request<{ success: boolean; about: AboutPageData }>('/admin/about', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Admin Experience
  createExperience: (data: Partial<ExperienceItem>) =>
    request<{ success: boolean; item: ExperienceItem }>('/admin/experience', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateExperience: (id: string, data: Partial<ExperienceItem>) =>
    request<{ success: boolean; item: ExperienceItem }>(`/admin/experience/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteExperience: (id: string) =>
    request<{ success: boolean }>(`/admin/experience/${id}`, { method: 'DELETE' }),

  // Admin Education
  createEducation: (data: Partial<EducationItem>) =>
    request<{ success: boolean; item: EducationItem }>('/admin/education', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEducation: (id: string, data: Partial<EducationItem>) =>
    request<{ success: boolean; item: EducationItem }>(`/admin/education/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEducation: (id: string) =>
    request<{ success: boolean }>(`/admin/education/${id}`, { method: 'DELETE' }),

  // Admin Skills
  getAdminSkills: () => request<{ skills: SkillItem[] }>('/admin/skills'),
  createSkill: (data: Partial<SkillItem>) =>
    request<{ success: boolean; item: SkillItem }>('/admin/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSkill: (id: string, data: Partial<SkillItem>) =>
    request<{ success: boolean; item: SkillItem }>(`/admin/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSkill: (id: string) =>
    request<{ success: boolean }>(`/admin/skills/${id}`, { method: 'DELETE' }),

  // Admin Services
  getAdminServices: () => request<{ services: ServiceItem[] }>('/admin/services'),
  createService: (data: Partial<ServiceItem>) =>
    request<{ success: boolean; item: ServiceItem }>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateService: (id: string, data: Partial<ServiceItem>) =>
    request<{ success: boolean; item: ServiceItem }>(`/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteService: (id: string) =>
    request<{ success: boolean }>(`/admin/services/${id}`, { method: 'DELETE' }),

  // Admin Testimonials
  getAdminTestimonials: () => request<{ testimonials: TestimonialItem[] }>('/admin/testimonials'),
  createTestimonial: (data: Partial<TestimonialItem>) =>
    request<{ success: boolean; item: TestimonialItem }>('/admin/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTestimonial: (id: string, data: Partial<TestimonialItem>) =>
    request<{ success: boolean; item: TestimonialItem }>(`/admin/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTestimonial: (id: string) =>
    request<{ success: boolean }>(`/admin/testimonials/${id}`, { method: 'DELETE' }),

  // Admin Resume
  updateResume: (data: Partial<ResumeData>) =>
    request<{ success: boolean; resume: ResumeData }>('/admin/resume', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Admin Custom Pages
  getAdminPages: () => request<{ pages: CustomPage[] }>('/admin/pages'),
  createPage: (data: Partial<CustomPage>) =>
    request<{ success: boolean; page: CustomPage }>('/admin/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePage: (id: string, data: Partial<CustomPage>) =>
    request<{ success: boolean; page: CustomPage }>(`/admin/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePage: (id: string) =>
    request<{ success: boolean }>(`/admin/pages/${id}`, { method: 'DELETE' }),

  // Admin Contact Messages
  getAdminContactMessages: (status?: 'unread' | 'archived' | 'inbox' | 'all') =>
    request<{ messages: ContactMessage[]; total: number; unreadCount: number }>(
      `/admin/contact${status ? `?status=${status}` : ''}`
    ),
  markMessageRead: (id: string, read: boolean) =>
    request<{ success: boolean }>(`/admin/contact/${id}/read`, {
      method: 'PUT',
      body: JSON.stringify({ read }),
    }),
  archiveMessage: (id: string, archived: boolean) =>
    request<{ success: boolean }>(`/admin/contact/${id}/archive`, {
      method: 'PUT',
      body: JSON.stringify({ archived }),
    }),
  deleteMessage: (id: string) =>
    request<{ success: boolean }>(`/admin/contact/${id}`, { method: 'DELETE' }),

  // Admin Settings & Appearance
  getAdminSettings: () =>
    request<{ settings: SiteSettings; navigation: NavigationItem[]; socialLinks: SocialLink[] }>(
      '/admin/settings'
    ),
  updateSettings: (data: Partial<SiteSettings>) =>
    request<{ success: boolean; settings: SiteSettings }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateNavigation: (items: NavigationItem[]) =>
    request<{ success: boolean; navigation: NavigationItem[] }>('/admin/navigation', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    }),
  updateSocialLinks: (links: SocialLink[]) =>
    request<{ success: boolean; socialLinks: SocialLink[] }>('/admin/social', {
      method: 'PUT',
      body: JSON.stringify({ links }),
    }),
};

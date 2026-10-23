/**
 * Database schema and interface definitions
 */

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  lastLoginAt?: string;
}

export type ContentBlockType =
  | 'text'
  | 'heading'
  | 'image'
  | 'video'
  | 'gallery'
  | 'quote'
  | 'spacing';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  title?: string;
  content?: string;
  url?: string;
  caption?: string;
  images?: Array<{ url: string; caption?: string; alt?: string }>;
  layout?: 'full' | 'wide' | 'split' | 'grid-2' | 'grid-3';
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  client?: string;
  year: string;
  categorySlug: string;
  categoryName: string;
  tags: string[];
  coverImage: string;
  featured: boolean;
  published: boolean;
  order: number;
  summary: string;
  objectives?: string;
  concept?: string;
  process?: string;
  challengesSolutions?: string;
  results?: string;
  blocks: ContentBlock[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
}

export interface MediaAsset {
  id: string;
  name: string;
  originalName: string;
  url: string;
  type: 'image' | 'video' | 'document';
  mimeType: string;
  size: number;
  dimensions?: { width: number; height: number };
  alt: string;
  caption?: string;
  storage: 'r2' | 'local';
  key: string;
  createdAt: string;
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  tagline: string;
  avatarUrl: string;
  heroImage: string;
  location: string;
  email: string;
  phone?: string;
  availableForWork: boolean;
  availabilityNotice: string;
  yearsOfExperience: string;
}

export interface AboutPageData {
  heading: string;
  subheading: string;
  bioParagraphs: string[];
  creativePhilosophy: string;
  personalStory: string;
  specializations: string[];
  achievements: Array<{
    id: string;
    year: string;
    title: string;
    organization: string;
  }>;
  profilePhoto: string;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  employmentType: 'Full-time' | 'Contract' | 'Freelance' | 'Lead' | 'Director';
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  responsibilities: string[];
  achievements: string[];
  order: number;
}

export interface EducationItem {
  id: string;
  institution: string;
  qualification: string;
  course: string;
  startDate: string;
  endDate: string;
  description: string;
  certificateUrl?: string;
  order: number;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Software' | 'Discipline' | 'Methodology';
  proficiency: number; // 0 to 100
  highlighted: boolean;
  order: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  deliverables: string[];
  order: number;
  active: boolean;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  clientRole: string;
  company: string;
  quote: string;
  projectTitle?: string;
  avatarUrl?: string;
  order: number;
  active: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  archived: boolean;
  createdAt: string;
}

export interface ResumeData {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  version: string;
  updatedAt: string;
  isVisible: boolean;
  downloadButtonText: string;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
  visible: boolean;
  inNavigation: boolean;
  blocks: ContentBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteTagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string; // e.g. #0D0D0D
  accentColor: string; // e.g. #FF4800 or #E85B24
  themeMode: 'dark' | 'light' | 'system';
  fontHeading: string;
  fontBody: string;
  gridColumns: number; // 2, 3, or 4
  heroLayout: 'editorial' | 'split' | 'centered' | 'minimal';
  featuredProjectsCount: number;
  showResumePage: boolean;
  showEducationPage: boolean;
  showExperiencePage: boolean;
  showServicesPage: boolean;
  footerText: string;
  copyrightNotice: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  visible: boolean;
  order: number;
  isCustom?: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  visible: boolean;
}

export interface DatabaseState {
  admin: AdminUser;
  projects: Project[];
  categories: ProjectCategory[];
  media: MediaAsset[];
  profile: Profile;
  about: AboutPageData;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  contactMessages: ContactMessage[];
  resume: ResumeData;
  customPages: CustomPage[];
  settings: SiteSettings;
  navigation: NavigationItem[];
  socialLinks: SocialLink[];
}

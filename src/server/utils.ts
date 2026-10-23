/**
 * Server utility and pure business logic functions
 */

export function generateSlug(text: string): string {
  return text
    .normalize('NFD') // Normalize accented characters (é -> e + accent)
    .replace(/[\u0300-\u036f]/g, '') // Strip diacritic marks
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function sanitizeFilename(filename: string): string {
  const extIndex = filename.lastIndexOf('.');
  const ext = extIndex !== -1 ? filename.slice(extIndex) : '';
  const name = extIndex !== -1 ? filename.slice(0, extIndex) : filename;
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${cleanName || 'asset'}-${Date.now().toString(36)}${ext.toLowerCase()}`;
}

export interface MediaUsageCheckResult {
  isUsed: boolean;
  usedIn: {
    projects: string[];
    profile: boolean;
    resume: boolean;
    customPages: string[];
  };
}

export function checkMediaUsage(
  assetId: string,
  assetUrl: string,
  data: {
    projects?: Array<{ id: string; title: string; coverImage?: string; blocks?: Array<{ type: string; url?: string; images?: string[] }> }>;
    profile?: { avatarUrl?: string };
    resume?: { fileUrl?: string };
    customPages?: Array<{ id: string; title: string; featuredImage?: string; blocks?: Array<{ type: string; url?: string }> }>;
  }
): MediaUsageCheckResult {
  const result: MediaUsageCheckResult = {
    isUsed: false,
    usedIn: {
      projects: [],
      profile: false,
      resume: false,
      customPages: [],
    },
  };

  const matches = (urlOrId?: string) => {
    if (!urlOrId) return false;
    return urlOrId === assetId || urlOrId === assetUrl || urlOrId.includes(assetId);
  };

  if (data.projects) {
    for (const proj of data.projects) {
      let foundInProj = matches(proj.coverImage);
      if (!foundInProj && proj.blocks) {
        for (const block of proj.blocks) {
          if (matches(block.url)) {
            foundInProj = true;
            break;
          }
          if (block.images && block.images.some(img => matches(img))) {
            foundInProj = true;
            break;
          }
        }
      }
      if (foundInProj) {
        result.usedIn.projects.push(proj.title);
      }
    }
  }

  if (data.profile && matches(data.profile.avatarUrl)) {
    result.usedIn.profile = true;
  }

  if (data.resume && matches(data.resume.fileUrl)) {
    result.usedIn.resume = true;
  }

  if (data.customPages) {
    for (const page of data.customPages) {
      let foundInPage = matches(page.featuredImage);
      if (!foundInPage && page.blocks) {
        for (const block of page.blocks) {
          if (matches(block.url)) {
            foundInPage = true;
            break;
          }
        }
      }
      if (foundInPage) {
        result.usedIn.customPages.push(page.title);
      }
    }
  }

  result.isUsed =
    result.usedIn.projects.length > 0 ||
    result.usedIn.profile ||
    result.usedIn.resume ||
    result.usedIn.customPages.length > 0;

  return result;
}

export function filterAndSortProjects<T extends { published: boolean; featured?: boolean; order?: number; categorySlug?: string; tags?: string[]; title: string; createdAt: string }>(
  projects: T[],
  filters: {
    category?: string;
    search?: string;
    publishedOnly?: boolean;
    tag?: string;
    featuredOnly?: boolean;
    sort?: 'order' | 'newest' | 'oldest' | 'title';
  }
): T[] {
  let filtered = [...projects];

  if (filters.publishedOnly) {
    filtered = filtered.filter(p => p.published);
  }

  if (filters.featuredOnly) {
    filtered = filtered.filter(p => p.featured);
  }

  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(p => p.categorySlug === filters.category);
  }

  if (filters.tag) {
    filtered = filtered.filter(p => p.tags && p.tags.includes(filters.tag!));
  }

  if (filters.search) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter(
      p =>
        p.title.toLowerCase().includes(term) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(term)))
    );
  }

  const sort = filters.sort || 'order';
  filtered.sort((a, b) => {
    if (sort === 'order') {
      return (a.order ?? 999) - (b.order ?? 999);
    }
    if (sort === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sort === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sort === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return filtered;
}

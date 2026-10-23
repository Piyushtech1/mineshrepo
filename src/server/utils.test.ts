import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSlug, sanitizeFilename, checkMediaUsage, filterAndSortProjects } from './utils';

test('generateSlug generates clean URL slugs', () => {
  assert.equal(generateSlug('Brand Identity & Guidelines 2026!'), 'brand-identity-guidelines-2026');
  assert.equal(generateSlug('   3D Visual Art / Poster Series   '), '3d-visual-art-poster-series');
  assert.equal(generateSlug('Élégant Typographie'), 'elegant-typographie');
});

test('sanitizeFilename removes dangerous characters and preserves extension', () => {
  const sanitized = sanitizeFilename('My Poster Design #1 (Final).PNG');
  assert.match(sanitized, /^my-poster-design-1-final-[a-z0-9]+\.png$/);
});

test('checkMediaUsage identifies media usage across projects, profile and custom pages', () => {
  const assetId = 'asset-123';
  const assetUrl = '/uploads/asset-123.jpg';

  const mockData = {
    projects: [
      {
        id: 'p1',
        title: 'Lumina Brand System',
        coverImage: assetUrl,
        blocks: [],
      },
      {
        id: 'p2',
        title: 'Verve Beverage Packaging',
        coverImage: '/uploads/other.jpg',
        blocks: [{ type: 'image', url: '/uploads/other2.jpg' }],
      },
    ],
    profile: {
      avatarUrl: '/uploads/avatar.jpg',
    },
    resume: {
      fileUrl: '/uploads/resume.pdf',
    },
    customPages: [],
  };

  const usageResult = checkMediaUsage(assetId, assetUrl, mockData);
  assert.equal(usageResult.isUsed, true);
  assert.deepEqual(usageResult.usedIn.projects, ['Lumina Brand System']);
  assert.equal(usageResult.usedIn.profile, false);

  const unusedResult = checkMediaUsage('unused-999', '/uploads/unused.jpg', mockData);
  assert.equal(unusedResult.isUsed, false);
  assert.equal(unusedResult.usedIn.projects.length, 0);
});

test('filterAndSortProjects applies category, search, and sorting accurately', () => {
  const projects = [
    {
      id: '1',
      title: 'Neon Horizon',
      published: true,
      featured: true,
      order: 2,
      categorySlug: '3d-art',
      tags: ['3D', 'Cinema4D'],
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Aura Brand Identity',
      published: true,
      featured: false,
      order: 1,
      categorySlug: 'branding',
      tags: ['Branding', 'Minimal'],
      createdAt: '2026-02-01T00:00:00Z',
    },
    {
      id: '3',
      title: 'Secret Draft Case Study',
      published: false,
      featured: false,
      order: 3,
      categorySlug: 'branding',
      tags: ['Draft'],
      createdAt: '2026-03-01T00:00:00Z',
    },
  ];

  // Test published only
  const publishedOnly = filterAndSortProjects(projects, { publishedOnly: true });
  assert.equal(publishedOnly.length, 2);

  // Test order sort
  assert.equal(publishedOnly[0].title, 'Aura Brand Identity');
  assert.equal(publishedOnly[1].title, 'Neon Horizon');

  // Test category filter
  const brandingOnly = filterAndSortProjects(projects, { category: 'branding', publishedOnly: true });
  assert.equal(brandingOnly.length, 1);
  assert.equal(brandingOnly[0].title, 'Aura Brand Identity');

  // Test search
  const searchResult = filterAndSortProjects(projects, { search: 'cinema', publishedOnly: true });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].title, 'Neon Horizon');
});

import { expect, test, vi, afterEach, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import App from './App.svelte';
import { user } from './stores/user';

// Provide enough dummy articles to avoid index errors in App.svelte
const dummyArticles = [
  { _id: '1', headline: { main: 'A' }, abstract: '', multimedia: { default: { url: '' } }, commentCount: 0 },
  { _id: '2', headline: { main: 'B' }, abstract: '', multimedia: { default: { url: '' } }, commentCount: 0 },
  { _id: '3', headline: { main: 'C' }, abstract: '', multimedia: { default: { url: '' } }, commentCount: 0 },
  { _id: '4', headline: { main: 'D' }, abstract: '', multimedia: { default: { url: '' } }, commentCount: 0 },
  { _id: '5', headline: { main: 'E' }, abstract: '', multimedia: { default: { url: '' } }, commentCount: 0 },
  { _id: '6', headline: { main: 'F' }, abstract: '', multimedia: { default: { url: '' } }, commentCount: 0 }
];

function mockArticlesResponse() {
    return {
        response: {
            docs: [
                {
                    headline: { main: 'Test Article 1' },
                    abstract: 'Test abstract 1',
                    multimedia: {
                        default: {
                            url: 'http://test1.com/image.jpg'
                        }
                    }
                },
                {
                    headline: { main: 'Test Article 2' },
                    abstract: 'Test abstract 2',
                    multimedia: {
                        default: {
                            url: 'http://test2.com/image.jpg'
                        }
                    }
                },
                {
                    headline: { main: 'Test Article 3' },
                    abstract: 'Test abstract 3',
                    multimedia: {
                        default: {
                            url: 'http://test3.com/image.jpg'
                        }
                    }
                },
                {
                    headline: { main: 'Test Article 4' },
                    abstract: 'Test abstract 4',
                    multimedia: {
                        default: {
                            url: 'http://test4.com/image.jpg'
                        }
                    }
                },
                {
                    headline: { main: 'Test Article 5' },
                    abstract: 'Test abstract 5',
                    multimedia: {
                        default: {
                            url: 'http://test5.com/image.jpg'
                        }
                    }
                },
                {
                    headline: { main: 'Test Article 6' },
                    abstract: 'Test abstract 6',
                    multimedia: {
                        default: {
                            url: 'http://test6.com/image.jpg'
                        }
                    }
                }
            ]
        }
    };
}

const dummyComments: any[] = [];

beforeEach(() => {
  vi.spyOn(global, 'fetch').mockImplementation((url) => {
    if (typeof url === 'string' && url.includes('/getArticles')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ response: { docs: dummyArticles } })
      } as Response);
    }
    if (typeof url === 'string' && url.includes('/fetchComments')) {
      return Promise.resolve({
        ok: true,
        json: async () => dummyComments
      } as Response);
    }
    return Promise.resolve({ ok: true, json: async () => ({}) } as Response);
  });
});

afterEach(() => {
  vi.clearAllMocks();
  user.set(null);
});

test('shows comment input when user is logged in', async () => {
  user.set({ email: 'test@example.com', type: 'user' });
  render(App);
  // Open the sidebar for the first article
  const commentButtons = await screen.findAllByRole('button');
  commentButtons[0].click();
  // Now the comment input should show up
  expect(await screen.findByPlaceholderText('Write your comment here...')).toBeTruthy();
});

test('does not show comment input when user is logged out', async () => {
  user.set(null);
  render(App);
  // Open the sidebar for the first article
  const commentButtons = await screen.findAllByRole('button');
  commentButtons[0].click();
  // The comment input should NOT show up
  expect(screen.queryByPlaceholderText('Write your comment here...')).toBeNull();
});

test('Should display articles when API call succeeds', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockArticlesResponse()
    } as Response);

    render(App);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const article1 = screen.getByText('Test Article 1');
    const article2 = screen.getByText('Test Article 2');
    expect(article1).toBeTruthy();
    expect(article2).toBeTruthy();
});

test('renders comment text in sidebar when present', async () => {
  (global.fetch as any).mockImplementation((url: string) => {
    if (url.includes('/getArticles')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ response: { docs: dummyArticles } })
      } as Response);
    }
    if (url.includes('/fetchComments')) {
      return Promise.resolve({
        ok: true,
        json: async () => [{
          commentId: 2,
          articleID: '1',
          user: 'someone@example.com',
          text: 'A visible comment',
          datePosted: '01/01/2024, 12:00',
          deleted: false,
          parentId: null
        }]
      } as Response);
    }
    return Promise.resolve({ ok: true, json: async () => ({}) } as Response);
  });
  user.set({ email: 'test@example.com', type: 'user' });
  render(App);
  // Open the sidebar for the first article
  const commentButtons = await screen.findAllByRole('button');
  commentButtons[0].click();
  // The comment text should show up
  expect(await screen.findByText('A visible comment')).toBeTruthy();
});


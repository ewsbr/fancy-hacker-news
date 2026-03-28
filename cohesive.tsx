import React, { useEffect, useState } from 'react';
import { getTopStories, getItem, HNItem } from './api';
import { timeAgo, getDomain } from './utils';
import { MessageSquare, ChevronUp, Moon, Sun } from 'lucide-react';

const PAGE_SIZE = 30;

function StoryItem({ id, index }: { id: number; index: number }) {
  const [story, setStory] = useState<HNItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getItem(id).then(data => {
      if (isMounted) {
        setStory(data);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-start gap-2 py-2 animate-pulse">
        <div className="w-6 sm:w-8 text-right text-zinc-400 dark:text-zinc-600 font-mono text-sm pt-1">{index}.</div>
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!story || story.deleted || story.dead) return null;

  const domain = getDomain(story.url);

  return (
    <div className="flex items-start gap-2 sm:gap-3 py-2 sm:py-2.5 group">
      <div className="w-6 sm:w-8 text-right text-zinc-500 dark:text-zinc-500 font-mono text-sm sm:text-base pt-0.5 shrink-0">
        {index}.
      </div>
      <div className="flex flex-col min-w-0">
        <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
          <a 
            href={story.url || `https://news.ycombinator.com/item?id=${story.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base sm:text-[17px] font-medium text-zinc-900 dark:text-zinc-100 hover:text-hn-orange dark:hover:text-hn-orange transition-colors leading-snug"
          >
            {story.title}
          </a>
          {domain && (
            <a 
              href={`https://news.ycombinator.com/from?site=${domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 hover:underline truncate max-w-[200px] sm:max-w-xs"
            >
              ({domain})
            </a>
          )}
        </div>
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-hn-orange" />
            <span className="font-medium">{story.score || 0}</span>
          </span>
          <span className="hidden sm:inline">&middot;</span>
          <a 
            href={`https://news.ycombinator.com/user?id=${story.by}`}
            className="hover:underline font-medium"
          >
            {story.by}
          </a>
          <span className="hidden sm:inline">&middot;</span>
          <a 
            href={`https://news.ycombinator.com/item?id=${story.id}`}
            className="hover:underline"
          >
            {timeAgo(story.time)} ago
          </a>
          <span className="hidden sm:inline">&middot;</span>
          <a 
            href={`https://news.ycombinator.com/item?id=${story.id}`}
            className="flex items-center gap-1 hover:underline"
          >
            <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{story.descendants || 0}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [storyIds, setStoryIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    getTopStories().then(ids => {
      setStoryIds(ids);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const visibleIds = storyIds.slice(0, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 transition-colors duration-200">
      <div className="max-w-5xl mx-auto sm:p-4">
        <div className="bg-white dark:bg-zinc-900 sm:rounded-xl shadow-sm overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
          
          {/* Header */}
          <header className="bg-hn-orange text-black px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 border-2 border-black flex items-center justify-center font-bold text-lg leading-none bg-transparent">
                  Y
                </div>
                <span className="font-bold text-lg hidden sm:inline tracking-tight">Hacker News</span>
                <span className="font-bold text-lg sm:hidden tracking-tight">HN</span>
              </a>
              <nav className="hidden md:flex items-center gap-3 text-sm font-medium">
                <a href="#" className="hover:text-white transition-colors">new</a>
                <span>|</span>
                <a href="#" className="hover:text-white transition-colors">past</a>
                <span>|</span>
                <a href="#" className="hover:text-white transition-colors">comments</a>
                <span>|</span>
                <a href="#" className="hover:text-white transition-colors">ask</a>
                <span>|</span>
                <a href="#" className="hover:text-white transition-colors">show</a>
                <span>|</span>
                <a href="#" className="hover:text-white transition-colors">jobs</a>
                <span>|</span>
                <a href="#" className="hover:text-white transition-colors">submit</a>
              </nav>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 hover:bg-black/10 rounded-md transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </header>

          {/* Content */}
          <main className="p-4 sm:p-6 bg-[#f6f6ef] dark:bg-[#121212] transition-colors duration-200">
            {loading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 animate-pulse">
                    <div className="w-8 text-right text-zinc-400 font-mono">{i + 1}.</div>
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                {visibleIds.map((id, index) => (
                  <StoryItem key={id} id={id} index={index + 1} />
                ))}
              </div>
            )}

            {!loading && visibleIds.length < storyIds.length && (
              <div className="mt-8 ml-8 sm:ml-11">
                <button 
                  onClick={() => setPage(p => p + 1)}
                  className="text-[15px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-hn-orange dark:hover:text-hn-orange transition-colors"
                >
                  More
                </button>
              </div>
            )}
          </main>
          
          {/* Footer */}
          <footer className="bg-[#f6f6ef] dark:bg-[#121212] border-t border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center gap-4 transition-colors duration-200">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Guidelines</a>
              <span>|</span>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">FAQ</a>
              <span>|</span>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Lists</a>
              <span>|</span>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">API</a>
              <span>|</span>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Security</a>
              <span>|</span>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Legal</a>
              <span>|</span>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Apply to YC</a>
              <span>|</span>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Contact</a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

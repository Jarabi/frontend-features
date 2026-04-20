import { useState } from 'react';
import './LandingPage.css';

const features = [
    {
        id: 1,
        title: 'Infinite Scrolling',
        description:
            'Production-grade infinite scroll with IntersectionObserver, lazy loading, API pagination, loading states, and request cancellation.',
        icon: '📜',
        color: '#3b82f6',
        path: '../1-infinite-scroll',
        tags: ['Performance', 'Pagination', 'Lazy Loading'],
        difficulty: 'Intermediate',
    },
    {
        id: 2,
        title: 'Debounced Search',
        description:
            'Smart search with 300ms debounce, request cancellation, result caching, text highlighting, and keyboard shortcuts.',
        icon: '🔍',
        color: '#3b82f6',
        path: '../2-debounced-search',
        tags: ['Performance', 'Caching', 'UX'],
        difficulty: 'Intermediate',
    },
    {
        id: 3,
        title: 'Loading Skeletons',
        description:
            'Beautiful skeleton screens with shimmer animations, multiple layout patterns (grid, list, profile), and reduced motion support.',
        icon: '💀',
        color: '#10b981',
        path: '../3-search-scroll-skeletons',
        tags: ['UX', 'Animations', 'Accessibility'],
        difficulty: 'Beginner',
    },
    {
        id: 4,
        title: 'Toast Notifications',
        description:
            'Fully-featured toast system with multiple types (success/error/warning/info), stacking, auto-close, progress bars, and 6 positions.',
        icon: '🍞',
        color: '#10b981',
        path: '../4-toast-notifications',
        tags: ['UX', 'Accessibility', 'Animations'],
        difficulty: 'Beginner',
    },
    {
        id: 5,
        title: 'Modal Dialog System',
        description:
            'Accessible modal dialogs with focus trap, ESC to close, scroll lock, backdrop click, smooth animations, and stacking support.',
        icon: '🎭',
        color: '#ef4444',
        path: '../5-modal-dialog-system',
        tags: ['Accessibility', 'Focus Management', 'Animations'],
        difficulty: 'Advanced',
    },
    {
        id: 6,
        title: 'Drag and Drop',
        description:
            'Sortable drag and drop with touch/mobile support, keyboard accessibility, smooth animations, auto-save, and backend sync.',
        icon: '🔄',
        color: '#ef4444',
        path: '../6-drag-and-drop-system',
        tags: ['Accessibility', 'Mobile', 'Animations'],
        difficulty: 'Advanced',
    },
];

const stats = [
    { label: 'Features', value: '6', icon: '✨' },
    { label: 'Lines of Code', value: '5k+', icon: '📝' },
    { label: 'Best Practices', value: '100%', icon: '🎯' },
];

function LandingPage() {
    const [hoveredFeature, setHoveredFeature] = useState(null);
    const [selectedTag, setSelectedTag] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Get unique tags
    const allTags = ['All', ...new Set(features.flatMap((f) => f.tags))];

    // Filter features based on search and tags
    const filteredFeatures = features.filter((feature) => {
        const matchesSearch =
            feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            feature.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        const matchesTag =
            selectedTag === 'All' || feature.tags.includes(selectedTag);
        return matchesSearch && matchesTag;
    });

    return (
        <div className='landing-page'>
            {/* Hero Section */}
            <section className='hero'>
                <div className='hero-content'>
                    <div className='hero-badge'>
                        <span className='badge-icon'>🚀</span>
                        <span>Production-Grade Features</span>
                    </div>
                    <h1 className='hero-title'>
                        Frontend Features
                        <span className='hero-highlight'> Showcase</span>
                    </h1>
                    <p className='hero-description'>
                        A comprehensive collection of production-ready frontend
                        features built with React, Vite, and modern best
                        practices. Each feature is fully documented, accessible,
                        and performance-optimized.
                    </p>
                    <div className='hero-stats'>
                        {stats.map((stat, index) => (
                            <div key={index} className='stat-item'>
                                <span className='stat-icon'>{stat.icon}</span>
                                <div>
                                    <div className='stat-value'>
                                        {stat.value}
                                    </div>
                                    <div className='stat-label'>
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='hero-actions'>
                        <button
                            className='btn-primary'
                            onClick={() =>
                                document
                                    .getElementById('features')
                                    ?.scrollIntoView({ behavior: 'smooth' })
                            }
                        >
                            Explore Features
                            <span className='btn-icon'>↓</span>
                        </button>
                        <button
                            className='btn-secondary'
                            onClick={() =>
                                window.open(
                                    'https://github.com/Jarabi/frontend-features',
                                    '_blank',
                                    'noopener,noreferrer',
                                )
                            }
                        >
                            Github Repository
                            <span className='btn-icon'>→</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id='features' className='features-section'>
                <div className='container'>
                    <div className='section-header'>
                        <h2 className='section-title'>Explore the Features</h2>
                        <p className='section-subtitle'>
                            Each feature is production-ready, fully tested, and
                            follows best practices
                        </p>
                    </div>

                    {/* Search and filter bar */}
                    <div className='features-controls'>
                        <div className='search-wrapper'>
                            <span className='search-icon'>🔍</span>
                            <input
                                type='text'
                                className='search-input'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder='Search features...'
                            />
                            {searchQuery && (
                                <button
                                    className='clear-search'
                                    aria-label='Clear search'
                                    onClick={() => setSearchQuery('')}
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div className='tag-filters'>
                            {allTags.map((tag) => (
                                <button
                                    key={tag}
                                    className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
                                    aria-pressed={selectedTag === tag}
                                    onClick={() => setSelectedTag(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feature Grid */}
                    <div className='features-grid'>
                        {filteredFeatures.map((feature, index) => (
                            <div
                                key={feature.id}
                                className={`feature-card ${hoveredFeature === feature.id ? 'hovered' : ''}`}
                                onMouseEnter={() =>
                                    setHoveredFeature(feature.id)
                                }
                                onMouseLeave={() => setHoveredFeature(null)}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div
                                    className='card-icon'
                                    style={{
                                        background: `${feature.color}20`,
                                        color: feature.color,
                                    }}
                                >
                                    {feature.icon}
                                </div>
                                <h3 className='card-title'>{feature.title}</h3>
                                <p className='card-description'>
                                    {feature.description}
                                </p>
                                <div className='card-tags'>
                                    {feature.tags.map((tag) => (
                                        <span key={tag} className='card-tag'>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className='card-footer'>
                                    <span
                                        className='difficulty-badge'
                                        style={{ color: feature.color }}
                                    >
                                        {feature.difficulty}
                                    </span>
                                    <a
                                        href={feature.path}
                                        className='demo-link'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                    >
                                        Live Demo
                                        <span className='link-arrow'>→</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredFeatures.length === 0 && (
                        <div className='no-results'>
                            <p>No features found matching your criteria.</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedTag('All');
                                }}
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className='tech-stack'>
                <div className='container'>
                    <h2 className='section-title'>Built with Modern Tech</h2>
                    <div className='tech-grid'>
                        <div className='tech-item'>⚛️ React 19</div>
                        <div className='tech-item'>⚡ Vite</div>
                        <div className='tech-item'>🎨 CSS3 Animations</div>
                        <div className='tech-item'>♿ Accessibility First</div>
                        <div className='tech-item'>📱 Mobile Responsive</div>
                        <div className='tech-item'>
                            🚀 Performance Optimized
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className='footer'>
                <div className='container'>
                    <p>
                        Built with ❤️ for production-grade frontend development
                    </p>
                    <div className='footer-links'>
                        <a
                            href='https://github.com/Jarabi/frontend-features#readme'
                            target='_blank'
                        >
                            Documentation
                        </a>
                        <a
                            href='https://github.com/Jarabi/frontend-features'
                            target='_blank'
                        >
                            GitHub
                        </a>
                        <a
                            href='https://github.com/Jarabi/frontend-features/issues'
                            target='_blank'
                        >
                            Issues
                        </a>
                        <a
                            href='https://github.com/Jarabi/frontend-features/blob/main/LICENSE.md'
                            target='_blank'
                        >
                            License
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;

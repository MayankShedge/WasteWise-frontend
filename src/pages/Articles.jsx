import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';
import { Link } from 'react-router-dom';

// Icons
const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const ExternalLink = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const ArticlesPage = () => {
    // ====================================
    // ORIGINAL LOGIC - NO CHANGES
    // ====================================
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const { data } = await api.get('/api/articles');
                setArticles(data);
            } catch (error) {
                console.error("Failed to fetch articles", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    // ====================================
    // CAROUSEL FUNCTIONALITY - NEW
    // ====================================
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);

    // Auto-play
    useEffect(() => {
        if (!autoPlay || articles.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % articles.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [autoPlay, articles.length]);

    // Navigation
    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % articles.length);
        setAutoPlay(false);
    }, [articles.length]);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
        setAutoPlay(false);
    }, [articles.length]);

    const goToSlide = (index) => {
        setCurrentIndex(index);
        setAutoPlay(false);
    };

    // Touch handlers
    const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
    const handleTouchMove = (e) => setTouchEnd(e.touches[0].clientX);
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const minSwipeDistance = 50;
        if (distance > minSwipeDistance) goToNext();
        else if (distance < -minSwipeDistance) goToPrev();
        setTouchStart(0);
        setTouchEnd(0);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'ArrowRight') goToNext();
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [goToNext, goToPrev]);

    // ====================================
    // ORIGINAL LOADING - NO CHANGES
    // ====================================
    if (loading) return <p className="text-center p-8">Loading articles...</p>;

    // ====================================
    // ORIGINAL EMPTY STATE - NO CHANGES
    // ====================================
    if (articles.length === 0) {
        return (
            <div className="container mx-auto py-8 px-4 sm:px-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-800">Tips & Articles</h1>
                <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
                    <p>No articles have been posted yet. Check back soon!</p>
                </div>
            </div>
        );
    }

    const currentArticle = articles[currentIndex];

    // ====================================
    // CAROUSEL UI - NEW
    // ====================================
    return (
        <div className="container mx-auto py-8 px-4 sm:px-6">
            {/* Header */}
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2 text-gray-800">Tips & Articles</h1>
            <p className="text-center text-gray-600 mb-8">
                Article {currentIndex + 1} of {articles.length}
            </p>

            {/* Main Carousel */}
            <div className="relative max-w-4xl mx-auto">
                <div
                    className="relative overflow-hidden rounded-2xl shadow-2xl bg-white"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Image Section */}
                    <div className="relative h-64 sm:h-96 overflow-hidden">
                        <img
                            src={currentArticle.imageUrl}
                            alt={currentArticle.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        
                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                            <h2 className="text-2xl sm:text-4xl font-bold mb-2">
                                {currentArticle.title}
                            </h2>
                            <p className="text-sm sm:text-base text-gray-200 mb-4">
                                By {currentArticle.author.name}
                            </p>
                            
                            {/* ORIGINAL Link - NO CHANGES */}
                            <Link
                                to={`/articles/${currentArticle._id}`}
                                className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg"
                            >
                                Read Full Article
                                <ExternalLink />
                            </Link>
                        </div>
                    </div>

                    {/* Auto-play Indicator */}
                    {autoPlay && (
                        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                            Auto-playing ▶
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <button
                    onClick={goToPrev}
                    className="absolute left-2 sm:-left-16 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transition-all z-10"
                >
                    <ChevronLeft />
                </button>

                <button
                    onClick={goToNext}
                    className="absolute right-2 sm:-right-16 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transition-all z-10"
                >
                    <ChevronRight />
                </button>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center items-center gap-2 mt-8">
                {articles.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-300 rounded-full ${
                            index === currentIndex
                                ? 'w-8 h-3 bg-green-600'
                                : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                        }`}
                    />
                ))}
            </div>

            {/* Auto-play Toggle */}
            <div className="text-center mt-6">
                <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                    {autoPlay ? '⏸ Pause Auto-play' : '▶ Resume Auto-play'}
                </button>
            </div>

            {/* Thumbnails */}
            <div className="mt-12 max-w-6xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">All Articles</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {articles.map((article, index) => (
                        <button
                            key={article._id}
                            onClick={() => goToSlide(index)}
                            className={`relative rounded-lg overflow-hidden transition-all transform hover:scale-105 ${
                                index === currentIndex
                                    ? 'ring-4 ring-green-600 shadow-lg'
                                    : 'opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-24 sm:h-32 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                                <p className="text-white text-xs sm:text-sm font-semibold truncate">
                                    {article.title}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Info */}
            <div className="text-center mt-8 text-sm text-gray-500">
                <p>💡 Swipe or use ← → arrow keys to navigate</p>
            </div>
        </div>
    );
};

export default ArticlesPage;
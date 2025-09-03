import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import { Link } from 'react-router-dom';

const ArticlesPage = () => {
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

    if (loading) return <p className="text-center p-8">Loading articles...</p>;

    return (
        // --- RESPONSIVE CHANGES APPLIED ---
        <div className="container mx-auto py-8 px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-800">Tips & Articles</h1>
            
            {articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map(article => (
                        <Link to={`/articles/${article._id}`} key={article._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                            <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover"/>
                            <div className="p-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 truncate">{article.title}</h2>
                                <p className="text-gray-600">By {article.author.name}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                 <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
                    <p>No articles have been posted yet. Check back soon!</p>
                </div>
            )}
        </div>
    );
};

export default ArticlesPage;


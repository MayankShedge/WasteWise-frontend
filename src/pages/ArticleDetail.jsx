import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios.js';

const ArticleDetailPage = () => {
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const { data } = await api.get(`/api/articles/${id}`);
                setArticle(data);
            } catch (error) {
                console.error("Failed to fetch article", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    if (loading) return <p className="text-center p-8">Loading article...</p>;
    if (!article) return <p className="text-center p-8">Article not found.</p>;

    return (
        // --- RESPONSIVE CHANGES APPLIED ---
        <div className="container mx-auto py-8 px-4 sm:px-6 max-w-4xl animate-fadeIn">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-4">{article.title}</h1>
            <p className="text-gray-500 mb-6">By {article.author.name} on {new Date(article.createdAt).toLocaleDateString()}</p>
            <img src={article.imageUrl} alt={article.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-lg mb-8"/>
            
            {/* Using Tailwind's typography plugin classes for beautiful article formatting */}
            <div className="prose lg:prose-xl max-w-none text-gray-700">
                {/* Splitting content by newlines to render paragraphs correctly */}
                {article.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </div>
        </div>
    );
};

export default ArticleDetailPage;


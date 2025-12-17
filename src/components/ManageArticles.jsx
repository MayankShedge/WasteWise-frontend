import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext';

const ManageArticles = () => {
    const [articles, setArticles] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { userInfo } = useAuth();

    const fetchArticles = useCallback(async () => {
        try {
            const { data } = await api.get('/api/articles');
            setArticles(data);
        } catch (err) {
            setError('Failed to load articles.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await api.delete(`/api/articles/${id}`, config);
                fetchArticles();
            } catch (err) {
                alert('Failed to delete article.');
            }
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please select an image for the article.');
            return;
        }
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('image', file);
        
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await api.post('/api/articles', formData, config);
            // Reset form and refetch articles
            setTitle('');
            setContent('');
            setFile(null);
            e.target.reset(); // Clear the file input
            fetchArticles();
        } catch (err) {
            alert('Failed to create article.');
        }
    };
    
    if (loading) return <p>Loading articles...</p>;

    return (
        // --- RESPONSIVE CHANGES APPLIED ---
        <div className="animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Manage Articles</h2>
            {/* Create New Article Form */}
            <form onSubmit={handleCreate} className="mb-8 p-4 sm:p-6 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Create New Article</h3>
                 <div className="space-y-4">
                    <input type="text" placeholder="Article Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-2 border border-gray-300 rounded"/>
                    <textarea placeholder="Article Content (supports multiple paragraphs if you press enter)" value={content} onChange={(e) => setContent(e.target.value)} required className="w-full p-2 border border-gray-300 rounded" rows="5"></textarea>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Header Image</label>
                        <input type="file" onChange={(e) => setFile(e.target.files[0])} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                    </div>
                    <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Create Article</button>
                </div>
            </form>
            
            {/* List of Existing Articles */}
            <div className="space-y-4">
                {articles.length > 0 ? articles.map(article => (
                    <div key={article._id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-white rounded-lg shadow">
                        <span className="font-medium text-gray-800 mb-2 sm:mb-0">{article.title}</span>
                        <button onClick={() => handleDelete(article._id)} className="text-red-600 hover:text-red-900 font-semibold self-end sm:self-center">Delete</button>
                    </div>
                )) : (
                    <p className="text-center text-gray-500">No articles created yet.</p>
                )}
            </div>
        </div>
    );
};

export default ManageArticles;


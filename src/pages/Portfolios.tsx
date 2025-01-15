import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye, ThumbsUp, Calendar, Trash2 } from 'lucide-react';
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

interface Portfolio {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileName: string;
  userName: string;
  createdAt: any;
  likes: number;
  views: number;
  storagePath: string;
}

export default function Portfolios() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const q = query(collection(db, 'portfolios'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const fetchedPortfolios = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Portfolio[];

        setPortfolios(fetchedPortfolios);
      } catch (err) {
        console.error('Error fetching portfolios:', err);
        setError('Failed to load portfolios');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const handleDelete = async (portfolio: Portfolio) => {
    try {
      // Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('portfolios')
        .remove([portfolio.storagePath]);

      if (storageError) {
        throw storageError;
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'portfolios', portfolio.id));

      // Update local state
      setPortfolios(portfolios.filter(p => p.id !== portfolio.id));
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      // Handle error appropriately
    }
  };

  const handleView = async (portfolio: Portfolio) => {
    try {
      await updateDoc(doc(db, 'portfolios', portfolio.id), {
        views: increment(1)
      });
      
      // Update local state
      setPortfolios(portfolios.map(p => 
        p.id === portfolio.id ? { ...p, views: p.views + 1 } : p
      ));
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Discover Portfolios</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <motion.div
              key={portfolio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                    {portfolio.category}
                  </span>
                  {user && user.uid === portfolio.userId && (
                    <button
                      onClick={() => handleDelete(portfolio)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <h2 className="text-xl font-bold mb-2">{portfolio.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {portfolio.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 text-sm">
                    By {portfolio.userName}
                  </span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-500">
                      <Eye className="h-4 w-4 mr-1" />
                      <span className="text-sm">{portfolio.views}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span className="text-sm">{portfolio.likes}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={portfolio.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleView(portfolio)}
                  className="w-full bg-black text-white rounded-lg py-2 px-4 hover:bg-gray-800 
                    transition flex items-center justify-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>View Portfolio</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {portfolios.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No portfolios found</p>
          </div>
        )}
      </div>
    </div>
  );
}
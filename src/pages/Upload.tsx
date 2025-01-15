import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, File, X, Loader } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';

interface FileWithPreview extends File {
  preview?: string;
}

export default function Upload() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Graphic Design',
    'Data Science',
    'Machine Learning',
    'Other'
  ];

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length || !title || !description || !category) {
      setError('Please fill in all fields and upload a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.uid}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolios')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolios')
        .getPublicUrl(fileName);

      // Add portfolio to Firestore
      const portfolioData = {
        title,
        description,
        category,
        fileUrl: publicUrl,
        fileName: file.name,
        fileType: file.type,
        userId: user?.uid,
        userEmail: user?.email,
        userName: user?.displayName,
        createdAt: serverTimestamp(),
        likes: 0,
        views: 0,
        storagePath: fileName // Store the path for future reference
      };

      await addDoc(collection(db, 'portfolios'), portfolioData);
      
      navigate('/portfolios');
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Failed to upload portfolio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
      >
        <h1 className="text-2xl font-bold mb-6">Upload Your Portfolio</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter portfolio title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
              placeholder="Describe your portfolio"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portfolio File
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
                ${files.length ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500'}`}
            >
              <input {...getInputProps()} />
              {files.length ? (
                <div className="flex items-center justify-center space-x-2">
                  <File className="h-6 w-6 text-green-500" />
                  <span className="text-green-600">{files[0].name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFiles([]);
                    }}
                    className="p-1 hover:bg-green-100 rounded-full"
                  >
                    <X className="h-4 w-4 text-green-500" />
                  </button>
                </div>
              ) : (
                <div>
                  <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    Drag & drop your portfolio file here, or click to select
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: PDF, DOC, DOCX
                  </p>
                </div>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg bg-black text-white font-medium
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'} 
              transition flex items-center justify-center space-x-2`}
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadIcon className="h-5 w-5" />
                <span>Upload Portfolio</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
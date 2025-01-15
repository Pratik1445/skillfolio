import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, Phone, MapPin, Edit2, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    profession: 'Senior UX Designer',
    bio: 'Passionate about creating intuitive and beautiful user experiences. Over 5 years of experience in digital product design.',
    age: 28,
    location: 'San Francisco, CA',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    skills: ['UI Design', 'User Research', 'Prototyping', 'Figma', 'Adobe XD'],
    interests: ['Design Systems', 'Accessibility', 'Mobile UX'],
  });

  const onDrop = (acceptedFiles: File[]) => {
    console.log(acceptedFiles);
    // Handle file upload logic here
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition"
            >
              <Edit2 className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          <div className="relative px-6 pb-6">
            <div className="flex flex-col items-center -mt-20">
              <img
                src="https://source.unsplash.com/random/200x200?portrait"
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <h1 className="mt-4 text-2xl font-bold">{profile.name}</h1>
              <p className="text-gray-600">{profile.profession}</p>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">About Me</h2>
                {isEditing ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-600">{profile.bio}</p>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">{profile.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">{profile.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">{profile.location}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Portfolio</h2>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition"
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">Drag and drop your portfolio here, or click to select files</p>
                <p className="text-sm text-gray-500 mt-2">Supported formats: PDF, DOC, DOCX</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
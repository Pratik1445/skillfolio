import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Upload, FileText } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  deadline: any;
  participants: string[];
  submissions: number;
  prize: string;
  rules?: string[];
}

export default function ChallengeSubmission() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!challengeId) return;
      
      try {
        const challengeDoc = await getDoc(doc(db, 'challenges', challengeId));
        if (challengeDoc.exists()) {
          setChallenge({ id: challengeDoc.id, ...challengeDoc.data() } as Challenge);
        }
      } catch (error) {
        console.error('Error fetching challenge:', error);
        setError('Failed to load challenge details');
      }
    };

    fetchChallenge();
  }, [challengeId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Check file type
      if (!selectedFile.type.includes('pdf') && !selectedFile.type.includes('document')) {
        setError('Please upload only PDF or DOC files');
        return;
      }
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user || !challengeId) return;

    setLoading(true);
    setError(null);

    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `challenge-submissions/${challengeId}/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update challenge document
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        participants: arrayUnion(user.uid),
        submissions: challenge!.submissions + 1,
        [`submissionUrls.${user.uid}`]: downloadURL,
      });

      setSuccess(true);
      setTimeout(() => navigate('/community'), 2000);
    } catch (error) {
      console.error('Error submitting challenge:', error);
      setError('Failed to submit challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!challenge) {
    return <div className="min-h-screen pt-24 px-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/community')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">{challenge.title}</h1>
          <p className="text-gray-600 mb-6">{challenge.description}</p>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Challenge Rules</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {challenge.rules?.map((rule, index) => (
                <li key={index}>{rule}</li>
              )) || (
                <>
                  <li>Submit your work in PDF or DOC format</li>
                  <li>File size should not exceed 5MB</li>
                  <li>Include a brief description of your approach</li>
                  <li>Submission deadline: {new Date(challenge.deadline?.toDate()).toLocaleDateString()}</li>
                  <li>One submission per participant</li>
                </>
              )}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Your Submission
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {file ? file.name : 'Click to upload PDF or DOC file'}
                  </span>
                </label>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-lg text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 rounded-lg text-green-600">
                Challenge submitted successfully! Redirecting...
              </div>
            )}

            <button
              type="submit"
              disabled={!file || loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                !file || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Challenge'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 
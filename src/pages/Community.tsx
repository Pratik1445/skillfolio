import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Users, 
  MessageSquare, 
  ThumbsUp,
  Eye,
  Calendar,
  Plus,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, updateDoc, doc, increment, limit, arrayUnion, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateCommunityModal from '../components/CreateCommunityModal';

interface Portfolio {
  id: string;
  title: string;
  description: string;
  userName: string;
  userId: string;
  likes: number;
  views: number;
  createdAt: any;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  deadline: any;
  participants: string[];
  submissions: number;
  prize: string;
}

interface SkillCommunity {
  id: string;
  name: string;
  description: string;
  members: string[];
  topics: string[];
  icon: string;
  createdBy?: string;
}

interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'accepted';
  createdAt: any;
}

const createInitialData = async () => {
  try {
    // Create sample challenges if none exist
    const challengesSnapshot = await getDocs(collection(db, 'challenges'));
    if (challengesSnapshot.empty) {
      const sampleChallenges = [
        {
          title: "Build a Portfolio Website",
          description: "Create a responsive portfolio website using React and Tailwind CSS",
          deadline: new Date("2024-02-01"),
          participants: [],
          submissions: 0,
          prize: "Featured Spotlight",
          createdAt: serverTimestamp()
        },
        {
          title: "Mobile App UI Challenge",
          description: "Design a modern mobile app interface using Figma or Adobe XD",
          deadline: new Date("2024-02-07"),
          participants: [],
          submissions: 0,
          prize: "Community Recognition",
          createdAt: serverTimestamp()
        }
      ];

      for (const challenge of sampleChallenges) {
        await addDoc(collection(db, 'challenges'), challenge);
      }
    }

    // Create sample communities if none exist
    const communitiesSnapshot = await getDocs(collection(db, 'skillCommunities'));
    if (communitiesSnapshot.empty) {
      const sampleCommunities = [
        {
          name: "Web Development",
          description: "Community for web developers to share knowledge and collaborate",
          members: [],
          topics: ["React", "JavaScript", "CSS", "Node.js"],
          icon: "code",
          createdAt: serverTimestamp()
        },
        {
          name: "UI/UX Design",
          description: "Share design tips, get feedback, and discuss latest trends",
          members: [],
          topics: ["UI Design", "UX Research", "Figma", "Design Systems"],
          icon: "layout",
          createdAt: serverTimestamp()
        },
        {
          name: "Mobile Development",
          description: "Mobile app developers sharing experiences and best practices",
          members: [],
          topics: ["React Native", "Flutter", "iOS", "Android"],
          icon: "smartphone",
          createdAt: serverTimestamp()
        }
      ];

      for (const community of sampleCommunities) {
        await addDoc(collection(db, 'skillCommunities'), community);
      }
    }
  } catch (error) {
    console.error('Error creating initial data:', error);
  }
};

export default function Community() {
  const { user } = useAuth();
  const [featuredPortfolio, setFeaturedPortfolio] = useState<Portfolio | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [communities, setCommunities] = useState<SkillCommunity[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchCommunityData = async () => {
      setLoading(true);
      try {
        // Create initial data if needed
        await createInitialData();

        // Fetch featured portfolio (most liked)
        const portfoliosQuery = query(
          collection(db, 'portfolios'),
          orderBy('likes', 'desc'),
          limit(1)
        );
        
        const portfolioSnapshot = await getDocs(portfoliosQuery);
        if (!portfolioSnapshot.empty) {
          setFeaturedPortfolio({
            id: portfolioSnapshot.docs[0].id,
            ...portfolioSnapshot.docs[0].data()
          } as Portfolio);
        }

        // Fetch active challenges with simpler query
        const challengesQuery = query(
          collection(db, 'challenges'),
          orderBy('deadline', 'asc'),
          limit(5)
        );
        
        const challengeSnapshot = await getDocs(challengesQuery);
        setChallenges(challengeSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Challenge[]);

        // Fetch skill communities
        const communitiesSnapshot = await getDocs(collection(db, 'skillCommunities'));
        setCommunities(communitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SkillCommunity[]);

        // Fetch user's connections
        const connectionsQuery = query(
          collection(db, 'connections'),
          where('userId', '==', user?.uid)
        );
        
        const connectionsSnapshot = await getDocs(connectionsQuery);
        setConnections(connectionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Connection[]);

      } catch (error) {
        console.error('Error fetching community data:', error);
        // Add user-friendly error message
        setError('Failed to load community data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [user]);

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) {
      setError('Please sign in to join challenges');
      return;
    }

    // Navigate to the challenge submission page
    navigate(`/challenge/${challengeId}/submit`);
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) {
      setError('Please sign in to join communities');
      return;
    }

    try {
      const communityRef = doc(db, 'skillCommunities', communityId);
      const communitySnap = await getDoc(communityRef);
      
      if (!communitySnap.exists()) {
        setError('Community not found');
        return;
      }

      const currentCommunity = communitySnap.data();

      // If not a member and clicking for the first time, join the community
      if (!currentCommunity.members?.includes(user.uid)) {
        await updateDoc(communityRef, {
          members: arrayUnion(user.uid)
        });

        // Update local state
        setCommunities(communities.map(community => 
          community.id === communityId 
            ? {
                ...community,
                members: [...(community.members || []), user.uid]
              }
            : community
        ));
      }

      // Always navigate to chat room
      navigate(`/community/${communityId}/chat`);
    } catch (error) {
      console.error('Error accessing community:', error);
      setError('Failed to access community. Please try again.');
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      await addDoc(collection(db, 'connections'), {
        userId: user?.uid,
        connectedUserId: userId,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Update local state
      setConnections([...connections, {
        id: 'temp',
        userId: user!.uid,
        connectedUserId: userId,
        status: 'pending',
        createdAt: new Date()
      }]);
    } catch (error) {
      console.error('Error connecting with user:', error);
    }
  };

  const handleCreateCommunity = async (communityData: { name: string; description: string; topics: string[] }) => {
    if (!user) {
      setError('Please sign in to create a community');
      return;
    }

    try {
      const newCommunity = {
        name: communityData.name,
        description: communityData.description,
        topics: communityData.topics,
        members: [user.uid],
        icon: '📚', // Default icon
        createdBy: user.uid,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'skillCommunities'), newCommunity);
      
      // Update local state with the new community
      const createdCommunity = {
        id: docRef.id,
        ...newCommunity,
        members: [user.uid], // Initialize members array
      };
      
      setCommunities(prev => [...prev, createdCommunity]);
      setSuccessMessage('Community created successfully!');
      setError(null);
      setIsCreateModalOpen(false); // Close the modal after successful creation
    } catch (error) {
      console.error('Error creating community:', error);
      setError('Failed to create community. Please try again.');
    }
  };

  const handleCreateChallenge = async (challengeData: Omit<Challenge, 'id'>) => {
    if (!user) {
      setError('Please sign in to create a challenge');
      return;
    }

    try {
      const newChallenge = {
        ...challengeData,
        participants: [user.uid],
        submissions: 0,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'challenges'), newChallenge);
      
      // Update local state
      setChallenges([...challenges, { id: docRef.id, ...newChallenge }] as Challenge[]);
      
      setSuccessMessage('Challenge created successfully!');
      setError(null);
    } catch (error) {
      console.error('Error creating challenge:', error);
      setError('Failed to create challenge. Please try again.');
    }
  };

  const handleDeleteCommunity = async (communityId: string) => {
    if (!user) {
      setError('Please sign in to delete communities');
      return;
    }

    try {
      const communityRef = doc(db, 'skillCommunities', communityId);
      const communitySnap = await getDoc(communityRef);
      
      if (!communitySnap.exists()) {
        setError('Community not found');
        return;
      }

      const communityData = communitySnap.data();
      
      // Check if user is the creator of the community
      if (communityData.createdBy !== user.uid) {
        setError('You can only delete communities you created');
        return;
      }

      // Delete the community
      await deleteDoc(communityRef);

      // Update local state
      setCommunities(communities.filter(community => community.id !== communityId));
      setSuccessMessage('Community deleted successfully!');
    } catch (error) {
      console.error('Error deleting community:', error);
      setError('Failed to delete community. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            {/* Add loading skeleton UI here */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg text-red-600">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg text-green-600">
            {successMessage}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Featured Portfolio */}
          {featuredPortfolio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <h2 className="text-xl font-bold">Featured Portfolio</h2>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{featuredPortfolio.title}</h3>
              <p className="text-gray-600 mb-4">{featuredPortfolio.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">By {featuredPortfolio.userName}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-500">
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="text-sm">{featuredPortfolio.views}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">{featuredPortfolio.likes}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Weekly Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-bold">Weekly Challenges</h2>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{challenge.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(challenge.deadline?.toDate()).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleJoinChallenge(challenge.id)}
                      disabled={challenge.participants?.includes(user?.uid)}
                      className={`px-4 py-1 rounded-full text-sm transition ${
                        challenge.participants?.includes(user?.uid)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      {challenge.participants?.includes(user?.uid) ? 'Joined' : 'Join Challenge'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skill Communities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-purple-500" />
                <h2 className="text-xl font-bold">Skill Communities</h2>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
              >
                <Plus className="h-4 w-4" />
                <span>Create Community</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {communities.map((community) => (
                <div
                  key={community.id}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{community.name}</h3>
                    {community.createdBy === user?.uid && (
                      <button
                        onClick={() => handleDeleteCommunity(community.id)}
                        className="text-red-500 hover:text-red-600"
                        title="Delete Community"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{community.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {community.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {community.members.length} members
                    </span>
                    <button
                      onClick={() => handleJoinCommunity(community.id)}
                      className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                    >
                      <span>
                        {community.members?.includes(user?.uid) ? 'Enter Chat' : 'Join'}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCommunity}
      />
    </div>
  );
}
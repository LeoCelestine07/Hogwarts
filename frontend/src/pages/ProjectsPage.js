import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ExternalLink, Zap } from 'lucide-react';
import axios from 'axios';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const workTypes = ['all', ...new Set(projects.map(p => p.work_type))];
  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.work_type === filter);

  return (
    <div className="relative min-h-screen" data-testid="projects-page">
      {/* Background */}
      <div className="fixed inset-0 bg-[#0a1a1f] -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 via-transparent to-teal-900/10" />
        <div className="absolute top-1/2 left-1/3 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[200px]" />
      </div>

      {/* Hero */}
      <section className="pt-40 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <span className="inline-block px-4 py-2 rounded-full glass border border-orange-500/30 text-xs uppercase tracking-[0.2em] text-orange-400 mb-6">
              Our Portfolio
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
              Featured<br />
              <span className="text-gradient">Projects</span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Explore our collection of completed works across films, music, documentaries, and multimedia productions.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mt-12"
          >
            {workTypes.map((type, index) => {
              const isActive = filter === type;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  data-testid={`filter-${type.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-black'
                      : 'glass border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  {type === 'all' ? 'All Projects' : type}
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Projects Grid - Bento Style */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`rounded-3xl glass animate-pulse ${i === 0 ? 'md:col-span-2 md:row-span-2 aspect-square' : 'aspect-[4/5]'}`} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px] md:auto-rows-[350px]">
              {filteredProjects.map((project, index) => {
                const isLarge = index === 0;
                const isOrange = index % 2 === 1;
                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`group relative overflow-hidden rounded-3xl border ${
                      isOrange ? 'border-orange-500/20' : 'border-teal-500/20'
                    } ${isLarge ? 'md:col-span-2 md:row-span-2' : ''}`}
                    data-testid={`project-card-${project.id}`}
                  >
                    {/* Project Image */}
                    <div className="absolute inset-0">
                      <img 
                        src={project.image_url} 
                        alt={project.name}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                        onError={(e) => {
                          e.target.src = `https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80`;
                        }}
                      />
                    </div>
                    
                    {/* Glass overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a1f] via-[#0a1a1f]/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    {/* Work type badge */}
                    <div className="absolute top-6 left-6">
                      <span className={`px-4 py-2 rounded-full glass-heavy border text-xs uppercase tracking-wider ${
                        isOrange ? 'border-orange-500/30 text-orange-400' : 'border-cyan-500/30 text-cyan-400'
                      }`}>
                        {project.work_type}
                      </span>
                    </div>

                    {/* Play button */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className={`w-16 h-16 rounded-full glass-heavy border flex items-center justify-center hover:scale-110 transition-transform cursor-pointer ${
                        isOrange ? 'border-orange-500/30' : 'border-cyan-500/30'
                      }`}>
                        <Play className={`w-6 h-6 ml-1 ${isOrange ? 'text-orange-400' : 'text-cyan-400'}`} />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                      <h3 className={`font-bold mb-2 group-hover:text-gradient transition-colors ${
                        isLarge ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'
                      }`}>
                        {project.name}
                      </h3>
                      <p className={`text-white/50 ${isLarge ? 'text-base' : 'text-sm'} line-clamp-2`}>
                        {project.description}
                      </p>
                      
                      <div className={`mt-4 flex items-center gap-2 text-sm text-white/40 group-hover:text-white/60 transition-colors`}>
                        <ExternalLink className="w-4 h-4" />
                        View Project
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {filteredProjects.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-white/40 text-lg">No projects found for this category.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: '50+', label: 'Projects Completed', color: 'cyan' },
              { value: '25+', label: 'Films Dubbed', color: 'orange' },
              { value: '100+', label: 'Hours Mixed', color: 'teal' },
              { value: '99%', label: 'Client Satisfaction', color: 'amber' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <span className="text-4xl md:text-5xl font-bold text-gradient">{stat.value}</span>
                <p className="text-white/40 text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProjectsPage;

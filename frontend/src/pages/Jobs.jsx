import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Trash2 } from 'lucide-react';

export default function Jobs({ user }) {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({ title: '', description: '', skillsRequired: '' });

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/jobs', newJob, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Job posted!');
      fetchJobs();
      setNewJob({ title: '', description: '', skillsRequired: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const token = localStorage.getItem('token');
        console.log('Deleting job:', jobId, 'with token:', !!token);
        const response = await axios.delete(`http://localhost:5000/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Delete response:', response.data);
        alert('Job deleted successfully!');
        fetchJobs();
      } catch (err) {
        console.error('Delete job error:', err.response?.data || err.message);
        alert(err.response?.data?.error || 'Failed to delete job: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold flex items-center space-x-2 text-slate-800"><Briefcase className="text-indigo-600"/> <span>Job & Internship Board</span></h2>
      
      {user.type === 'Alumni' && (
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold mb-4">Post an Opportunity</h3>
          <form onSubmit={handlePostJob} className="space-y-4">
            <input type="text" placeholder="Job Title" required className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
            <textarea placeholder="Description" required className="w-full px-4 py-2 border rounded-lg" value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} />
            <input type="text" placeholder="Skills Required (comma separated)" required className="w-full px-4 py-2 border rounded-lg focus:ring-2" value={newJob.skillsRequired} onChange={e => setNewJob({...newJob, skillsRequired: e.target.value})} />
            <button type="submit" className="primary-gradient px-6 py-2 rounded-lg font-medium">Post Job</button>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {jobs.map(job => (
          <div key={job.Job_ID} className="bg-white p-6 rounded-xl border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800">{job.Title}</h3>
                <p className="text-indigo-600 font-medium">{job.Company_Name}</p>
                <p className="mt-2 text-slate-600 whitespace-pre-line">{job.Description}</p>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">{job.Skills_Required}</span>
                  <span className="text-xs text-slate-400 font-medium">Posted by {job.Alumni_Name}</span>
                </div>
              </div>
              {user.type === 'Alumni' && job.Alumni_ID === user.id && (
                <button onClick={() => handleDeleteJob(job.Job_ID)} className="text-red-500 hover:text-red-700 ml-4 mt-1" title="Delete job posting">
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>
        ))}
        {jobs.length === 0 && <p className="text-slate-500">No jobs posted yet.</p>}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import axios from "axios";
import ProjectCard from "./ProjectCard";
import LoadingOverlay from "./LoadingOverlay";

const RecentProjects = () => {
  const [projects, setProjects] = useState([]);
  const [projectSubtasks, setProjectSubtasks] = useState({});
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecentProjectsAndRelated = async () => {
      setLoading(true);
      try {
        // 1) Fetch recent projects
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/statistics/recent-projects`
        );
        setProjects(res.data);

        // 2) Fetch subtasks for these projects
        const subtaskPromises = res.data.map((project) =>
          axios.get(
            `${process.env.REACT_APP_API_URL}/api/subtask/project/${project._id}`
          )
        );
        const subtaskResponses = await Promise.all(subtaskPromises);

        const subtasksMap = {};
        const allEmployeeIds = new Set();

        subtaskResponses.forEach((response, index) => {
          const projectId = res.data[index]._id;
          const subtasks = response.data;
          subtasksMap[projectId] = subtasks;

          // collect employee IDs
          subtasks.forEach((t) => {
            if (t.assign_to) allEmployeeIds.add(t.assign_to);
          });
        });
        setProjectSubtasks(subtasksMap);

        // 3) Fetch employee data if needed
        if (allEmployeeIds.size > 0) {
          const employeeRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/employee/get-multiple`,
            { params: { ids: Array.from(allEmployeeIds).join(",") } }
          );
          const empMap = {};
          employeeRes.data.forEach((e) => {
            empMap[e._id] = e;
          });
          setEmployees(empMap);
        }
      } catch (error) {
        console.error(
          "Error fetching recent projects / subtasks / employees:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProjectsAndRelated();
  }, []);

  if (loading) return <LoadingOverlay />;
  return (
    <div className="p-3 bg-white rounded-lg shadow-sm my-3 border border-gray-200">
      <div className="bg-white rounded-lg p-2 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Recent Projects
            </h1>
          </div>
        </div>
      </div>

      {/* reuse ProjectCard exactly like AllProject */}
      <ProjectCard
        filteredProjects={projects}
        projectSubtasks={projectSubtasks}
        employees={employees}
        loading={loading}
      />
    </div>
  );
};

export default RecentProjects;

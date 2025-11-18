const mongoose = require('mongoose');
const setupTestDB = require('../../../utils/setupTestDB');
const paginate = require('../../../../src/models/plugins/paginate.plugin');

const projectSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
});

projectSchema.plugin(paginate);
const Project = mongoose.model('Project', projectSchema);

const taskSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  project: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Project',
    required: true,
  },
});

taskSchema.plugin(paginate);
const Task = mongoose.model('Task', taskSchema);

setupTestDB();

async function createAndSave(Model, doc) {
  const instance = new Model(doc);
  await instance.save();
  return instance;
}

describe('paginate plugin', () => {
  describe('populate option', () => {
    test('should populate the specified data fields', async () => {
      const project = await createAndSave(Project, { name: 'Project One' });
      const task = await createAndSave(Task, { name: 'Task One', project: project._id });

      const taskPages = await Task.paginate({ _id: task._id }, { populate: 'project' });

      expect(taskPages.results[0].project).toHaveProperty('_id', project._id);
    });

    test('should populate nested fields', async () => {
      const project = await createAndSave(Project, { name: 'Project One' });
      const task = await createAndSave(Task, { name: 'Task One', project: project._id });

      const projectPages = await Project.paginate({ _id: project._id }, { populate: 'tasks.project' });
      const { tasks } = projectPages.results[0];

      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toHaveProperty('_id', task._id);
      expect(tasks[0].project).toHaveProperty('_id', project._id);
    });

    test('should populate multiple fields', async () => {
      const project = await createAndSave(Project, { name: 'Project One' });
      const task = await createAndSave(Task, { name: 'Task One', project: project._id });

      const taskPages = await Task.paginate({ _id: task._id }, { populate: 'project,project' });

      expect(taskPages.results[0].project).toHaveProperty('_id', project._id);
    });

    test('should populate deeply nested fields', async () => {
      const project = await createAndSave(Project, { name: 'Project One' });
      const task = await createAndSave(Task, { name: 'Task One', project: project._id });

      const projectPages = await Project.paginate({ _id: project._id }, { populate: 'tasks.project.tasks' });

      expect(projectPages.results[0].tasks[0].project).toHaveProperty('_id', project._id);
    });

    test('should not throw an error when populate option is invalid', async () => {
      const project = await createAndSave(Project, { name: 'Project One' });
      const task = await createAndSave(Task, { name: 'Task One', project: project._id });

      const taskPages = await Task.paginate({ _id: task._id }, { populate: 'invalid' });

      expect(taskPages.results[0]).not.toHaveProperty('invalid');
    });

    test('should return results without populated fields when populate option is empty', async () => {
      const project = await createAndSave(Project, { name: 'Project One' });
      const task = await createAndSave(Task, { name: 'Task One', project: project._id });

      const taskPages = await Task.paginate({ _id: task._id }, { populate: '' });

      // Check if _id exists on project (it shouldn't if not populated)
      expect(taskPages.results[0].project).toBeUndefined();
    });

    test('should handle non-existent fields in populate option', async () => {
      const project = await createAndSave(Project, { name: 'Project One' });
      const task = await createAndSave(Task, { name: 'Task One', project: project._id });

      const taskPages = await Task.paginate({ _id: task._id }, { populate: 'project.nonExistentField' });

      expect(taskPages.results[0].project).toBeDefined();
    });
  });

  describe('sortBy option', () => {
    beforeEach(async () => {
      // Create and save each project individually
      await createAndSave(Project, { name: 'Project C' });
      await createAndSave(Project, { name: 'Project A' });
      await createAndSave(Project, { name: 'Project B' });
    });

    test('should sort by a single column (default order)', async () => {
      const projectPages = await Project.paginate({}, { sortBy: 'name' });

      expect(projectPages.results).toHaveLength(3);
      expect(projectPages.results[0].name).toBe('Project A');
      expect(projectPages.results[1].name).toBe('Project B');
      expect(projectPages.results[2].name).toBe('Project C');
    });

    test('should sort by a single column in ascending order', async () => {
      const projectPages = await Project.paginate({}, { sortBy: 'name:asc' });

      expect(projectPages.results).toHaveLength(3);
      expect(projectPages.results[0].name).toBe('Project A');
      expect(projectPages.results[1].name).toBe('Project B');
      expect(projectPages.results[2].name).toBe('Project C');
    });

    test('should sort by a single column in descending order', async () => {
      const projectPages = await Project.paginate({}, { sortBy: 'name:desc' });

      expect(projectPages.results).toHaveLength(3);
      expect(projectPages.results[0].name).toBe('Project C');
      expect(projectPages.results[1].name).toBe('Project B');
      expect(projectPages.results[2].name).toBe('Project A');
    });

    test('should sort by multiple columns', async () => {
      const projectPages = await Project.paginate({}, { sortBy: 'name:desc,createdAt:asc' });

      expect(projectPages.results).toHaveLength(3);
      expect(projectPages.results[0].name).toBe('Project C');
      expect(projectPages.results[1].name).toBe('Project B');
      expect(projectPages.results[2].name).toBe('Project A');
    });

    test('should not sort if sortBy option is empty', async () => {
      const projectPages = await Project.paginate({}, { sortBy: '' });

      expect(projectPages.results).toHaveLength(3);
    });
  });

  describe('limit option', () => {
    beforeEach(async () => {
      // Create and save each project individually
      await createAndSave(Project, { name: 'Project One' });
      await createAndSave(Project, { name: 'Project Two' });
      await createAndSave(Project, { name: 'Project Three' });
    });

    test('should limit the number of results', async () => {
      const projectPages = await Project.paginate({}, { limit: 2 });

      expect(projectPages.results).toHaveLength(2);
      expect(projectPages.totalResults).toBe(3);
    });

    test('should set the limit to the default value if limit is not specified', async () => {
      const projectPages = await Project.paginate({});

      expect(projectPages.results).toHaveLength(3);
      expect(projectPages.limit).toBe(10);
      expect(projectPages.totalResults).toBe(3);
    });

    test('should set the limit to the default value if limit is not a number', async () => {
      const projectPages = await Project.paginate({}, { limit: 'abc' });

      expect(projectPages.results).toHaveLength(3);
      expect(projectPages.limit).toBe(10);
      expect(projectPages.totalResults).toBe(3);
    });

    test('should set the limit to the default value if limit is less than or equal to 0', async () => {
      const projectPages = await Project.paginate({}, { limit: -1 });

      expect(projectPages.results).toHaveLength(3);
      expect(projectPages.limit).toBe(10);
      expect(projectPages.totalResults).toBe(3);
    });
  });

  describe('page option', () => {
    beforeEach(async () => {
      // Create and save each project individually
      await createAndSave(Project, { name: 'Project One' });
      await createAndSave(Project, { name: 'Project Two' });
      await createAndSave(Project, { name: 'Project Three' });
      await createAndSave(Project, { name: 'Project Four' });
      await createAndSave(Project, { name: 'Project Five' });
    });

    test('should return the correct page', async () => {
      const projectPages = await Project.paginate({}, { limit: 2, page: 2 });

      expect(projectPages.results).toHaveLength(2);
      expect(projectPages.page).toBe(2);
    });

    test('should set the page to the default value if page is not specified', async () => {
      const projectPages = await Project.paginate({});

      expect(projectPages.results).toHaveLength(5);
      expect(projectPages.page).toBe(1);
    });

    test('should set the page to the default value if page is not a number', async () => {
      const projectPages = await Project.paginate({}, { page: 'abc' });

      expect(projectPages.results).toHaveLength(5);
      expect(projectPages.page).toBe(1);
    });

    test('should set the page to the default value if page is less than or equal to 0', async () => {
      const projectPages = await Project.paginate({}, { page: -1 });

      expect(projectPages.results).toHaveLength(5);
      expect(projectPages.page).toBe(1);
    });
  });
});

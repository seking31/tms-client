import { Routes, Route } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ListTasksComponent } from './tasks/list-tasks/list-tasks.component';
import { TaskAddComponent } from './tasks/task-add/task-add.component';
import { TaskFindComponent } from './tasks/find-tasks/find-tasks.component';
import { ReadTaskComponent } from './tasks/read-tasks/read-task.component';
import { ListProjectsComponent } from './projects/list-projects/list-projects.component';
import { TaskUpdateComponent } from './tasks/task-update/task-update.component';
import { DeleteTaskComponent } from './tasks/delete-task/delete-task.component';
import { AddProjectsComponent } from './projects/add-projects/add-projects.component';
import { ProjectUpdateComponent } from './projects/update-project/update-project.component';
import { DeleteProjectComponent } from './projects/delete-project/delete-project.component';
import { ProjectFindComponent } from './projects/find-projects/find-projects.component';

// Lazy-load the MainLayout which contains the aside navigation
const loadMainLayout = () =>
  import('./layouts/main-layout/main-layout.component').then(
    (m) => m.MainLayoutComponent
  );

// Routes that render WITHOUT the aside
const baseRoutes: Route = { path: '', component: HomeComponent };

// Routes that render WITH the aside (tasks and projects only)
const layoutRoutes: Route = {
  path: '',
  loadComponent: loadMainLayout,
  children: [
    // Tasks
    { path: 'task-list', component: ListTasksComponent },
    { path: 'tasks', redirectTo: 'task-list', pathMatch: 'full' },
    { path: 'tasks/add', component: TaskAddComponent },
    { path: 'tasks/search', component: TaskFindComponent },
    { path: 'tasks/read', component: ReadTaskComponent },
    { path: 'tasks/update', component: TaskUpdateComponent },
    { path: 'tasks/delete', component: DeleteTaskComponent },

    // Projects (placeholder children can be added later)
    {
      path: 'projects',
      children: [
        { path: 'projects-list', component: ListProjectsComponent },
        { path: 'project-update', component: ProjectUpdateComponent },
        { path: 'projects-add', component: AddProjectsComponent },
        { path: 'projects-delete', component: DeleteProjectComponent },
        { path: 'projects-find', component: ProjectFindComponent },
      ],
    },
  ],
};

export const routes: Routes = [
  baseRoutes,
  layoutRoutes,
  { path: '**', redirectTo: '' },
];

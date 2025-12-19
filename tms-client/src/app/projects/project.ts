import { Component } from '@angular/core';

export interface Project {
  _id: string;
  projectId: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  dateCreated?: string;
  dateModified?: string;
}
export type UpdateProjectDTO = Omit<
  Project,
  '_id' | 'projectId' | 'dateCreated' | 'dateModified'
>;

export type AddProjectDTO = Omit<Project, '_id' | 'dateModified' | 'projectId'>;

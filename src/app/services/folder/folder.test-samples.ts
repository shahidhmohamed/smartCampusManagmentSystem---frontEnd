import { IFolder, NewFolder } from './folder.model';

export const sampleWithRequiredData: IFolder = {
  id: '68f12cc3-4acd-4d50-b1a0-65ffcfdf5ad0',
};

export const sampleWithPartialData: IFolder = {
  id: 'b7ce8b41-f370-44e6-b144-4f4ba8c4642c',
  name: 'solidly briefly lounge',
  createdBy: 'joyous furthermore briefly',
  modifiedAt: 'celebrate amid',
};

export const sampleWithFullData: IFolder = {
  id: '57db9fd7-fc1b-45a2-92e6-68f09fd95e4f',
  name: 'amid',
  createdBy: 'against barracks furthermore',
  createdAt: 'riser unless',
  modifiedAt: 'readily',
  parentId: 'aha',
};

export const sampleWithNewData: NewFolder = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
